require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { connectDB } = require('./config/database');
const { setupQueues } = require('./config/queue');
const { validateEnv } = require('./config/envValidator');

validateEnv();

const authRoutes = require('./routes/auth');
const cvRoutes = require('./routes/cv');
const paymentRoutes = require('./routes/payment');
const dashboardRoutes = require('./routes/dashboard');
const marketingRoutes = require('./routes/marketing');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const startServer = async () => {
  try {
    await connectDB();
    await setupQueues();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
