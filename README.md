# Simulador de WhatsApp Web para Demostraciones Comerciales - Avior AI

Aplicación web local de alto impacto visual (**Single Page Application**) diseñada para simular la interfaz de **WhatsApp Web** con fidelidad pixel-perfect e integración directa con modelos de Inteligencia Artificial (OpenAI GPT-4o-mini / GPT-4o).

Desarrollada por **Scroll Studios** para presentaciones de ventas, validación de flujos conversacionales y demostraciones en vivo a clientes.

---

## 🚀 Inicio Rápido

1. Dirígete a la carpeta del proyecto:
   `C:\Users\51941\Desktop\Projects\Scroll Studios\Demos\Demo Intefaz Whatsapp Avior AI`
2. **Haz doble clic sobre `index.html`** o sobre `iniciar_demo.bat`.
3. ¡Listo! Se abrirá instantáneamente en tu navegador (Google Chrome, Microsoft Edge, Brave, etc.) sin requerir `npm install`, Node.js ni configuraciones complejas.

---

## 🌟 Características Principales

### 1. Clon Pixel-Perfect de WhatsApp Web
* **Header Superior**: Barra en color verde WhatsApp (`#075E54`), foto de perfil personalizable, badge oficial verificado verde de WhatsApp Business, nombre del negocio en negrita y estado en vivo (`en línea` / `escribiendo...`).
* **Área de Chat**: Fondo con el patrón micro-ícono doodle oficial de WhatsApp, aviso de cifrado de extremo a extremo y badge de fecha ("HOY").
* **Burbujas de Mensaje**:
  - **Cliente (Usuario)**: Alineadas a la derecha, color verde claro WhatsApp (`#d9fdd3`), colita de burbuja (tail) a la derecha, marca de tiempo y doble check azul (`#53bdeb`).
  - **Negocio (IA)**: Alineadas a la izquierda, color blanco (`#ffffff`), colita a la izquierda y marca de tiempo.
* **Barra de Entrada**: Input con diseño nativo, botón de emojis rápidos, clip de adjuntar y botón dinámico que cambia de micrófono a botón verde de enviar al escribir.
* **Efectos Sonoros**: Generador de sonido sutil de envío y recepción vía Web Audio API nativa.

### 2. Panel de Configuración Lateral (Drawer)
Haz clic en el botón superior **"Configurar Demo"** para personalizar en vivo:
* **Plantillas Rápidas (1 Clic)**:
  - 🚀 *Avior AI Solutions* (Agencia de automatización y agentes IA).
  - 🦷 *Clínica Dental Sonrisas* (Servicios médicos, precios y agendamiento).
  - 🏢 *Inmobiliaria Prime Homes* (Proyectos de departamentos y visitas guiadas).
  - 🥩 *Restaurante Fuego & Sazón* (Menú gourmet, precios y reservas).
* **Nombre de la Empresa**: Editable en cualquier momento.
* **Foto de Perfil**: Sube una foto desde tu computadora (conversión automática a Base64) o pega una URL directa.
* **API Key de OpenAI**: Almacenada de forma segura únicamente en tu `localStorage` local. Si no colocas API Key, el simulador responderá en modo demostración offline para no interrumpir tu reunión.
* **Modelo**: Soporte para `gpt-4o-mini` (rápido y económico), `gpt-4o` y `gpt-3.5-turbo`.
* **Base de Datos / Contexto del Negocio**: Textarea para definir servicios, precios, horarios, dirección física y FAQs (única fuente de verdad del agente).

---

## 🧠 Lógica del System Prompt Inyectado

Cada mensaje procesado por la IA incluye el siguiente prompt dinámico:

```text
Eres el asistente virtual por WhatsApp de {{NOMBRE_DEL_NEGOCIO}}. Tu objetivo es atender clientes, responder dudas y agendar citas.
REGLAS:
- Responde en tono amigable, vendedor y conciso (máximo 2 a 3 oraciones por mensaje).
- Usa la siguiente información del negocio como única verdad:
"""
{{CONTEXTO_DEL_NEGOCIO}}
"""
- Si preguntan algo fuera de este contexto, indica amablemente que un asesor humano coordinará ese detalle.
- Usa emojis de forma natural y estilo chat de WhatsApp.
```

---

## 📁 Estructura del Proyecto

```
Demo Intefaz Whatsapp Avior AI/
│
├── index.html            # Estructura principal y layout de WhatsApp Web
├── iniciar_demo.bat      # Lanzador directo de un clic para Windows
├── README.md             # Documentación técnica y comercial
│
├── css/
│   └── styles.css        # Estilos visuales, patrón doodle, animaciones de typing y burbujas
│
└── js/
    ├── config.js         # Gestión de configuración, plantillas y persistencia en localStorage
    ├── api.js            # Cliente OpenAI Chat Completions y modo simulación offline
    ├── chat.js           # Renderizado de burbujas, autoscroll, formato de texto y audio
    └── app.js            # Orquestador principal de eventos y UI
```

---

## 💼 Tips para Demostraciones Comerciales con Clientes

1. **Abre el simulador en pantalla completa (`F11`)**: Ofrece la sensación real de estar viendo WhatsApp Web en una computadora de atención al cliente.
2. **Carga una plantilla antes de la llamada**: Si tu cliente es un dentista, selecciona "Clínica Dental Sonrisas"; si es una agencia o empresa de servicios, selecciona "Avior AI".
3. **Muestra el manejo de objeciones**: Haz preguntas difíciles como "¿Tienen descuento?", "¿Cuál es el horario?", o "¿Me puedes agendar para el jueves?", para mostrar cómo el agente responde con precisión sin inventar datos.
