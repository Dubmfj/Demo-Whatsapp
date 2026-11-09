/**
 * Integración con las APIs de Google Gemini y OpenAI
 * Soporta auto-detección de proveedor y fallback inteligente para demostraciones.
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
   * Llamada a la API nativa de Google Gemini (Google AI Studio)
   */
  async sendToGemini(history, apiKey, config) {
    const systemPrompt = this.configManager.getSystemPrompt();
    const model = (config.model && config.model.includes('gemini')) ? config.model : 'gemini-1.5-flash';

    // Mapear historial al formato de Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

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
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Error HTTP ${response.status}: ${response.statusText}`;

        if (response.status === 400 || response.status === 403) {
          throw new Error('API Key de Google Gemini inválida o sin permisos. Revísala en Google AI Studio (aistudio.google.com).');
        } else if (response.status === 429) {
          throw new Error('Límite de solicitudes alcanzado en Gemini. Espera unos segundos y vuelve a intentar.');
        } else {
          throw new Error(`Gemini: ${errorMsg}`);
        }
      }

      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!botReply) {
        throw new Error('La respuesta de Gemini llegó vacía.');
      }

      return botReply;
    } catch (error) {
      console.error('Error en llamada a Google Gemini:', error);
      throw error;
    }
  }

  /**
   * Llamada a OpenAI Chat Completions
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
          temperature: 0.7,
          max_tokens: 300
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
    // Simular latencia de red y razonamiento humano (1.1 segundos)
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

    return `¡Excelente consulta! En *${config.businessName}* nos encargamos de brindarte la mejor solución a medida. ✨\n\n*(Nota Demo: Pega tu API Key de Gemini u OpenAI en "Ajustes" para respuestas con IA en vivo).* ¿Deseas coordinar con un asesor?`;
  }
}

// Registro global para navegador
window.WaSimulator = window.WaSimulator || {};
window.WaSimulator.OpenAIService = OpenAIService;
