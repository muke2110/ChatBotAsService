const { Client } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Regenerate client ID
exports.regenerateClientId = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Generate new client ID
    const newClientId = uuidv4();
    
    // Update client with new client ID
    await client.update({ clientId: newClientId });

    res.json({ 
      message: 'Client ID regenerated successfully',
      clientId: newClientId
    });
  } catch (error) {
    logger.error('Error regenerating client ID:', error);
    res.status(500).json({ message: 'Failed to regenerate client ID' });
  }
}; 