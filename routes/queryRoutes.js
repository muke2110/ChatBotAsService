const express = require('express');
const queryController = require('../controllers/queryController');
const clientIdMiddleware = require('../middleware/clientId.middleware')

const router = express.Router();

router.post('/ask',clientIdMiddleware ,queryController.handleQuery);

module.exports = router;
