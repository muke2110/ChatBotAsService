const logger = require('../utils/logger');

class ErrorHandler {
  static handle(err, req, res, next) {
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(err);
    }

    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid JSON format in request body',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => ({
          field: error.path,
          message: error.message
        }))
      });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Handle rate limit errors
    if (err.status === 429) {
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests',
        retryAfter: err.retryAfter
      });
    }

    // Handle file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size exceeds limit'
      });
    }

    // Handle database errors
    if (err.name === 'SequelizeError' || err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Database error',
        errors: process.env.NODE_ENV === 'development' ? err.errors : undefined
      });
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details
      })
    });
  }

  static handleUncaughtErrors() {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection:', error);
      process.exit(1);
    });
  }
}

module.exports = {
  ErrorHandler
}; 