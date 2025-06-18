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
    `;

    // Create chat button with SVG icon
    this.button = document.createElement('button');
    this.button.id = 'chatbot-button';
    this.button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
      </svg>
    `;
    this.button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${this.theme.primaryColor};
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      align-self: flex-end;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    `;

    // Create chat window
    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'chatbot-window';
    this.chatWindow.style.cssText = `
      display: none;
      width: 350px;
      height: 500px;
      background: ${this.theme.backgroundColor};
      border-radius: 10px;
      margin-bottom: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
      flex-direction: column;
    `;

    // Create chat header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: ${this.theme.primaryColor};
      color: white;
      font-weight: bold;
    `;
    header.textContent = this.botName;

    // Create messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    `;

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
    `;

    // Create input field
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Type your message...';
    this.input.style.cssText = `
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 20px;
      margin-right: 8px;
    `;

    // Create send button
    const sendButton = document.createElement('button');
    sendButton.innerHTML = '➤';
    sendButton.style.cssText = `
      background: ${this.theme.primaryColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      cursor: pointer;
    `;

    // Assemble the components
    inputContainer.appendChild(this.input);
    inputContainer.appendChild(sendButton);
    this.chatWindow.appendChild(header);
    this.chatWindow.appendChild(this.messagesContainer);
    this.chatWindow.appendChild(inputContainer);
    this.container.appendChild(this.chatWindow);
    this.container.appendChild(this.button);
    document.body.appendChild(this.container);

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
      this.input.focus();
    }
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    // Clear input
    this.input.value = '';

    // Add user message to chat
    this.addMessage('user', message);

    try {
      // Prepare request body
      const requestBody = { query: message };
      if (this.widgetId) {
        requestBody.widgetId = this.widgetId;
      }

      // Send request to backend
      const response = await fetch(`${this.apiUrl}/query/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        this.addMessage('bot', data.answer);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      this.addMessage('error', 'Sorry, I encountered an error. Please try again.');
      console.error('Chatbot error:', error);
    }
  }

  addMessage(type, text) {
    const message = document.createElement('div');
    message.style.cssText = `
      margin: 8px 0;
      padding: 8px 12px;
      border-radius: 20px;
      max-width: 80%;
      word-wrap: break-word;
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
      `}
    `;
    message.textContent = text;
    this.messagesContainer.appendChild(message);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

// Make it available globally
window.ChatbotService = ChatbotService; 