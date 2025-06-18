const Client = require('../models/client.model');
const User = require('../models/user.model');
const ChatbotWidget = require('../models/chatbotWidget.model');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

exports.clientIdMiddleware = async (req, res, next) => {
  try {
    const clientId = req.headers['x-client-id'];
    const widgetId = req.query.widgetId || req.body.widgetId;
    console.log("This is widget id:::",widgetId);
    
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

    let widget = null;
    let s3Prefix = client.s3ModelPath;

    // If widgetId is provided, validate it and get widget-specific prefix
    if (widgetId) {
      widget = await ChatbotWidget.findOne({
        where: { 
          widgetId,
          userId: user.id,
          isActive: true 
        }
      });
      console.log("widget", widget);
      
      if (!widget) {
        throw new ApiError(404, 'Widget not found or inactive');
      }

      s3Prefix = `${client.s3ModelPath}/${widget.s3Prefix}`;
    }
    
    req.clientId = clientId;
    req.user = user;
    req.s3ModelPath = client.s3ModelPath;
    req.widget = widget;
    req.s3Prefix = s3Prefix;

    logger.info('Client ID validated', {
      clientId,
      userId: user.id,
      s3ModelPath: client.s3ModelPath,
      widgetId: widget?.widgetId,
      s3Prefix
    });

    next();
  } catch (error) {
    next(error);
  }
};
