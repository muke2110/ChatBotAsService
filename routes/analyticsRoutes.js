const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get dashboard analytics
router.get('/', getDashboardAnalytics);

module.exports = router; 