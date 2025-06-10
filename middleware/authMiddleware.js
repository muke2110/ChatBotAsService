const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const User = require('../models/user.model');

exports.authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (err.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(err);
    }
  }
}; 