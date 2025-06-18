const { Client, Document, ChatbotWidget } = require('../models');
const { s3Client } = require('../config/aws');
const { ListObjectsV2Command, DeleteObjectsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

// Get current document for a client and widget
exports.getCurrentDocument = async (req, res) => {
  try {
    const { widgetId } = req.query;
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    let whereClause = { clientId: client.id };
    
    // If widgetId is provided, filter by widget
    if (widgetId) {
      const widget = await ChatbotWidget.findOne({
        where: { 
          widgetId,
          userId: req.user.id,
          isActive: true 
        }
      });

      if (!widget) {
        return res.status(404).json({ message: 'Widget not found' });
      }
      
      whereClause.widgetId = widget.id;
    }

    // Get the current document from the database
    const document = await Document.findOne({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    if (!document) {
      return res.json({ document: null });
    }

    res.json({ document });
  } catch (error) {
    logger.error('Error getting current document:', error);
    res.status(500).json({ message: 'Failed to get document' });
  }
};

// Upload a document for a specific widget
exports.uploadDocument = async (req, res) => {
  try {
    const { widgetId } = req.body;
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let widget = null;
    let s3Prefix = client.s3ModelPath;

    // If widgetId is provided, use widget-specific prefix
    if (widgetId) {
      widget = await ChatbotWidget.findOne({
        where: { 
          widgetId,
          userId: req.user.id,
          isActive: true 
        }
      });

      if (!widget) {
        return res.status(404).json({ message: 'Widget not found' });
      }
      logger.info("Got into the s3 prefix and took the seperate prefix")
      s3Prefix = `${client.s3ModelPath}/${widget.s3Prefix}`;
      logger.info(`This is the s3 prefix::: ${s3Prefix}`)
    }

    // First, upload the file to S3
    try {
      console.log("s3prefix:::", s3Prefix);
      
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${s3Prefix}/original/${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      });

      await s3Client.send(uploadCommand);
      logger.info('Successfully uploaded file to S3', {
        fileName: req.file.originalname,
        clientId: client.id,
        widgetId: widget?.id,
        s3Prefix
      });
    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      return res.status(500).json({ 
        message: 'Failed to upload file to S3',
        error: error.message
      });
    }

    // Only create document record after successful S3 upload
    const document = await Document.create({
      clientId: client.id,
      widgetId: widget?.id || null,
      name: req.file.originalname,
      size: req.file.size,
      status: 'processing',
      chunkCount: 0,
      chunkPaths: []
    });

    // Process the file in chunks and upload to S3
    // This would be handled by a background job or worker
    // For now, we'll just return success
    document.status = 'completed';
    await document.save();

    res.json({ 
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        name: document.name,
        size: document.size,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
};

// Delete current document for a specific widget
exports.deleteCurrentDocument = async (req, res) => {
  try {
    const { widgetId } = req.query;
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    let whereClause = { clientId: client.id };
    let widget = null;
    let s3Prefix = client.s3ModelPath;

    // If widgetId is provided, filter by widget
    if (widgetId) {
      widget = await ChatbotWidget.findOne({
        where: { 
          widgetId,
          userId: req.user.id,
          isActive: true 
        }
      });

      if (!widget) {
        return res.status(404).json({ message: 'Widget not found' });
      }
      
      whereClause.widgetId = widget.id;
      s3Prefix = `${client.s3ModelPath}/${widget.s3Prefix}`;
    }

    // Get the current document
    const document = await Document.findOne({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    if (!document) {
      return res.status(404).json({ message: 'No document found' });
    }

    let s3DeletionSuccessful = false;

    // Delete all related files from S3 (embeddings, index, texts)
    try {
      // Get all objects with the document's prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `${s3Prefix}/`
      });

      const listedObjects = await s3Client.send(listCommand);
      
      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        // Group objects by type (embeddings, index, texts)
        const objectsToDelete = listedObjects.Contents.map(obj => ({ Key: obj.Key }));

        // Delete all objects
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Delete: {
            Objects: objectsToDelete
          }
        });

        const deleteResult = await s3Client.send(deleteCommand);
        
        // Check if there were any errors during deletion
        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
          logger.error('Error deleting files from S3:', deleteResult.Errors);
          return res.status(500).json({ 
            message: 'Failed to delete document files from S3',
            errors: deleteResult.Errors
          });
        }

        s3DeletionSuccessful = true;
        logger.info('Successfully deleted files from S3', {
          documentId: document.id,
          fileCount: objectsToDelete.length,
          prefixes: ['embeddings', 'index', 'texts'],
          widgetId: widget?.id
        });
      } else {
        // If no files found in S3, consider deletion successful
        s3DeletionSuccessful = true;
        logger.info('No files found in S3 to delete', {
          documentId: document.id,
          clientId: client.id,
          widgetId: widget?.id
        });
      }
    } catch (error) {
      logger.error('Error deleting files from S3:', error);
      return res.status(500).json({ 
        message: 'Failed to delete document files from S3',
        error: error.message
      });
    }

    // Only delete the document record if S3 deletion was successful
    if (s3DeletionSuccessful) {
      await document.destroy();
      logger.info('Successfully deleted document record from database', {
        documentId: document.id,
        clientId: client.id,
        widgetId: widget?.id
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to delete document - S3 deletion was not successful'
      });
    }

    res.json({ 
      message: 'Document deleted successfully',
      deletedFiles: document.chunkPaths ? document.chunkPaths.length : 0
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
}; 