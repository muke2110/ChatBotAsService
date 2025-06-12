const { Client } = require('../models');
const logger = require('../utils/logger');

exports.getScriptConfig = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get client settings or use defaults
    const settings = client.settings || {
      theme: {
        primaryColor: '#0ea5e9',
        textColor: '#ffffff',
        backgroundColor: '#1f2937'
      },
      position: 'bottom-right',
      welcomeMessage: 'Hello! How can I help you today?',
      botName: 'AI Assistant'
    };

    // Generate script configuration
    const config = {
      clientId: client.clientId,
      apiEndpoint: `${process.env.API_URL || 'http://localhost:3000'}/api/v1`,
      theme: settings.theme,
      position: settings.position,
      welcomeMessage: settings.welcomeMessage,
      botName: settings.botName,
      maxTokens: 2000,
      temperature: 0.7,
      debug: process.env.NODE_ENV === 'development'
    };

    // Generate installation instructions
    const scriptTag = `<script src="${process.env.API_URL || 'http://localhost:3000'}/chatbot.js?clientId=${client.clientId}"></script>`;
    
    res.json({
      config,
      scriptTag,
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