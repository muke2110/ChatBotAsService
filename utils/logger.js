const winston = require('winston');
const { format } = winston;

// Custom format for development
const devFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  defaultMeta: { service: 'chatbot-service' },
  transports: [
    // Write all logs to console in development
    process.env.NODE_ENV === 'development'
      ? new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            devFormat
          )
        })
      : new winston.transports.Console({
          format: format.combine(
            format.json()
          )
        }),

    // Write all error logs to file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: format.json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add request context if available
logger.requestContext = function(req) {
  return {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    clientId: req.clientId,
    ip: req.ip
  };
};

// Add stream for Morgan HTTP logger
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

// Log unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

module.exports = logger; 