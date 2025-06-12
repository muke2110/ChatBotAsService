const { Client } = require('../models');
const logger = require('../utils/logger');

const defaultSettings = {
  theme: {
    primaryColor: '#0ea5e9',
    textColor: '#ffffff',
    backgroundColor: '#1f2937'
  },
  position: 'bottom-right',
  welcomeMessage: 'Hello! How can I help you today?',
  botName: 'AI Assistant'
};

// Get settings for a client
exports.getSettings = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get settings from client's metadata or return defaults
    const settings = {
      ...defaultSettings,
      ...(client.settings || {}),
      theme: {
        ...defaultSettings.theme,
        ...(client.settings?.theme || {})
      }
    };

    res.json(settings);
  } catch (error) {
    logger.error('Error getting settings:', error);
    res.status(500).json({ message: 'Failed to get settings' });
  }
};

// Update settings for a client
exports.updateSettings = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get current settings
    const currentSettings = client.settings || defaultSettings;

    // Validate settings
    const { theme, position, welcomeMessage, botName } = req.body;
    
    if (theme && typeof theme !== 'object') {
      return res.status(400).json({ message: 'Invalid theme settings' });
    }

    if (position && !['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(position)) {
      return res.status(400).json({ message: 'Invalid position' });
    }

    // Update settings with proper merging
    const updatedSettings = {
      ...currentSettings,
      ...(position && { position }),
      ...(welcomeMessage && { welcomeMessage }),
      ...(botName && { botName }),
      theme: theme ? {
        ...currentSettings.theme,
        ...theme
      } : currentSettings.theme
    };

    // Save the updated settings
    client.settings = updatedSettings;
    await client.save();

    // Return the complete settings object
    res.json(updatedSettings);
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
}; 