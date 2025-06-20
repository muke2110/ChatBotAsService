const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as the service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  secure: true, // Use TLS
  logger: true, // Enable logging for debugging
  debug: process.env.NODE_ENV === 'development' // Enable debug in development
});

// Base styles for consistent email design
const baseStyles = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333333;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #0ea5e9;
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 32px;
`;

const footerStyles = `
  margin-top: 32px;
  color: #6b7280;
  font-size: 0.9em;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
`;

// Email templates with enhanced design and accessibility
const templates = {
  verification: {
    subject: 'Verify Your Account - ChatBot as a Service',
    body: ({ verificationLink, userName }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Verify Your Account</title>
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <h1 style="color: #0ea5e9; font-size: 1.5em; margin-bottom: 16px;">Welcome, ${userName || 'User'}!</h1>
          <p style="font-size: 1em; color: #374151;">Thank you for joining ChatBot as a Service. Please verify your email address to activate your account.</p>
          <p style="margin: 24px 0;">
            <a href="${verificationLink}" style="${buttonStyles}" role="button" aria-label="Verify Email">Verify Email Address</a>
          </p>
          <p style="font-size: 0.95em; color: #374151;">If you did not create an account, please ignore this email or contact our support team.</p>
          <div style="${footerStyles}">
            <p>ChatBot as a Service &bull; <a href="https://chatbot.service.com/support" style="color: #0ea5e9;">Support</a></p>
            <p>1234 Tech Lane, Bangalore, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  password_reset: {
    subject: 'Password Reset Request - ChatBot as a Service',
    body: ({ resetLink, userName }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Password Reset Request</title>
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <h1 style="color: #0ea5e9; font-size: 1.5em; margin-bottom: 16px;">Password Reset Request</h1>
          <p style="font-size: 1em; color: #374151;">Hi ${userName || 'User'},</p>
          <p style="font-size: 1em; color: #374151;">We received a request to reset your password. Click the button below to proceed:</p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" style="${buttonStyles}" role="button" aria-label="Reset Password">Reset Password</a>
          </p>
          <p style="font-size: 0.95em; color: #374151;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact our support team.</p>
          <div style="${footerStyles}">
            <p>ChatBot as a Service &bull; <a href="https://chatbot.service.com/support" style="color: #0ea5e9;">Support</a></p>
            <p>1234 Tech Lane, Bangalore, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  payment_success: {
    subject: 'Payment Successful - ChatBot as a Service',
    body: ({ amount, planName, invoiceUrl, userName }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Payment Successful</title>
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <h1 style="color: #0ea5e9; font-size: 1.5em; margin-bottom: 16px;">Thank You, ${userName || 'User'}!</h1>
          <p style="font-size: 1em; color: #374151;">Your payment of ₹${(amount / 100).toFixed(2)} for the <strong>${planName}</strong> plan has been successfully processed.</p>
          ${invoiceUrl ? `
          <p style="margin: 24px 0;">
            <a href="${invoiceUrl}" style="${buttonStyles}" role="button" aria-label="Download Invoice">Download Invoice</a>
          </p>` : ''}
          <p style="font-size: 0.95em; color: #374151;">If you have any questions, please don't hesitate to contact our support team.</p>
          <div style="${footerStyles}">
            <p>ChatBot as a Service &bull; <a href="https://chatbot.service.com/support" style="color: #0ea5e9;">Support</a></p>
            <p>1234 Tech Lane, Bangalore, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  payment_failed: {
    subject: 'Payment Failed - ChatBot as a Service',
    body: ({ amount, planName, reason, userName }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Payment Failed</title>
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <h1 style="color: #0ea5e9; font-size: 1.5em; margin-bottom: 16px;">Payment Issue, ${userName || 'User'}</h1>
          <p style="font-size: 1em; color: #374151;">We were unable to process your payment of ₹${(amount / 100).toFixed(2)} for the <strong>${planName}</strong> plan.</p>
          <p style="font-size: 1em; color: #374151;"><strong>Reason:</strong> ${reason || 'Unknown error'}</p>
          <p style="margin: 24px 0;">
            <a href="https://chatbot.service.com/billing" style="${buttonStyles}" role="button" aria-label="Try Again">Try Again</a>
          </p>
          <p style="font-size: 0.95em; color: #374151;">If you need assistance, please contact our support team.</p>
          <div style="${footerStyles}">
            <p>ChatBot as a Service &bull; <a href="https://chatbot.service.com/support" style="color: #0ea5e9;">Support</a></p>
            <p>1234 Tech Lane, Bangalore, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  subscription_cancelled: {
    subject: 'Subscription Cancelled - ChatBot as a Service',
    body: ({ planName, endDate, userName }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Subscription Cancelled</title>
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <h1 style="color: #0ea5e9; font-size: 1.5em; margin-bottom: 16px;">Subscription Cancelled, ${userName || 'User'}</h1>
          <p style="font-size: 1em; color: #374151;">Your subscription to the <strong>${planName}</strong> plan has been cancelled.</p>
          <p style="font-size: 1em; color: #374151;">You will continue to have access to our services until ${new Date(endDate).toLocaleDateString()}.</p>
          <p style="margin: 24px 0;">
            <a href="https://chatbot.service.com/subscribe" style="${buttonStyles}" role="button" aria-label="Reactivate Subscription">Reactivate Subscription</a>
          </p>
          <p style="font-size: 0.95em; color: #374151;">We're sorry to see you go. If you change your mind, you can reactivate your subscription at any time.</p>
          <div style="${footerStyles}">
            <p>ChatBot as a Service &bull; <a href="https://chatbot.service.com/support" style="color: #0ea5e9;">Support</a></p>
            <p>1234 Tech Lane, Bangalore, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  refund_processed: {
    subject: 'Refund Processed - ChatBot as a Service',
    body: ({ amount, planName, userName }) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>Refund Processed</title>
      </head>
      <body style="${baseStyles}">
        <div style="${containerStyles}">
          <h1 style="color: #0ea5e9; font-size: 1.5em; margin-bottom: 16px;">Refund Processed, ${userName || 'User'}</h1>
          <p style="font-size: 1em; color: #374151;">Your refund of ₹${(amount / 100).toFixed(2)} for the <strong>${planName}</strong> plan has been processed.</p>
          <p style="font-size: 1em; color: #374151;">The amount will be credited to your original payment method within 5-7 business days.</p>
          <p style="font-size: 0.95em; color: #374151;">If you have any questions, please contact our support team.</p>
          <div style="${footerStyles}">
            <p>ChatBot as a Service &bull; <a href="https://chatbot.service.com/support" style="color: #0ea5e9;">Support</a></p>
            <p>1234 Tech Lane, Bangalore, India</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  payment_receipt: {
    subject: 'Your ChatBot Plan Purchase Receipt',
    body: ({ userName, planName, planDescription, features, price, billingCycle, startDate, endDate, invoiceUrl }) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='https://placehold.co/120x40?text=ChatBot' alt='ChatBot Logo' style='height: 40px; margin-bottom: 8px;' />
          </div>
          <h1 style="color: #0ea5e9; margin-bottom: 8px; font-size: 2em;">Welcome, ${userName || 'there'}! 🎉</h1>
          <p style="font-size: 1.1em; color: #374151; margin-bottom: 18px;">We're excited to have you onboard. Your <b>${planName}</b> plan is now active!</p>
          <div style="background: #f0f9ff; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
            <span style="font-size: 1.2em; color: #0ea5e9; font-weight: bold;">Amount Paid:</span>
            <span style="font-size: 1.5em; color: #111827; font-weight: bold; margin-left: 8px;">₹${price}</span>
          </div>
          <div style="margin-bottom: 24px;">
            <h2 style="color: #0ea5e9; font-size: 1.1em; margin-bottom: 4px;">Plan Details</h2>
            <ul style="padding-left: 20px; color: #374151; margin-bottom: 0;">
              <li><b>Description:</b> ${planDescription || 'N/A'}</li>
              <li><b>Billing Cycle:</b> ${billingCycle}</li>
              <li><b>Start Date:</b> ${startDate ? new Date(startDate).toLocaleDateString() : 'N/A'}</li>
              <li><b>End Date:</b> ${endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}</li>
            </ul>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <div style="margin-bottom: 24px;">
            <h2 style="color: #0ea5e9; font-size: 1.1em; margin-bottom: 8px;">Key Features</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${(features && features.length > 0) ? features.map(f => `<tr><td style='padding: 8px 0; color: #374151; font-weight: 500;'>${f.name || ''}</td><td style='padding: 8px 0; color: #0ea5e9; text-align: right;'>${f.value !== undefined ? f.value : ''}</td></tr>`).join('') : '<tr><td colspan="2" style="color: #9ca3af;">No features listed.</td></tr>'}
              </tbody>
            </table>
          </div>
          ${invoiceUrl ? `<div style="margin-bottom: 24px;"><a href="${invoiceUrl}" style="background: #0ea5e9; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Download Invoice</a></div>` : ''}
          <div style="text-align: center; margin: 32px 0 0 0;">
            <a href="https://your-app-domain.com/dashboard" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 14px 36px; border-radius: 8px; font-size: 1.1em; font-weight: bold; text-decoration: none; transition: background 0.2s;">Get Started</a>
          </div>
          <div style="margin-top: 32px; color: #6b7280; font-size: 0.95em; text-align: center;">
            <p>If you have any questions, just reply to this email or contact our support team. We're here to help!</p>
            <p style="margin-top: 16px;">Happy chatting!<br/>The ChatBot Team</p>
          </div>
        </div>
      </div>
    `
  },
  welcome: {
    subject: 'Welcome to ChatBot as a Service! 🎉',
    body: ({ userName, pricingUrl, features }) => `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6; padding: 0; margin: 0;">
        <div style="max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='https://placehold.co/120x40?text=ChatBot' alt='ChatBot Logo' style='height: 40px; margin-bottom: 8px;' />
          </div>
          <h1 style="color: #0ea5e9; margin-bottom: 8px; font-size: 2em;">Welcome, ${userName || 'there'}! 👋</h1>
          <p style="font-size: 1.1em; color: #374151; margin-bottom: 18px;">Thank you for joining <b>ChatBot as a Service</b>! We're thrilled to have you on board.</p>
          <div style="margin-bottom: 24px;">
            <h2 style="color: #0ea5e9; font-size: 1.1em; margin-bottom: 8px;">What can you do here?</h2>
            <ul style="padding-left: 20px; color: #374151;">
              ${(features && features.length > 0) ? features.map(f => `<li><b>${f.name}:</b> ${f.value}</li>`).join('') : '<li>Train your chatbot with your own documents</li><li>Get instant AI-powered support for your users</li><li>Customize, analyze, and grow your bot</li>'}
            </ul>
          </div>
          <div style="text-align: center; margin: 32px 0 0 0;">
            <a href="${pricingUrl || 'https://your-app-domain.com/plans'}" style="display: inline-block; background: #0ea5e9; color: #fff; padding: 14px 36px; border-radius: 8px; font-size: 1.1em; font-weight: bold; text-decoration: none; transition: background 0.2s;">View Pricing & Features</a>
          </div>
          <div style="margin-top: 32px; color: #6b7280; font-size: 0.95em; text-align: center;">
            <p>If you have any questions, just reply to this email or contact our support team. We're here to help!</p>
            <p style="margin-top: 16px;">Happy chatting!<br/>The ChatBot Team</p>
          </div>
        </div>
      </div>
    `
  }
};

// Send email function with enhanced error handling and retries
async function sendEmail(to, templateName, data, options = {}) {
  try {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'support@chatbot.service.com',
      to,
      subject: template.subject,
      html: template.body(data),
      ...options // Allow additional nodemailer options (e.g., headers, priority)
    };

    // Retry logic for transient errors
    let retries = options.retries || 3;
    let lastError;
    while (retries > 0) {
      try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully`, {
          template: templateName,
          to,
          messageId: info.messageId
        });
        return info;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          logger.warn(`Retrying email send (${retries} attempts left)`, {
            template: templateName,
            to,
            error: error.message
          });
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
      }
    }
    throw lastError; // Throw the last error after retries are exhausted
  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      template: templateName,
      to
    });
    throw error;
  }
}

// Send email with attachment
async function sendEmailWithAttachment(to, subject, html, attachments, options = {}) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'support@chatbot.service.com',
      to,
      subject,
      html,
      attachments, // e.g., [{ filename: 'report.csv', content: '...csv content...' }]
      ...options
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email with attachment sent successfully`, {
      to,
      subject,
      messageId: info.messageId
    });
    return info;
  } catch (error) {
    logger.error('Failed to send email with attachment', {
      error: error.message,
      to,
      subject
    });
    throw error;
  }
}

module.exports = {
  sendEmail,
  sendEmailWithAttachment
};