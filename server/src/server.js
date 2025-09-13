'use strict';
require('module-alias/register');

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const apiRoutes = require('@src/routes/main');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB connection
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not set. Some API endpoints will respond with an error.');
    } else {
      mongoose.set('strictQuery', true);
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
})();

// Return meaningful error if DB connection string is missing (except /api/status)
app.use('/api', (req, res, next) => {
  if (req.path === '/status') return next();
  if (!process.env.MONGO_URI) {
    return res.status(500).json({
      ok: false,
      error: 'MONGO_URI is not set. Please provide MongoDB connection string via environment variable MONGO_URI.'
    });
  }
  return next();
});

// Routes
app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
