const express = require('express');
const multer = require('multer');
const embedController = require('../controllers/embedController');
const { authMiddleware } = require('../middleware/auth.middleware');
const { clientIdMiddleware } = require('../middleware/clientId.middleware');
const { planBasedRateLimiter, storageLimitChecker } = require('../middleware/rateLimiter');
const { verifyActivePlan } = require('../middleware/planVerification.middleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// File upload and embedding routes (requires both client ID and auth)
router.post(
  '/upload',
  clientIdMiddleware,
  authMiddleware,
  verifyActivePlan,
  upload.array('files', 5),
  storageLimitChecker,
  planBasedRateLimiter,
  embedController.uploadAndEmbedFiles
);

// Query routes (requires only client ID)
router.post(
  '/query',
  clientIdMiddleware,
  authMiddleware,
  verifyActivePlan,
  planBasedRateLimiter,
  embedController.queryEmbeddings
);

// Management routes (requires both client ID and auth)
router.get(
  '/status',
  clientIdMiddleware,
  authMiddleware,
  verifyActivePlan,
  embedController.getEmbeddingStatus
);

router.delete(
  '/files/:fileId',
  clientIdMiddleware,
  authMiddleware,
  verifyActivePlan,
  embedController.deleteEmbeddedFile
);

module.exports = router;
