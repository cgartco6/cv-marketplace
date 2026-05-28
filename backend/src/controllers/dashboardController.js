const User = require('../models/User');
const CV = require('../models/CV');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Tracker = require('../models/Tracker');

exports.getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    const cvs = await CV.find({ userId }).sort('-createdAt').limit(10);
    const orders = await Order.find({ userId }).sort('-createdAt').limit(5);
    const scoreTrend = await CV.find({ userId, atsScore: { $ne: null } })
      .select('atsScore createdAt')
      .sort('createdAt')
      .limit(10);

    res.json({
      user: {
        name: user.name,
        email: user.email,
        tier: user.tier,
        credits: user.credits,
        tierExpiry: user.tierExpiry
      },
      cvs,
      orders,
      atsTrend: scoreTrend
    });
  } catch (err) {
    console.error('Customer dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    if (!['admin', 'owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalUsers = await User.countDocuments();
    const paidUsers = await User.countDocuments({ tier: { $ne: 'free' } });
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const revenueToday = await Order.aggregate([
      { $match: { paymentStatus: 'paid', paidAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueMonth = await Order.aggregate([
      { $match: { paymentStatus: 'paid', paidAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const topPlans = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$tier', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .sort('-paidAt')
      .limit(20)
      .populate('userId', 'name email');

    res.json({
      totalUsers,
      paidUsers,
      totalOrders,
      revenue: {
        today: revenueToday[0]?.total || 0,
        month: revenueMonth[0]?.total || 0
      },
      topPlans,
      recentOrders
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOwnerDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const upgradeReserveResult = await Payout.aggregate([
      { $group: { _id: null, total: { $sum: '$upgradeShare' } } }
    ]);
    const upgradeReserve = upgradeReserveResult[0]?.total || 0;

    const payouts = await Payout.find().sort('-date').limit(30);

    const marketingMetrics = await Tracker.aggregate([
      { $match: { timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      } }
    ]);

    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalRevenue,
      upgradeReserve,
      upgradeReserveTarget: 5000,
      recentPayouts: payouts,
      activeUsers,
      marketingMetrics,
      systemStatus: {
        ai: 'operational',
        payments: 'operational',
        workers: 'running'
      }
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};
