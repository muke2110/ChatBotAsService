const express = require('express');
const router = express.Router();
const { getScriptConfig } = require('../controllers/scriptController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get script configuration
router.get('/config', getScriptConfig);

module.exports = router; 