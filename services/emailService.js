const nodemailer = require('nodemailer');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const logger = require('../utils/logger');

// Initialize AWS SES client
const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Email templates
const templates = {
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

async function sendPaymentEmail(userId, templateName, data) {
  try {
    // Get user email from database
    const user = await User.findByPk(userId);
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const params = {
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [user.email]
      },
      Message: {
        Subject: {
          Data: template.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: template.body(data),
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await ses.send(command);

    logger.info(`Email sent successfully`, {
      template: templateName,
      userId,
      email: user.email
    });
  } catch (error) {
    logger.error('Failed to send email', {
      error,
      template: templateName,
      userId
    });
    throw error;
  }
}

// Fallback email sender using nodemailer (for development)
const devMailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendDevEmail(to, subject, html) {
  if (process.env.NODE_ENV === 'development') {
    await devMailer.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
  }
}

module.exports = {
  sendPaymentEmail,
  sendDevEmail
}; 