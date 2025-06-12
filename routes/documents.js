const express = require('express');
const router = express.Router();
const { getDocuments, deleteDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all documents
router.get('/', getDocuments);

// Delete a document
router.delete('/:id', deleteDocument);

module.exports = router; 