/**
 * Configuración y Persistencia de la Aplicación
 * Administra el estado del negocio, credenciales y plantillas para demos comerciales.
 */

const PRESET_TEMPLATES = {
  avior: {
    name: "Avior AI Solutions",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    context: `EMPRESA: Avior AI Solutions - Expertos en Automatización y Agentes Inteligentes con IA para Empresas.

SERVICIOS Y PLANES:
1. Agente WhatsApp Starter ($299 USD/mes):
   - Atención al cliente 24/7 y respuestas a preguntas frecuentes.
   - Hasta 1,000 conversaciones mensuales.
2. Agente WhatsApp Growth ($499 USD/mes):
   - Calificación automática de prospectos (leads).
   - Agendamiento directo en Google Calendar o Calendly.
   - Sincronización con CRM (HubSpot, Notion o Sheets).
3. Agente WhatsApp Enterprise (Desde $899 USD/mes):
   - Integración con base de datos propia, pasarelas de pago y soporte prioritario.

HORARIOS Y UBICACIÓN:
- Atención virtual: 24/7.
- Soporte de ingenieros: Lunes a Viernes de 9:00 AM a 6:00 PM (GMT-5).
- Oficinas principales: Hub Tecnológico Scroll Studios. Atendemos a clientes en toda Latinoamérica, USA y España.

PREGUNTAS FRECUENTES (FAQs):
- ¿Cuánto tarda la instalación? Menos de 48 horas sin perder tu número actual.
- ¿Reemplaza a mi equipo? No, filtra preguntas repetitivas y transfiere a humanos cuando el cliente lo requiere.
- ¿Cómo agendar una reunión? Déjanos tu correo y teléfono para enviarte el enlace de reunión con un especialista comercial.`
  },

  clinica: {
    name: "Clínica Dental Sonrisas",
    avatar: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=300&q=80",
    context: `EMPRESA: Clínica Dental Sonrisas Especializadas.

SERVICIOS Y PRECIOS:
- Consulta y Diagnóstico Digital con Cámara Intraoral: Gratis en primera visita.
- Limpieza Dental Profunda con Ultrasonido: $35 USD.
- Blanqueamiento Láser LED (1 sesión): $120 USD.
- Ortodoncia Invisible / Brackets: Evaluaciones personalizadas desde $650 USD (financiamiento en cuotas).
- Implantes Dentales de Titanio: Desde $450 USD.

HORARIO DE ATENCIÓN:
- Lunes a Sábado: 8:30 AM a 7:30 PM.
- Domingos: Solo urgencias con previa confirmación.

DIRECCIÓN:
- Av. Primavera 1250, Piso 3, Consultorio 302. Contamos con estacionamiento gratuito para pacientes.

AGENDAMIENTO:
- Para agendar cita solicitamos: Nombre completo, número de teléfono y motivo de la consulta.`
  },

  inmobiliaria: {
    name: "Inmobiliaria Prime Homes",
    avatar: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80",
    context: `EMPRESA: Inmobiliaria Prime Homes - Departamentos y Residencias de Alta Gama.

PROYECTOS DESTACADOS:
1. Proyecto "Alborada Park" (Entrega Inmediata):
   - Departamentos de 2 y 3 habitaciones (75m² a 110m²).
   - Precios desde $135,000 USD.
   - Áreas comunes: Piscina infinita, zona BBQ, coworking y gimnasio equipado.
2. Proyecto "Skyline Tower" (En preventa - Entrega Dic 2026):
   - Lofts y penthouses ejecutivos desde $98,000 USD.
   - Bono especial de descuento de $5,000 USD para reservas este mes.

UBICACIÓN Y VISITAS:
- Sala de Ventas: Malecón Balta 450. Abierto de Lunes a Domingo de 10:00 AM a 6:30 PM.
- Brindamos asesoría para crédito hipotecario con todos los bancos.
- Para coordinar visita guiada requerimos nombre del cliente y horario de preferencia.`
  },

  restaurante: {
    name: "Restaurante Fuego & Sazón",
    avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
    context: `EMPRESA: Restaurante & Bar Fuego & Sazón - Cocina Fusión y Cortes a la Leña.

PLATOS DESTACADOS Y PRECIOS:
- Bife Angosto Premium 400g con papas rústicas: $28 USD.
- Hamburguesa Trufada con queso brie: $16 USD.
- Ceviche Clásico de Pesca del Día: $19 USD.
- Cócteles de autor (Gin Tonic Botánico, Pisco Sour Catedral): $9 USD (2x1 en Happy Hour de 5:00 a 8:00 PM).

HORARIOS:
- Martes a Domingo: 12:30 PM a 11:30 PM. (Lunes cerrado por mantenimiento).

DIRECCIÓN Y RESERVAS:
- Calle Las Flores 280.
- Reservas para más de 4 personas requieren anticipación mínima de 2 horas.`
  }
};

const STORAGE_KEYS = {
  BUSINESS_NAME: 'wa_sim_business_name',
  AVATAR_URL: 'wa_sim_avatar_url',
  CONTEXT: 'wa_sim_context',
  API_KEY: 'wa_sim_openai_key',
  MODEL: 'wa_sim_model',
  SOUND_ENABLED: 'wa_sim_sound_enabled'
};

class ConfigManager {
  constructor() {
    this.state = this.loadConfig();
  }

  loadConfig() {
    return {
      // Los datos del negocio son temporales por sesión (sessionStorage).
      // Cada vez que un usuario nuevo entra o abre el enlace, SIEMPRE verá la demo oficial de Avior AI.
      businessName: sessionStorage.getItem(STORAGE_KEYS.BUSINESS_NAME) || PRESET_TEMPLATES.avior.name,
      avatarUrl: sessionStorage.getItem(STORAGE_KEYS.AVATAR_URL) || PRESET_TEMPLATES.avior.avatar,
      context: sessionStorage.getItem(STORAGE_KEYS.CONTEXT) || PRESET_TEMPLATES.avior.context,
      // La API key se guarda de forma segura únicamente en el localStorage privado de tu dispositivo
      apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
      model: 'gemini-3.8-flash',
      soundEnabled: localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false'
    };
  }

  saveConfig(newConfig) {
    this.state = { ...this.state, ...newConfig };
    // Guardar datos del negocio solo en sessionStorage (se borran al cerrar la pestaña)
    if (newConfig.businessName !== undefined) sessionStorage.setItem(STORAGE_KEYS.BUSINESS_NAME, newConfig.businessName);
    if (newConfig.avatarUrl !== undefined) sessionStorage.setItem(STORAGE_KEYS.AVATAR_URL, newConfig.avatarUrl);
    if (newConfig.context !== undefined) sessionStorage.setItem(STORAGE_KEYS.CONTEXT, newConfig.context);
    
    // Credencial de API opcional en localStorage de este navegador
    if (newConfig.apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, newConfig.apiKey);
    if (newConfig.model !== undefined) localStorage.setItem(STORAGE_KEYS.MODEL, newConfig.model);
    if (newConfig.soundEnabled !== undefined) localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(newConfig.soundEnabled));
    return this.state;
  }

  resetToDefault() {
    sessionStorage.removeItem(STORAGE_KEYS.BUSINESS_NAME);
    sessionStorage.removeItem(STORAGE_KEYS.AVATAR_URL);
    sessionStorage.removeItem(STORAGE_KEYS.CONTEXT);
    this.state.businessName = PRESET_TEMPLATES.avior.name;
    this.state.avatarUrl = PRESET_TEMPLATES.avior.avatar;
    this.state.context = PRESET_TEMPLATES.avior.context;
    return this.state;
  }

  loadPreset(presetKey) {
    const preset = PRESET_TEMPLATES[presetKey];
    if (!preset) return null;

    return this.saveConfig({
      businessName: preset.name,
      avatarUrl: preset.avatar,
      context: preset.context
    });
  }

  getSystemPrompt() {
    return `Eres el asistente virtual por WhatsApp de ${this.state.businessName}. Tu objetivo es atender clientes, responder dudas y agendar citas.
REGLAS:
- Responde en tono amigable, vendedor y conciso (máximo 2 a 3 oraciones por mensaje).
- Usa la siguiente información del negocio como única verdad:
"""
${this.state.context}
"""
- Si preguntan algo fuera de este contexto, indica amablemente que un asesor humano coordinará ese detalle.
- Usa emojis de forma natural y estilo chat de WhatsApp.`;
  }
}

// Registro global para ejecución directa en navegador (file:/// y http://)
window.WaSimulator = window.WaSimulator || {};
window.WaSimulator.ConfigManager = ConfigManager;
window.WaSimulator.PRESET_TEMPLATES = PRESET_TEMPLATES;
