const express = require('express');
const router = express.Router();
const auth = require('@src/middlewares/auth');
const postController = require('@src/controllers/postController');

router.use(auth);

router.post('/', postController.createPost);
router.get('/feed', postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);
router.post('/:id/like', postController.likePost);
router.post('/:id/comment', postController.addComment);
router.delete('/:id', postController.deletePost);

module.exports = router;
