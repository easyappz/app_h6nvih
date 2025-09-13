const express = require('express');
const auth = require('@src/middlewares/auth');
const messageController = require('@src/controllers/messageController');

const router = express.Router();

// Health/status endpoint
router.get('/status', (req, res) => {
  const isMongoConfigured = Boolean(process.env.MONGO_URI);
  res.json({
    ok: true,
    data: {
      status: 'ok',
      mongoConfigured: isMongoConfigured,
      timestamp: new Date().toISOString()
    }
  });
});

// Sub-routers
router.use('/auth', require('@src/routes/auth'));
router.use('/users', require('@src/routes/users'));
router.use('/search', require('@src/routes/search'));
router.use('/posts', require('@src/routes/posts'));
router.use('/friends', require('@src/routes/friends'));
router.use('/messages', require('@src/routes/messages'));
router.use('/upload', require('@src/routes/upload'));

// Conversations endpoint (protected)
router.get('/conversations', auth, messageController.getConversations);

module.exports = router;
