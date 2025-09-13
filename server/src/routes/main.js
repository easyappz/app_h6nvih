const express = require('express');

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

module.exports = router;
