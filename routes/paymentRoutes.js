const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const { 
    createOrder, 
    verifyPayment, 
    getPaymentStatus, 
    getPaymentHistory 
} = require('../controllers/paymentController');

// Create a new order
router.post('/order', authMiddleware, createOrder);

// Verify payment
router.post('/verify', authMiddleware, verifyPayment);

// Get payment status
router.get('/status/:paymentId', authMiddleware, getPaymentStatus);

// Get payment history
router.get('/history', authMiddleware, getPaymentHistory);

module.exports = router;
