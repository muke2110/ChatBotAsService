const express = require('express');
const router = express.Router();
const { 
  getUserWidgets, 
  createWidget, 
  updateWidget, 
  deleteWidget, 
  getWidget,
  reorderWidgets,
  updateWidgetSettings 
} = require('../controllers/widgetController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all widgets for the user
router.get('/', getUserWidgets);

// Create a new widget
router.post('/', createWidget);

// Get a specific widget
router.get('/:widgetId', getWidget);

// Update a widget
router.put('/:widgetId', updateWidget);

// Update widget settings
router.patch('/:widgetId/settings', updateWidgetSettings);

// Delete a widget
router.delete('/:widgetId', deleteWidget);

// Reorder widgets
router.post('/reorder', reorderWidgets);

module.exports = router; 