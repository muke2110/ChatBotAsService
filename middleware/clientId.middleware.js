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

    const client = await Client.findOne({ 
      where: { clientId: clientId } 
    });
    const user = await User.findOne({ 
      where: { clientId: clientId } 
    });

    if (!client) {
      throw new ApiError(401, 'Invalid client ID');
    }
    // console.log(user.id);
    
    req.clientId = clientId;
    req.user = user;
    req.s3ModelPath = client.s3ModelPath;

    logger.info('Client ID validated', {
      clientId,
      s3ModelPath: client.s3ModelPath
    });

    next();
  } catch (error) {
    next(error);
  }
};
