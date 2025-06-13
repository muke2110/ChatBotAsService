const express = require('express');
const router = express.Router();
const { getCurrentDocument, uploadDocument, deleteCurrentDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(authenticate);

// Get current document
router.get('/', getCurrentDocument);

// Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// Delete current document
router.delete('/', deleteCurrentDocument);

module.exports = router; 