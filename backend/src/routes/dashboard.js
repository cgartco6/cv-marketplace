const express = require('express');
const { authMiddleware } = require('./auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();
router.use(authMiddleware);

router.get('/customer', dashboardController.getCustomerDashboard);
router.get('/admin', dashboardController.getAdminDashboard);
router.get('/owner', dashboardController.getOwnerDashboard);

module.exports = router;
