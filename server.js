const express = require('express')
require('dotenv').config()
const { syncDatabase } = require('./config/database')
const route = require('./index')
const port = process.env.SERVER_PORT || 3000
const cors = require('cors')
require('./models/user.model');
require('./models//payment.model');
require('./models/plan.model');
require('./models/userPlan.model');
require('./models/client.model')
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { ErrorHandler } = require('./utils/apiError');
const logger = require('./utils/logger');
const { baseRateLimiter } = require('./middleware/rateLimiter');
const path = require('path');
const { initializeAWS } = require('./config/aws');
const seedPlans = require('./config/seedPlans');

const app = express()
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(baseRateLimiter);

// Serve static files from the public directory
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      // Cache for 1 hour
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// app.use('/api',route)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));
app.use('/api/v1/embed', require('./routes/embedRoutes'));
app.use('/api/v1/query', require('./routes/queryRoutes'));
app.use('/api/v1/plans', require('./routes/planRoutes'));
app.use('/api/v1/subscriptions', require('./routes/subscriptionRoutes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(ErrorHandler.handle);

// Handle uncaught errors
ErrorHandler.handleUncaughtErrors();

syncDatabase().then(async () => {
    console.log('Database is ready!');
    // Seed plans
    await seedPlans();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
});

// Initialize AWS services
initializeAWS().catch(error => {
    logger.error('Failed to initialize AWS services:', error);
    process.exit(1);
});

module.exports = app;