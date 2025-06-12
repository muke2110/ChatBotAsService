const { Client } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Regenerate client API key
exports.regenerateApiKey = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Generate new API key
    const newApiKey = `${uuidv4()}-${Date.now()}`;
    
    // Update client with new API key
    await client.update({ apiKey: newApiKey });

    res.json({ 
      message: 'API key regenerated successfully',
      apiKey: newApiKey
    });
  } catch (error) {
    logger.error('Error regenerating API key:', error);
    res.status(500).json({ message: 'Failed to regenerate API key' });
  }
}; 