const razorpay = require('../config/razorpay');
const Payment = require('../models/payment.model');
const User = require('../models/user.model');

exports.createOrder = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId,
      orderId: order.id,
      amount,
      status: 'created'
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, userId } = req.body;

    await Payment.update({ paymentId, status: 'paid' }, {
      where: { orderId, userId }
    });

    res.json({ message: 'Payment verified and saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
