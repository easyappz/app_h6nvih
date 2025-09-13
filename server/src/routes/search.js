const express = require('express');
const router = express.Router();
const userController = require('@src/controllers/userController');

router.get('/users', userController.searchUsers);

module.exports = router;
