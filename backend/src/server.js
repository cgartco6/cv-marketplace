require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { connectDB } = require('./config/database');
const { setupQueues } = require('./config/queue');

// Routes
const authRoutes = require('./routes/auth');
const cvRoutes = require('./routes/cv');
const paymentRoutes = require('./routes/payment');
const dashboardRoutes = require('./routes/dashboard');
const marketingRoutes = require('./routes/marketing');
const adminRoutes = require('./routes/admin');

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Static files for uploaded CVs
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const startServer = async () => {
  await connectDB();
  await setupQueues();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();

module.exports = { app, server };
