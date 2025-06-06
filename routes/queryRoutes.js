const express = require('express');
const queryController = require('../controllers/queryController');
const { clientIdMiddleware } = require('../middleware/clientId.middleware');
const { planBasedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/ask', 
  clientIdMiddleware,
  planBasedRateLimiter,
  queryController.handleQuery
);

module.exports = router;
