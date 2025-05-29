const express = require('express');
const multer = require('multer');
const embedController = require('../controllers/embedController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

//Middleware
const AuthMiddleware = require('../middleware/auth.middleware')
const ClientIdMiddleware = require('../middleware/clientId.middleware')

router.post('/upload', upload.array('files'), AuthMiddleware, ClientIdMiddleware, embedController.uploadAndEmbedFiles);

module.exports = router;
