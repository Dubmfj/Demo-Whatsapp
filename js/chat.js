/**
 * Manejo de la Interfaz del Chat de WhatsApp Web
 * Burbujas, animaciones, autoscroll, formato y efectos de audio.
 */

class ChatUI {
  constructor(containerElement, typingHeaderElement) {
    this.container = containerElement;
    this.typingHeader = typingHeaderElement;
    this.typingBubbleElement = null;
    this.audioContext = null;
  }

  /**
   * Genera la hora actual en formato HH:mm (ej. 14:35)
   */
  getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  }

  /**
   * Convierte texto con sintaxis de WhatsApp a HTML seguro
   * Soporta *negrita*, _cursiva_, ~tachado~ y saltos de línea
   */
  formatMessageText(text) {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Negrita *texto*
    escaped = escaped.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    // Cursiva _texto_
    escaped = escaped.replace(/_(.*?)_/g, '<em>$1</em>');
    // Tachado ~texto~
    escaped = escaped.replace(/~(.*?)~/g, '<del>$1</del>');
    // Saltos de línea
    escaped = escaped.replace(/\n/g, '<br>');

    return escaped;
  }

  /**
   * Renderiza el banner de cifrado de WhatsApp y fecha inicial
   */
  renderHeaderNotices() {
    const noticeHtml = `
      <div class="flex justify-center my-3 select-none">
        <span class="bg-[#ffffffd9] text-[#54656f] text-[12.5px] font-medium px-3.5 py-1 rounded-lg shadow-sm">
          HOY
        </span>
      </div>

      <div class="flex justify-center mb-4 select-none px-4">
        <div class="bg-[#ffeecd] border border-[#ffd279] text-[#54656f] text-[11.5px] px-3.5 py-2 rounded-lg text-center max-w-lg shadow-sm flex items-center justify-center gap-2">
          <svg class="w-3.5 h-3.5 text-[#856404] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          <span>Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat puede leerlos ni escucharlos.</span>
        </div>
      </div>
    `;
    this.container.innerHTML = noticeHtml;
  }

  /**
   * Agrega un mensaje a la conversación
   * @param {'user' | 'bot'} sender - 'user' para cliente, 'bot' para negocio
   * @param {string} text - Contenido del mensaje
   * @param {string} [customTime] - Hora personalizada opcional
   */
  appendMessage(sender, text, customTime) {
    const time = customTime || this.getCurrentTime();
    const isUser = sender === 'user';

    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex w-full mb-2 message-entry ${isUser ? 'justify-end' : 'justify-start'}`;

    // SVG Doble Check Azul Oficial
    const doubleCheckSvg = `
      <svg class="w-[16px] h-[16px] text-[#53bdeb] inline-block -ml-0.5" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.01 3.316l-7.784 7.785a.75.75 0 01-1.06 0L3.06 8a.75.75 0 011.06-1.06l2.576 2.575 7.254-7.254a.75.75 0 111.06 1.06z" fill="currentColor"/>
        <path d="M11.01 3.316l-7.784 7.785a.75.75 0 01-1.06 0L.06 8.995a.75.75 0 011.06-1.06l1.576 1.575 7.254-7.254a.75.75 0 111.06 1.06z" fill="currentColor"/>
      </svg>
    `;

    if (isUser) {
      messageWrapper.innerHTML = `
        <div class="relative max-w-[88%] sm:max-w-[78%] md:max-w-[65%] bg-[#d9fdd3] text-[#111b21] rounded-lg rounded-tr-none px-3 py-1.5 shadow-sm bubble-out-tail">
          <div class="text-[14.2px] leading-relaxed break-words font-normal wa-content">
            ${this.formatMessageText(text)}
            <span class="msg-meta">
              <span>${time}</span>
              ${doubleCheckSvg}
            </span>
          </div>
        </div>
      `;
    } else {
      messageWrapper.innerHTML = `
        <div class="relative max-w-[88%] sm:max-w-[78%] md:max-w-[65%] bg-[#ffffff] text-[#111b21] rounded-lg rounded-tl-none px-3 py-1.5 shadow-sm bubble-in-tail">
          <div class="text-[14.2px] leading-relaxed break-words font-normal wa-content">
            ${this.formatMessageText(text)}
            <span class="msg-meta">
              <span>${time}</span>
            </span>
          </div>
        </div>
      `;
    }

    this.container.appendChild(messageWrapper);
    this.scrollToBottom();

    // Efecto de sonido WhatsApp
    if (isUser) {
      this.playBeep(480, 0.05);
    } else {
      this.playBeep(750, 0.07);
    }
  }

  /**
   * Muestra u oculta el estado "escribiendo..." en el header y burbuja
   * @param {boolean} isTyping
   */
  setTyping(isTyping) {
    if (isTyping) {
      if (this.typingHeader) {
        this.typingHeader.innerHTML = '<span class="text-[#c1f5dd] font-semibold animate-pulse tracking-wide">escribiendo...</span>';
      }

      if (!this.typingBubbleElement) {
        this.typingBubbleElement = document.createElement('div');
        this.typingBubbleElement.className = 'flex w-full mb-2 justify-start message-entry';
        this.typingBubbleElement.innerHTML = `
          <div class="relative bg-[#ffffff] text-[#111b21] rounded-lg rounded-tl-none px-4 py-2.5 shadow-sm bubble-in-tail flex items-center gap-1.5">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        `;
        this.container.appendChild(this.typingBubbleElement);
        this.scrollToBottom();
      }
    } else {
      if (this.typingHeader) {
        this.typingHeader.innerHTML = 'en línea';
      }

      if (this.typingBubbleElement) {
        this.typingBubbleElement.remove();
        this.typingBubbleElement = null;
      }
    }
  }

  /**
   * Desplaza el scroll automáticamente hasta el último mensaje
   */
  scrollToBottom() {
    requestAnimationFrame(() => {
      this.container.scrollTop = this.container.scrollHeight;
    });
  }

  /**
   * Generador de sonido sintético tipo WhatsApp (Web Audio API)
   */
  playBeep(frequency = 600, duration = 0.06) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gain.gain.setValueAtTime(0.04, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch {
      // Ignorar restricciones de audio antes de interacción
    }
  }
}

// Registro global para navegador
window.WaSimulator = window.WaSimulator || {};
window.WaSimulator.ChatUI = ChatUI;
