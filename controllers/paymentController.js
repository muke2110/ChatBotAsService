const { Payment, Plan, UserPlan, Client } = require('../models');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { createWidgetsForUser } = require('../services/widgetService');

// Check for required environment variables
if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    logger.error('Razorpay credentials are not configured. Please set RAZORPAY_KEY and RAZORPAY_SECRET in your environment variables.');
    throw new Error('Razorpay configuration missing');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

const createOrder = async (req, res) => {
    try {
        const { planId, billingCycle } = req.body;

        if (!planId || !billingCycle) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: {
                    planId: 'The ID of the plan you want to subscribe to',
                    billingCycle: 'Either "monthly" or "yearly"'
                }
            });
        }

        // Validate plan
        const plan = await Plan.findOne({
            where: { id: planId, isActive: true }
        });

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found or inactive' });
        }

        // Calculate amount based on billing cycle
        let amount = plan.price;
        if (billingCycle === 'yearly') {
            amount = Math.floor(plan.price * 12 * 0.8); // 20% discount for yearly, rounded down
        }

        // Convert to paise and ensure it's an integer
        const amountInPaise = Math.floor(amount * 100);

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${Date.now()}`
        });

        // Save order details with the original amount (not in paise)
        const payment = await Payment.create({
            userId: req.user.id,
            planId: plan.id,
            orderId: order.id,
            amount: Math.floor(amount), // Store as integer
            status: 'created',
            billingCycle
        });

        res.json({
            orderId: order.id,
            amount: amountInPaise,
            currency: 'INR',
            planDetails: plan,
            paymentId: payment.id,
            key_id: process.env.RAZORPAY_KEY // Required for client-side integration
        });

    } catch (error) {
        logger.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: {
                    razorpay_order_id: 'Order ID from Razorpay',
                    razorpay_payment_id: 'Payment ID from Razorpay',
                    razorpay_signature: 'Signature from Razorpay'
                }
            });
        }

        // Verify payment signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;
        if (!isValid) {
            logger.error('Invalid payment signature', {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id
            });
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Get payment record
        const payment = await Payment.findOne({
            where: { orderId: razorpay_order_id },
            include: [{ model: Plan }]
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        // Update payment status
        payment.status = 'paid';
        payment.paymentId = razorpay_payment_id;
        await payment.save();

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        if (payment.billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Create or update user subscription
        const [userPlan, created] = await UserPlan.findOrCreate({
            where: { userId: req.user.id },
            defaults: {
                userId: req.user.id,
                planId: payment.planId,
                status: 'active',
                startDate,
                endDate,
                currentStorageUsageGB: 0,
                currentDocumentCount: 0,
                queriesUsedToday: 0,
                lastQueryReset: new Date(),
                autoRenew: true
            }
        });

        // If subscription exists, update it
        if (!created) {
            await userPlan.update({
                planId: payment.planId,
                status: 'active',
                startDate,
                endDate,
                autoRenew: true
            });
        }

        // Get user's client
        const client = await Client.findOne({
            where: { userId: req.user.id }
        });

        if (client) {
            // Create widgets for the user based on their new plan
            try {
                const widgets = await createWidgetsForUser(req.user.id, client.id);
                logger.info('Widgets created for user after plan activation', {
                    userId: req.user.id,
                    widgetsCreated: widgets.length
                });
            } catch (widgetError) {
                logger.error('Error creating widgets for user', {
                    userId: req.user.id,
                    error: widgetError
                });
                // Don't fail the payment verification if widget creation fails
            }
        }

        logger.info('Subscription activated', {
            userId: req.user.id,
            planId: payment.planId,
            subscriptionId: userPlan.id
        });

        res.json({
            success: true,
            message: 'Payment verified and subscription activated',
            subscription: {
                plan: payment.Plan.name,
                startDate,
                endDate,
                status: 'active'
            }
        });

    } catch (error) {
        logger.error('Error verifying payment:', error);
        res.status(500).json({ 
            error: 'Failed to verify payment',
            details: error.message
        });
    }
};

const getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: {
                id: req.params.paymentId,
                userId: req.user.id
            },
            include: [{ model: Plan }]
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        logger.error('Error fetching payment status:', error);
        res.status(500).json({ error: 'Failed to fetch payment status' });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const payments = await Payment.findAndCountAll({
            where: { userId: req.user.id },
            include: [{ model: Plan }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            payments: payments.rows,
            total: payments.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(payments.count / limit)
        });
    } catch (error) {
        logger.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentStatus,
    getPaymentHistory
};
