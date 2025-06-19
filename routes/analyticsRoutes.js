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

// Get widget query history (plan-based limits)
router.get('/widgets/:widgetId/history', require('../controllers/analyticsController').getWidgetQueryHistory);

module.exports = router; 