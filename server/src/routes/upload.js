const express = require('express');
const router = express.Router();
const auth = require('@src/middlewares/auth');
const { uploadMiddleware, uploadImage } = require('@src/controllers/uploadController');

router.use(auth);

router.post('/', uploadMiddleware, uploadImage);

module.exports = router;
