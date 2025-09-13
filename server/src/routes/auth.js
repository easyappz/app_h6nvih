const express = require('express');
const router = express.Router();
const authController = require('@src/controllers/authController');
const auth = require('@src/middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.me);

module.exports = router;
