const express = require('express');
const router = express.Router();
const { regenerateApiKey } = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Regenerate client API key
router.post('/regenerate', regenerateApiKey);

module.exports = router; 