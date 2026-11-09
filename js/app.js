/**
 * Aplicación Principal - Orquestador y Controladores de Eventos
 */

document.addEventListener('DOMContentLoaded', () => {
  const { ConfigManager, PRESET_TEMPLATES, OpenAIService, ChatUI } = window.WaSimulator;

  // Inicialización de módulos
  const configManager = new ConfigManager();
  const openAIService = new OpenAIService(configManager);

  // Elementos DOM
  const chatMessagesContainer = document.getElementById('chatMessages');
  const typingHeaderStatus = document.getElementById('headerStatus');
  const businessNameHeader = document.getElementById('businessName');
  const businessAvatar = document.getElementById('businessAvatar');

  const chatUI = new ChatUI(chatMessagesContainer, typingHeaderStatus);

  // Elementos del Input de Chat
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const micButton = document.getElementById('micButton');
  const emojiTrigger = document.getElementById('emojiTrigger');
  const emojiBar = document.getElementById('emojiBar');

  // Elementos del Drawer / Configuración
  const configDrawer = document.getElementById('configDrawer');
  const configBackdrop = document.getElementById('configBackdrop');
  const openConfigBtn = document.getElementById('openConfigBtn');
  const closeConfigBtn = document.getElementById('closeConfigBtn');
  const configForm = document.getElementById('configForm');

  const inputBusinessName = document.getElementById('cfgBusinessName');
  const inputAvatarUrl = document.getElementById('cfgAvatarUrl');
  const inputAvatarFile = document.getElementById('cfgAvatarFile');
  const avatarPreview = document.getElementById('cfgAvatarPreview');
  const inputContext = document.getElementById('cfgContext');
  const inputApiKey = document.getElementById('cfgApiKey');
  const toggleKeyVisibilityBtn = document.getElementById('toggleKeyVisibility');
  const presetSelector = document.getElementById('cfgPresetSelector');
  const resetChatBtn = document.getElementById('resetChatBtn');
  const resetDefaultDemoBtn = document.getElementById('resetDefaultDemoBtn');

  // Estado local de la conversación en memoria
  let conversationHistory = [];
  let isSending = false;

  /**
   * Sincroniza la UI con la configuración almacenada
   */
  function syncUIWithConfig() {
    const cfg = configManager.state;
    businessNameHeader.textContent = cfg.businessName;
    businessAvatar.src = cfg.avatarUrl;

    inputBusinessName.value = cfg.businessName;
    inputAvatarUrl.value = cfg.avatarUrl.startsWith('data:') ? '' : cfg.avatarUrl;
    avatarPreview.src = cfg.avatarUrl;
    inputContext.value = cfg.context;
    inputApiKey.value = cfg.apiKey;
  }

  /**
   * Inicia o reinicia la conversación con el mensaje de bienvenida
   */
  function startConversation() {
    conversationHistory = [];
    chatUI.renderHeaderNotices();

    const welcomeMsg = `¡Hola! 👋 Bienvenido a *${configManager.state.businessName}*.\n¿En qué podemos ayudarte el día de hoy?`;
    chatUI.appendMessage('bot', welcomeMsg);
    conversationHistory.push({ role: 'assistant', content: welcomeMsg });
  }

  /**
   * Envía el mensaje del usuario y consulta al agente con IA
   */
  async function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text || isSending) return;

    isSending = true;
    messageInput.value = '';
    updateInputState();

    // 1. Mostrar mensaje del cliente en UI y agregarlo a historial
    chatUI.appendMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    // 2. Activar animación de "escribiendo..."
    chatUI.setTyping(true);

    try {
      // 3. Petición a OpenAI con el System Prompt dinámico
      const botResponse = await openAIService.sendMessage(conversationHistory);

      // 4. Renderizar respuesta del bot
      chatUI.setTyping(false);
      chatUI.appendMessage('bot', botResponse);
      conversationHistory.push({ role: 'assistant', content: botResponse });
    } catch (error) {
      chatUI.setTyping(false);
      const errorMsg = `⚠️ *Aviso del Sistema:* ${error.message}`;
      chatUI.appendMessage('bot', errorMsg);
    } finally {
      isSending = false;
      messageInput.focus();
    }
  }

  /**
   * Controla el estado del botón enviar / micrófono según si hay texto escrito
   */
  function updateInputState() {
    const hasText = messageInput.value.trim().length > 0;
    if (hasText) {
      sendButton.classList.remove('hidden');
      micButton.classList.add('hidden');
    } else {
      sendButton.classList.add('hidden');
      micButton.classList.remove('hidden');
    }
  }

  // --- Manejo del Drawer de Configuración ---
  function openConfig() {
    syncUIWithConfig();
    configDrawer.classList.remove('translate-x-full');
    configBackdrop.classList.remove('hidden');
  }

  function closeConfig() {
    configDrawer.classList.add('translate-x-full');
    configBackdrop.classList.add('hidden');
  }

  openConfigBtn.addEventListener('click', openConfig);
  closeConfigBtn.addEventListener('click', closeConfig);
  configBackdrop.addEventListener('click', closeConfig);

  // Mostrar / Ocultar API Key
  toggleKeyVisibilityBtn.addEventListener('click', () => {
    const isPassword = inputApiKey.type === 'password';
    inputApiKey.type = isPassword ? 'text' : 'password';
    toggleKeyVisibilityBtn.textContent = isPassword ? 'Ocultar' : 'Mostrar';
  });

  // Selector de Plantillas Rápidas para Demostración Comercial
  presetSelector.addEventListener('change', (e) => {
    const presetKey = e.target.value;
    if (presetKey && PRESET_TEMPLATES[presetKey]) {
      const template = PRESET_TEMPLATES[presetKey];
      inputBusinessName.value = template.name;
      inputAvatarUrl.value = template.avatar;
      avatarPreview.src = template.avatar;
      inputContext.value = template.context;
    }
  });

  // Cargar imagen de avatar desde archivo local (Base64)
  inputAvatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
        inputAvatarUrl.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // Vista previa cuando se escribe una URL de imagen
  inputAvatarUrl.addEventListener('input', () => {
    const url = inputAvatarUrl.value.trim();
    if (url) {
      avatarPreview.src = url;
    }
  });

  // Guardar configuración del formulario
  configForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedConfig = {
      businessName: inputBusinessName.value.trim() || 'Mi Negocio',
      avatarUrl: avatarPreview.src,
      context: inputContext.value.trim(),
      apiKey: inputApiKey.value.trim(),
      model: 'gemini-3.8-flash'
    };

    configManager.saveConfig(updatedConfig);
    syncUIWithConfig();
    closeConfig();

    // Actualizar conversación con el nuevo nombre y contexto
    startConversation();
  });

  // Botón para reiniciar chat
  resetChatBtn.addEventListener('click', () => {
    if (confirm('¿Deseas reiniciar la conversación de la demo?')) {
      startConversation();
      closeConfig();
    }
  });

  // Botón para restablecer toda la demo a la plantilla original de Avior AI
  if (resetDefaultDemoBtn) {
    resetDefaultDemoBtn.addEventListener('click', () => {
      if (confirm('¿Restablecer el simulador a los datos y avatar oficial de Avior AI?')) {
        configManager.resetToDefault();
        syncUIWithConfig();
        startConversation();
        closeConfig();
      }
    });
  }

  // --- Eventos de Chat & Enviar ---
  messageInput.addEventListener('input', updateInputState);

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  sendButton.addEventListener('click', handleSendMessage);

  // Barra rápida de emojis
  emojiTrigger.addEventListener('click', () => {
    emojiBar.classList.toggle('hidden');
  });

  emojiBar.querySelectorAll('.quick-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
      messageInput.value += btn.textContent;
      updateInputState();
      messageInput.focus();
    });
  });

  // Inicialización
  syncUIWithConfig();
  startConversation();
});
