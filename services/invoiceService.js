const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { s3Operations } = require('../config/aws');

async function generateInvoice(payment, razorpayPayment) {
  try {
    const doc = new PDFDocument();
    const chunks = [];

    // Collect PDF chunks
    doc.on('data', chunk => chunks.push(chunk));

    // Add company logo and header
    doc
      .fontSize(20)
      .text('ChatBot as a Service', { align: 'center' })
      .moveDown();

    // Add invoice details
    doc
      .fontSize(12)
      .text(`Invoice Date: ${new Date().toLocaleDateString()}`)
      .text(`Invoice Number: INV-${payment.id}`)
      .text(`Order ID: ${payment.orderId}`)
      .moveDown();

    // Add customer details
    doc
      .text('Bill To:')
      .text(`Customer ID: ${payment.userId}`)
      .text(`Payment Method: ${razorpayPayment.method}`)
      .moveDown();

    // Add subscription details
    doc
      .text('Subscription Details:')
      .text(`Plan: ${payment.Plan.name}`)
      .text(`Billing Cycle: ${payment.billingCycle}`)
      .text(`Start Date: ${payment.subscriptionStartDate.toLocaleDateString()}`)
      .text(`End Date: ${payment.subscriptionEndDate.toLocaleDateString()}`)
      .moveDown();

    // Add payment details
    doc
      .text('Payment Details:')
      .text(`Amount: ₹${(payment.amount / 100).toFixed(2)}`)
      .text(`Status: ${payment.status.toUpperCase()}`)
      .text(`Transaction ID: ${payment.paymentId}`)
      .moveDown();

    // Add terms and conditions
    doc
      .fontSize(10)
      .text('Terms and Conditions:')
      .text('1. This is a digital invoice generated for your subscription.')
      .text('2. The subscription will auto-renew unless cancelled.')
      .text('3. For support, contact support@chatbotservice.com')
      .moveDown();

    // Finalize the PDF
    doc.end();

    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise((resolve) => {
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Generate unique filename
    const filename = `invoices/${payment.userId}/${uuidv4()}.pdf`;

    // Upload to S3
    await s3Operations.upload(filename, pdfBuffer, {
      ContentType: 'application/pdf',
      ACL: 'private'
    });

    // Generate presigned URL (valid for 7 days)
    const url = await s3Operations.generatePresignedUrl(filename, 7 * 24 * 60 * 60);

    logger.info(`Invoice generated and uploaded for payment ${payment.id}`, {
      filename,
      userId: payment.userId
    });

    return url;
  } catch (error) {
    logger.error('Invoice generation failed', { error, paymentId: payment.id });
    throw error;
  }
}

module.exports = {
  generateInvoice
}; 