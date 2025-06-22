const express = require('express');
const router = express.Router();
const { getCurrentDocument, uploadDocument, deleteCurrentDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const { isValidFileType } = require('../services/fileService');

// Configure multer with file type validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  if (isValidFileType(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Supported types: PDF, DOCX, TXT, CSV'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(authenticate);

// Get current document
router.get('/', getCurrentDocument);

// Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// Delete current document
router.delete('/', deleteCurrentDocument);

module.exports = router;
