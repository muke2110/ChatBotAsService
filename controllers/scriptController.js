const { Client, ChatbotWidget } = require('../models');
const logger = require('../utils/logger');

exports.getScriptConfig = async (req, res) => {
  try {
    const { widgetId } = req.query;
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    let widget = null;
    let config = {
      clientId: client.clientId,
      apiEndpoint: `${process.env.API_URL || 'http://localhost:3000'}/api/v1`,
      theme: {
        primaryColor: '#0ea5e9',
        textColor: '#ffffff',
        backgroundColor: '#1f2937'
      },
      position: 'bottom-right',
      welcomeMessage: 'Hello! How can I help you today?',
      botName: 'AI Assistant',
      maxTokens: 2000,
      temperature: 0.7,
      debug: process.env.NODE_ENV === 'development'
    };

    // If widgetId is provided, get widget-specific settings
    if (widgetId) {
      widget = await ChatbotWidget.findOne({
        where: { 
          widgetId,
          userId: req.user.id,
          isActive: true 
        }
      });

      if (!widget) {
        return res.status(404).json({ message: 'Widget not found' });
      }

      // Override default config with widget-specific settings
      if (widget.settings) {
        config = {
          ...config,
          widgetId: widget.widgetId,
          theme: widget.settings.theme || config.theme,
          position: widget.settings.position || config.position,
          welcomeMessage: widget.settings.welcomeMessage || config.welcomeMessage,
          botName: widget.settings.botName || config.botName
        };
      } else {
        config.widgetId = widget.widgetId;
      }
    }

    // Generate installation instructions
    let scriptTag;
    if (widget) {
      scriptTag = `<script src="${process.env.API_URL || 'http://localhost:3000'}/chatbot.js?clientId=${client.clientId}&widgetId=${widget.widgetId}"></script>`;
    } else {
      scriptTag = `<script src="${process.env.API_URL || 'http://localhost:3000'}/chatbot.js?clientId=${client.clientId}"></script>`;
    }
    
    res.json({
      config,
      scriptTag,
      widget: widget ? {
        id: widget.id,
        widgetId: widget.widgetId,
        name: widget.name,
        isActive: widget.isActive,
        settings: widget.settings
      } : null,
      instructions: {
        step1: 'Add the script tag to your HTML file',
        step2: 'The chatbot will automatically initialize with your configuration',
        step3: 'Customize the appearance and behavior through the Settings page'
      }
    });
  } catch (error) {
    logger.error('Error generating script config:', error);
    res.status(500).json({ message: 'Failed to generate script configuration' });
  }
}; 