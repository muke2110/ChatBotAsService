const { Client } = require('../models');
const { s3Client } = require('../config/aws');
const { ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

// Get all documents for a client
exports.getDocuments = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // List objects in the client's S3 bucket folder
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${client.s3ModelPath}/`
    });

    const s3Objects = await s3Client.send(command);
    
    // Handle empty bucket or no objects found
    if (!s3Objects.Contents || s3Objects.Contents.length === 0) {
      return res.json({ documents: [] });
    }
    
    // Group objects by their base PDF name
    const documentGroups = s3Objects.Contents.reduce((acc, obj) => {
      // Skip the folder itself
      if (obj.Key === `${client.s3ModelPath}/`) return acc;

      // Extract base PDF name (remove chunk numbers and extensions)
      const key = obj.Key.split('/').pop(); // Get filename
      const baseName = key.replace(/_chunk_\d+\.txt$/, '.pdf')
                         .replace(/\.txt$/, '.pdf');

      if (!acc[baseName]) {
        acc[baseName] = {
          id: baseName.replace('.pdf', ''),
          name: baseName,
          size: 0,
          lastModified: obj.LastModified,
          chunks: []
        };
      }

      acc[baseName].size += obj.Size;
      acc[baseName].chunks.push(obj.Key);
      // Keep the most recent modification date
      if (obj.LastModified > acc[baseName].lastModified) {
        acc[baseName].lastModified = obj.LastModified;
      }

      return acc;
    }, {});

    // Convert to array and format for response
    const documents = Object.values(documentGroups).map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      lastModified: doc.lastModified,
      chunkCount: doc.chunks.length
    }));

    res.json({ documents });
  } catch (error) {
    logger.error('Error getting documents:', error);
    res.status(500).json({ message: 'Failed to get documents' });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // List all objects with the document's prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${client.s3ModelPath}/`
    });

    const objects = await s3Client.send(listCommand);
    
    if (!objects.Contents || objects.Contents.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Filter objects that belong to this document
    const documentObjects = objects.Contents.filter(obj => {
      const key = obj.Key.split('/').pop(); // Get filename
      return key.startsWith(id) || // Match exact ID
             key.startsWith(`${id}.pdf`) || // Match PDF file
             key.startsWith(`${id}_chunk_`); // Match chunks
    });

    if (documentObjects.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete all related objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: documentObjects.map(obj => ({ Key: obj.Key }))
      }
    });

    await s3Client.send(deleteCommand);

    res.json({ 
      message: 'Document deleted successfully',
      deletedFiles: documentObjects.length
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
}; 