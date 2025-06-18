const express = require('express')
require('dotenv').config()
const route = require('./index')
const port = process.env.SERVER_PORT || 3000
const cors = require('cors')
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { ErrorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { baseRateLimiter } = require('./middleware/rateLimiter');
const path = require('path');
const { initializeAWS } = require('./config/aws');
const seedPlans = require('./config/seedPlans');
const { sequelize } = require('./config/database');
const passport = require('./config/passport');
const session = require('express-session');
const corsOptions = require('./config/cors');

const app = express()

// Trust proxy settings for rate limiter
app.set('trust proxy', 1);

// CORS configuration
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser configuration
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        status: 'error',
        message: 'Invalid JSON format in request body'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://*.gstatic.com",
        "https://www.gstatic.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://*.gstatic.com"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://*.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: [
        "'self'",
        "https://apis.google.com",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://*.gstatic.com",
        "http://localhost:3000",
        "http://localhost:5000"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.google.com"
      ],
      formAction: ["'self'", "https://accounts.google.com"],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "https://apis.google.com",
        "https://accounts.google.com",
        "https://www.google.com",
        "https://*.gstatic.com",
        "https://www.gstatic.com"
      ]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// Add specific headers for Google Auth
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});

app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(baseRateLimiter);

// Serve static files from the public directory
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));
app.use('/api/v1/embed', require('./routes/embedRoutes'));
app.use('/api/v1/query', require('./routes/queryRoutes'));
app.use('/api/v1/plans', require('./routes/planRoutes'));
app.use('/api/v1/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/v1/client', require('./routes/clientRoutes'));
app.use('/api/v1/settings', require('./routes/settings'));
app.use('/api/v1/documents', require('./routes/documents'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/script', require('./routes/scriptRoutes'));
app.use('/api/v1/widgets', require('./routes/widgetRoutes'));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
  });
}

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

// Initialize database and start server
const initializeApp = async () => {
  try {
    // First authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Load and initialize models with associations
    const models = require('./models');

    // Sync all models
    await sequelize.sync({ force: false, alter: false });
    console.log('All models synchronized successfully.');

    // Seed plans if needed
    await seedPlans();
    console.log('Database is ready!');

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Initialize AWS services
    await initializeAWS();
  } catch (error) {
    console.error('Error initializing application:', error);
    process.exit(1);
  }
};

// Initialize the application
initializeApp();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

module.exports = app;