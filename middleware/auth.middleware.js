const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new ApiError(401, 'Missing authorization token');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new ApiError(403, 'Token not found');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      logger.info('User authenticated', {
        userId: decoded.id,
        role: decoded.role
      });

      next();
    } catch (err) {
      throw new ApiError(401, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};
