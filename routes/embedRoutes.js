const express = require('express');
const multer = require('multer');
const embedController = require('../controllers/embedController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

//Middleware
const middleware = require('../middleware/auth.middleware')

router.post('/upload', middleware, upload.array('files'), embedController.uploadAndEmbedFiles);

module.exports = router;
