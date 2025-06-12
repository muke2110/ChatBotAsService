const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get client settings
router.get('/', getSettings);

// Update client settings
router.post('/', updateSettings);

module.exports = router; 