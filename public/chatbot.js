class ChatbotService {
  constructor(config) {
    if (!config.clientId) {
      throw new Error('Client ID is required');
    }
    console.log("config::: ", config);
    this.clientId = config.clientId;
    this.widgetId = config.widgetId || null;
    this.apiUrl = config.apiUrl || 'https://localhost:3000/api/v1';
    this.position = config.position || 'bottom-right';
    this.theme = config.theme || {
      primaryColor: '#007bff',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    };
    this.botName = config.botName || 'Chat Assistant';
    this.welcomeMessage = config.welcomeMessage || 'Hello! How can I help you today?';
    this.isTyping = false;

    this.initialize();
  }

  async initialize() {
    // Create chatbot container
    this.container = document.createElement('div');
    this.container.id = 'chatbot-container';
    this.container.style.cssText = `
      position: fixed;
      ${this.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
      ${this.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      opacity: 0;
      transform: translateX(60px);
      transition: opacity 0.6s cubic-bezier(.4,2,.6,1), transform 0.6s cubic-bezier(.4,2,.6,1);
    `;

    // Create chat button with animated robot SVG
    this.button = document.createElement('button');
    this.button.id = 'chatbot-button';
    this.button.setAttribute('aria-label', 'Open chatbot');
    this.button.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="chatbot-robot-svg">
        <g>
          <ellipse cx="24" cy="28" rx="16" ry="12" fill="#e0e7ff"/>
          <ellipse cx="24" cy="20" rx="12" ry="10" fill="#6366f1"/>
          <ellipse cx="18" cy="20" rx="2.5" ry="3" fill="#fff"/>
          <ellipse cx="30" cy="20" rx="2.5" ry="3" fill="#fff"/>
          <ellipse cx="18" cy="20" rx="1.2" ry="1.5" fill="#6366f1"/>
          <ellipse cx="30" cy="20" rx="1.2" ry="1.5" fill="#6366f1"/>
          <rect x="20" y="26" width="8" height="2" rx="1" fill="#fff"/>
          <rect x="22" y="10" width="4" height="6" rx="2" fill="#6366f1"/>
        </g>
      </svg>
    `;
    this.button.style.cssText = `
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: ${this.theme.primaryColor};
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      align-self: flex-end;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s;
      outline: none;
    `;
    this.button.onmouseenter = () => {
      this.button.style.transform = 'scale(1.08) rotate(-4deg)';
      this.button.style.boxShadow = '0 8px 32px rgba(99,102,241,0.18)';
    };
    this.button.onmouseleave = () => {
      this.button.style.transform = 'scale(1)';
      this.button.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
    };

    // Create chat window
    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'chatbot-window';
    this.chatWindow.setAttribute('aria-modal', 'true');
    this.chatWindow.setAttribute('role', 'dialog');
    this.chatWindow.style.cssText = `
      display: none;
      width: 350px;
      max-width: 95vw;
      height: 500px;
      background: linear-gradient(135deg, ${this.theme.backgroundColor} 80%, #f3f4f6 100%);
      border-radius: 18px;
      margin-bottom: 10px;
      box-shadow: 0 8px 32px rgba(99,102,241,0.18);
      overflow: hidden;
      flex-direction: column;
      animation: chatbot-slide-in 0.4s cubic-bezier(.4,2,.6,1);
      transition: box-shadow 0.2s;
    `;

    // Chat header with robot avatar
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: linear-gradient(90deg, ${this.theme.primaryColor} 60%, #6366f1 100%);
      color: white;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1em;
      letter-spacing: 0.5px;
    `;
    header.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style="margin-right: 6px;">
        <ellipse cx="24" cy="20" rx="12" ry="10" fill="#fff"/>
        <ellipse cx="18" cy="20" rx="2.5" ry="3" fill="#6366f1"/>
        <ellipse cx="30" cy="20" rx="2.5" ry="3" fill="#6366f1"/>
        <ellipse cx="18" cy="20" rx="1.2" ry="1.5" fill="#fff"/>
        <ellipse cx="30" cy="20" rx="1.2" ry="1.5" fill="#fff"/>
        <rect x="20" y="26" width="8" height="2" rx="1" fill="#6366f1"/>
      </svg>
      <span>${this.botName}</span>
    `;

    // Messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 18px 15px 10px 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: transparent;
    `;

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      background: rgba(255,255,255,0.95);
    `;

    // Input field
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Type your message...';
    this.input.setAttribute('aria-label', 'Type your message');
    this.input.style.cssText = `
      flex: 1;
      padding: 10px 16px;
      border: 1px solid #ddd;
      border-radius: 20px;
      margin-right: 8px;
      font-size: 1em;
      outline: none;
      background: #f9fafb;
      color: #222;
      transition: border 0.2s;
    `;
    this.input.onfocus = () => {
      this.input.style.border = `1.5px solid ${this.theme.primaryColor}`;
    };
    this.input.onblur = () => {
      this.input.style.border = '1px solid #ddd';
    };

    // Send button
    const sendButton = document.createElement('button');
    sendButton.setAttribute('aria-label', 'Send message');
    sendButton.innerHTML = `
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M2 21l21-9-21-9v7l15 2-15 2v7z" fill="${this.theme.primaryColor}"/></svg>
    `;
    sendButton.style.cssText = `
      background: ${this.theme.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;
    sendButton.onmouseenter = () => {
      sendButton.style.background = '#6366f1';
    };
    sendButton.onmouseleave = () => {
      sendButton.style.background = this.theme.primaryColor;
    };

    // Assemble
    inputContainer.appendChild(this.input);
    inputContainer.appendChild(sendButton);
    this.chatWindow.appendChild(header);
    this.chatWindow.appendChild(this.messagesContainer);
    this.chatWindow.appendChild(inputContainer);
    this.container.appendChild(this.chatWindow);
    this.container.appendChild(this.button);
    document.body.appendChild(this.container);

    // Animate in after 3 seconds
    setTimeout(() => {
      this.container.style.opacity = '1';
      this.container.style.transform = 'translateX(0)';
    }, 3000);

    // Add event listeners
    this.button.addEventListener('click', () => this.toggleChat());
    sendButton.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Add welcome message
    this.addMessage('bot', this.welcomeMessage);
  }

  toggleChat() {
    const isOpening = this.chatWindow.style.display === 'none';
    this.chatWindow.style.display = isOpening ? 'flex' : 'none';
    if (isOpening) {
      this.chatWindow.style.animation = 'chatbot-slide-in 0.4s cubic-bezier(.4,2,.6,1)';
      setTimeout(() => {
        this.chatWindow.style.animation = '';
      }, 400);
      this.input.focus();
    }
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;
    this.input.value = '';
    this.addMessage('user', message);
    this.showTyping();
    try {
      const requestBody = { query: message };
      if (this.widgetId) {
        requestBody.widgetId = this.widgetId;
      }
      const response = await fetch(`${this.apiUrl}/query/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      this.hideTyping();
      if (data.status === 'SUCCESS') {
        this.addMessage('bot', data.answer);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
      console.error('Chatbot error:', error);
    }
  }

  showTyping() {
    this.isTyping = true;
    this.typingBubble = document.createElement('div');
    this.typingBubble.className = 'chatbot-typing-bubble';
    this.typingBubble.style.cssText = `
      margin: 8px 0;
      padding: 8px 16px;
      border-radius: 20px;
      max-width: 60%;
      background: #f1f1f1;
      color: #6366f1;
      align-self: flex-start;
      box-shadow: 0 2px 8px rgba(99,102,241,0.08);
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    this.typingBubble.innerHTML = `
      <span>Bot is typing</span>
      <span class="chatbot-typing-dots" style="display:inline-block;width:24px;">
        <span style="display:inline-block;width:6px;height:6px;background:#6366f1;border-radius:50%;margin-right:2px;animation:chatbot-dot 1s infinite alternate;"></span>
        <span style="display:inline-block;width:6px;height:6px;background:#6366f1;border-radius:50%;margin-right:2px;animation:chatbot-dot 1s 0.2s infinite alternate;"></span>
        <span style="display:inline-block;width:6px;height:6px;background:#6366f1;border-radius:50%;animation:chatbot-dot 1s 0.4s infinite alternate;"></span>
      </span>
    `;
    this.messagesContainer.appendChild(this.typingBubble);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  hideTyping() {
    this.isTyping = false;
    if (this.typingBubble && this.typingBubble.parentNode) {
      this.typingBubble.parentNode.removeChild(this.typingBubble);
    }
  }

  addMessage(type, text) {
    if (this.isTyping) this.hideTyping();
    const message = document.createElement('div');
    message.style.cssText = `
      margin: 8px 0;
      padding: 12px 18px;
      border-radius: 22px;
      max-width: 80%;
      word-wrap: break-word;
      font-size: 1em;
      box-shadow: 0 2px 8px rgba(99,102,241,0.08);
      transition: background 0.2s, color 0.2s;
      ${type === 'user' ? `
        background: ${this.theme.primaryColor};
        color: white;
        align-self: flex-end;
        margin-left: auto;
      ` : type === 'error' ? `
        background: #ff4444;
        color: white;
      ` : `
        background: #f1f1f1;
        color: ${this.theme.textColor};
        align-self: flex-start;
      `}
    `;
    message.textContent = text;
    this.messagesContainer.appendChild(message);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

// Add keyframes for animations
const style = document.createElement('style');
style.innerHTML = `
@keyframes chatbot-slide-in {
  0% { opacity: 0; transform: translateY(40px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes chatbot-dot {
  0% { opacity: 0.3; transform: translateY(0); }
  100% { opacity: 1; transform: translateY(-4px); }
}
`;
document.head.appendChild(style);

// Make it available globally
window.ChatbotService = ChatbotService;

// Auto-initialize if URL parameters are present
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('clientId');
  const widgetId = urlParams.get('widgetId');
  
  if (clientId) {
    // Auto-initialize with URL parameters
    const config = {
      clientId: clientId,
      widgetId: widgetId || null,
      apiUrl: urlParams.get('apiUrl') || 'https://localhost:3000/api/v1',
      position: urlParams.get('position') || 'bottom-right',
      theme: {
        primaryColor: urlParams.get('primaryColor') || '#007bff',
        backgroundColor: urlParams.get('backgroundColor') || '#ffffff',
        textColor: urlParams.get('textColor') || '#000000'
      },
      botName: urlParams.get('botName') || 'Chat Assistant',
      welcomeMessage: urlParams.get('welcomeMessage') || 'Hello! How can I help you today?'
    };
    
    // Initialize the chatbot automatically
    new ChatbotService(config);
  }
})(); 