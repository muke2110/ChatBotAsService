const express = require('express');
const queryController = require('../controllers/queryController');
const { clientIdMiddleware } = require('../middleware/clientId.middleware');
const { planBasedRateLimiter } = require('../middleware/rateLimiter');
const { verifyActivePlan } = require('../middleware/planVerification.middleware');

const router = express.Router();

router.post('/ask', 
  clientIdMiddleware,
  verifyActivePlan,
  planBasedRateLimiter,
  queryController.handleQuery
);

// Test endpoint to verify plan-specific model configuration
router.get('/model-config',
  clientIdMiddleware,
  verifyActivePlan,
  queryController.getModelConfiguration
);

module.exports = router;
