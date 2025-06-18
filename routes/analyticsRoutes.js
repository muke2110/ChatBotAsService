const express = require('express');
const router = express.Router();
const { 
  getDashboardAnalytics, 
  getWidgetAnalytics, 
  getAllWidgetsAnalytics 
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get dashboard analytics
router.get('/', getDashboardAnalytics);

// Get all widgets analytics summary
router.get('/widgets', getAllWidgetsAnalytics);

// Get specific widget analytics
router.get('/widgets/:widgetId', getWidgetAnalytics);

module.exports = router; 