const express = require('express');
const router = express.Router();
const auth = require('@src/middlewares/auth');
const controller = require('@src/controllers/friendController');

router.use(auth);

router.post('/request/:userId', controller.sendRequest);
router.post('/accept/:userId', controller.acceptRequest);
router.delete('/:userId', controller.removeFriend);
router.get('/list/:userId', controller.getFriends);
router.get('/requests', controller.getRequests);

module.exports = router;
