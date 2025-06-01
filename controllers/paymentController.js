const razorpay = require('../config/razorpay');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    // console.log(req.body);
    
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // await Payment.create({
    //   userId,
    //   orderId: order.id,
    //   amount,
    //   status: 'created'
    // });
    
    try {
      await Payment.create({
      userId,
      orderId: order.id,
      amount,
      status: 'created'
    });
    } catch (message) {
      console.log("Error creating payment: ",message);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;
    // console.log("BODY: ",req.body);
    
    const secret = process.env.RAZORPAY_SECRET; // Razorpay secret from .env

    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature, possible fraud detected!' });
    }

    // Update payment in DB as it is verified
    await Payment.update(
      {
        paymentId: razorpay_payment_id,
        status: 'paid',
      },
      {
        where: { orderId: razorpay_order_id, userId },
      }
    );

    res.json({ message: 'Payment verified and saved' });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.failedPayment = async (req, res) => {
  try {
    const { orderId, userId, status } = req.body;
    // console.log("FAILED BODY::: ", req.body);
    
    // Optional: check if already marked as failed
    await Payment.update(
      { status: status },
      {
        where: {
          orderId: orderId,
          userId: userId
        }
      }
    );

    res.json({ message: 'Payment marked as failed' });
  } catch (err) {
    console.error('Failed payment error:', err);
    res.status(500).json({ error: err.message });
  }
};
