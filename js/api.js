/**
 * Integración con la API de OpenAI y fallback inteligente para demostraciones.
 */

class OpenAIService {
  constructor(configManager) {
    this.configManager = configManager;
  }

  /**
   * Envía la conversación a OpenAI Chat Completions
   * @param {Array<{role: string, content: string}>} history - Historial de conversación
   * @returns {Promise<string>}
   */
  async sendMessage(history) {
    const config = this.configManager.state;
    const apiKey = config.apiKey ? config.apiKey.trim() : '';

    // Si no hay API key, generamos una respuesta de simulación inteligente para no romper la demo comercial
    if (!apiKey) {
      return this.generateMockResponse(history, config);
    }

    const systemPrompt = this.configManager.getSystemPrompt();
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
          model: config.model || 'gpt-4o-mini',
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
        throw new Error('La respuesta de la IA llegó vacía.');
      }

      return botReply;
    } catch (error) {
      console.error('Error en llamada a OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Fallback de respuesta simulada si no se ha configurado API key aún.
   * Permite que la demo comercial funcione inmediatamente en cualquier computadora sin fricciones.
   */
  async generateMockResponse(history, config) {
    // Simular latencia de red y razonamiento humano (1.2 segundos)
    await new Promise(res => setTimeout(res, 1200));

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

    return `¡Excelente consulta! En *${config.businessName}* nos encargamos de brindarte la mejor solución a medida. ✨\n\n*(Nota Demo: Ingresa tu OpenAI API Key en "Configurar Demo" para respuestas con GPT-4o-mini en vivo).* ¿Deseas que coordinemos con un asesor comercial?`;
  }
}

// Registro global para navegador
window.WaSimulator = window.WaSimulator || {};
window.WaSimulator.OpenAIService = OpenAIService;
