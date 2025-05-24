const express = require('express');
const queryController = require('../controllers/queryController');

const router = express.Router();

router.post('/ask', queryController.handleQuery);

module.exports = router;
