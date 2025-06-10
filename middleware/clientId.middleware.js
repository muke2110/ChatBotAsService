const Client = require('../models/client.model');
const User = require('../models/user.model');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

exports.clientIdMiddleware = async (req, res, next) => {
  try {
    const clientId = req.headers['x-client-id'];

    if (!clientId) {
      throw new ApiError(401, 'Missing client ID');
    }

    // Find client with associated user
    const client = await Client.findOne({ 
      where: { clientId: clientId }
    });

    if (!client) {
      throw new ApiError(401, 'Invalid client ID');
    }

    // Get user separately to avoid association issues
    const user = await User.findByPk(client.userId);

    if (!user) {
      throw new ApiError(401, 'User not found for this client ID');
    }

    if (!client.s3ModelPath) {
      logger.error('Client missing s3ModelPath', {
        clientId,
        userId: user.id
      });
      throw new ApiError(500, 'Client configuration error');
    }
    
    req.clientId = clientId;
    req.user = user;
    req.s3ModelPath = client.s3ModelPath;

    logger.info('Client ID validated', {
      clientId,
      userId: user.id,
      s3ModelPath: client.s3ModelPath
    });

    next();
  } catch (error) {
    next(error);
  }
};
