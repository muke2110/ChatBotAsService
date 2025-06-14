const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Using Gmail as the service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const templates = {
  verification: {
    subject: 'Verify Your Account - ChatBot as a Service',
    body: ({ verificationLink }) => `
      <h2>Welcome to ChatBot as a Service!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p>If you did not create an account, please ignore this email.</p>
    `
  },
  password_reset: {
    subject: 'Password Reset Request - ChatBot as a Service',
    body: ({ resetLink }) => `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  },
  payment_success: {
    subject: 'Payment Successful - ChatBot as a Service',
    body: ({ amount, planName, invoiceUrl }) => `
      <h2>Thank you for your payment!</h2>
      <p>Your payment of ₹${amount / 100} for the ${planName} plan has been successfully processed.</p>
      <p>You can download your invoice from <a href="${invoiceUrl}">here</a>.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `
  },
  payment_failed: {
    subject: 'Payment Failed - ChatBot as a Service',
    body: ({ amount, planName, reason }) => `
      <h2>Payment Failed</h2>
      <p>We were unable to process your payment of ₹${amount / 100} for the ${planName} plan.</p>
      <p>Reason: ${reason}</p>
      <p>Please try again or contact our support team if you need assistance.</p>
    `
  },
  subscription_cancelled: {
    subject: 'Subscription Cancelled - ChatBot as a Service',
    body: ({ planName, endDate }) => `
      <h2>Subscription Cancelled</h2>
      <p>Your subscription to the ${planName} plan has been cancelled.</p>
      <p>You will continue to have access to our services until ${new Date(endDate).toLocaleDateString()}.</p>
      <p>We're sorry to see you go. If you change your mind, you can reactivate your subscription at any time.</p>
    `
  },
  refund_processed: {
    subject: 'Refund Processed - ChatBot as a Service',
    body: ({ amount, planName }) => `
      <h2>Refund Processed</h2>
      <p>Your refund of ₹${amount / 100} for the ${planName} plan has been processed.</p>
      <p>The amount will be credited to your original payment method within 5-7 business days.</p>
      <p>If you have any questions, please contact our support team.</p>
    `
  }
};

async function sendEmail(to, templateName, data) {
  try {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.body(data)
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully`, {
      template: templateName,
      to,
      messageId: info.messageId
    });

    return info;
  } catch (error) {
    logger.error('Failed to send email', {
      error,
      template: templateName,
      to
    });
    throw error;
  }
}

module.exports = {
  sendEmail
}; 