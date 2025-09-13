const express = require('express');
const router = express.Router();
const userController = require('@src/controllers/userController');
const auth = require('@src/middlewares/auth');

router.get('/:id', userController.getUserById);
router.put('/:id', auth, userController.updateUser);

module.exports = router;
