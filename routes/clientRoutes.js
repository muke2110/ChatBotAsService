const express = require('express');
const router = express.Router();
const { regenerateClientId } = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Regenerate client ID
router.post('/regenerate', regenerateClientId);

module.exports = router; 