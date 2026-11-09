/**
 * Integración con las APIs de Google Gemini y OpenAI
 * Soporta auto-detección de proveedor, modelos Flash y control robusto de tokens.
 */

class OpenAIService {
  constructor(configManager) {
    this.configManager = configManager;
  }

  /**
   * Envía la conversación a Gemini u OpenAI según la clave y modelo
   * @param {Array<{role: string, content: string}>} history - Historial de conversación
   * @returns {Promise<string>}
   */
  async sendMessage(history) {
    const config = this.configManager.state;
    const apiKey = config.apiKey ? config.apiKey.trim() : '';

    // Si no hay API key, generamos una respuesta de simulación inteligente para la demo
    if (!apiKey) {
      return this.generateMockResponse(history, config);
    }

    const isGemini = apiKey.startsWith('AIza') || (config.model && config.model.includes('gemini'));

    if (isGemini) {
      return this.sendToGemini(history, apiKey, config);
    } else {
      return this.sendToOpenAI(history, apiKey, config);
    }
  }

  /**
   * Llamada a la API nativa de Google Gemini (Gemini 3.8 Flash)
   */
  async sendToGemini(history, apiKey, config) {
    const systemPrompt = this.configManager.getSystemPrompt();
    const primaryModel = 'gemini-3.8-flash';
    const fallbackModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    const modelsToTry = [primaryModel, ...fallbackModels];

    // Preparar historial compatible con Gemini:
    // 1. Debe comenzar siempre con un mensaje del 'user'.
    // 2. Si el primer mensaje fue el saludo inicial del bot, lo excluimos del envío a la API
    //    para no romper la alternancia requerida (user -> model -> user -> model).
    let filteredHistory = [...history];
    while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
      filteredHistory.shift();
    }

    // Si por alguna razón queda vacío, agregar un saludo inicial del usuario
    if (filteredHistory.length === 0) {
      filteredHistory = [{ role: 'user', content: 'Hola' }];
    }

    const contents = filteredHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    let lastError = null;

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.7
              // Sin límite de tokens (maxOutputTokens removido) para que el modelo nunca se corte
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];

          if (candidate?.content?.parts) {
            // Filtrar partes de razonamiento interno (thought) y extraer el texto visible final
            const textParts = candidate.content.parts
              .filter(p => !p.thought && p.text)
              .map(p => p.text);

            let botReply = textParts.join('').trim();

            // Si vino en una sola parte estándar
            if (!botReply && candidate.content.parts[0]?.text) {
              botReply = candidate.content.parts[candidate.content.parts.length - 1].text.trim();
            }

            if (botReply) {
              return botReply;
            }
          }
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Error HTTP ${response.status}: ${response.statusText}`;

        // Si el modelo específico aún no está registrado públicamente en ese endpoint (404), prueba la siguiente versión Flash
        if (response.status === 404 || errorMsg.includes('not found') || errorMsg.includes('is not supported')) {
          continue;
        }

        if (response.status === 400 || response.status === 403) {
          throw new Error('API Key de Google Gemini inválida o sin permisos. Revísala en Google AI Studio (aistudio.google.com).');
        } else if (response.status === 429) {
          throw new Error('Límite de solicitudes alcanzado en Gemini. Espera unos segundos y vuelve a intentar.');
        } else {
          throw new Error(`Gemini: ${errorMsg}`);
        }
      } catch (err) {
        lastError = err;
        if (!err.message?.includes('not found') && !err.message?.includes('404')) {
          throw err;
        }
      }
    }

    throw lastError || new Error('No se pudo conectar con el modelo Gemini.');
  }

  /**
   * Llamada a OpenAI Chat Completions (fallback para claves sk-...)
   */
  async sendToOpenAI(history, apiKey, config) {
    const systemPrompt = this.configManager.getSystemPrompt();
    const model = (config.model && config.model.includes('gpt')) ? config.model : 'gpt-4o-mini';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `Error HTTP ${response.status}: ${response.statusText}`;

        if (response.status === 401) {
          throw new Error('API Key de OpenAI inválida o vencida. Por favor revísala en el Panel de Configuración.');
        } else if (response.status === 429) {
          throw new Error('Límite de cuota o rate limit excedido en OpenAI. Verifica tus créditos en platform.openai.com.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content?.trim();

      if (!botReply) {
        throw new Error('La respuesta de OpenAI llegó vacía.');
      }

      return botReply;
    } catch (error) {
      console.error('Error en llamada a OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Fallback de respuesta simulada si no se ha configurado API key aún.
   */
  async generateMockResponse(history, config) {
    await new Promise(res => setTimeout(res, 1100));

    const lastUserMessage = history[history.length - 1]?.content?.toLowerCase() || '';

    if (lastUserMessage.includes('precio') || lastUserMessage.includes('costo') || lastUserMessage.includes('plan') || lastUserMessage.includes('cuanto')) {
      return `¡Hola! Con mucho gusto te informo sobre nuestros precios y planes en *${config.businessName}*. 🚀\n\n¿Te gustaría que agendemos una breve videollamada de 10 minutos para evaluar tu caso específico?`;
    }

    if (lastUserMessage.includes('hola') || lastUserMessage.includes('buenas') || lastUserMessage.includes('buenos')) {
      return `¡Hola! 👋 Qué gusto saludarte. Soy el asistente virtual de *${config.businessName}*.\n¿En qué podemos asesorarte el día de hoy?`;
    }

    if (lastUserMessage.includes('horario') || lastUserMessage.includes('donde') || lastUserMessage.includes('ubicacion') || lastUserMessage.includes('direccion')) {
      return `¡Con todo gusto! Atendemos de forma continua y personalizada en *${config.businessName}*. 📍🕒\n\n¿Te gustaría programar una cita o visita guiada?`;
    }

    return `¡Excelente consulta! En *${config.businessName}* nos encargamos de brindarte la mejor atención personalizada. ✨\n\n*(Nota Demo: Pega tu API Key de Gemini en "Ajustes" para respuestas 100% en vivo).* ¿Deseas coordinar con un asesor humano?`;
  }
}

// Registro global para navegador
window.WaSimulator = window.WaSimulator || {};
window.WaSimulator.OpenAIService = OpenAIService;
