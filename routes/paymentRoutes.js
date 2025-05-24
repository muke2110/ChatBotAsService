const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

//Middleware
const middleware = require('../middleware/auth.middleware')

router.post('/order', middleware, paymentController.createOrder);
router.post('/verify',middleware , paymentController.verifyPayment);

module.exports = router;
