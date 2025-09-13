const express = require('express');
const router = express.Router();
const auth = require('@src/middlewares/auth');
const controller = require('@src/controllers/messageController');

router.use(auth);

router.post('/:userId', controller.sendMessage);
router.get('/:userId', controller.getThread);

module.exports = router;
