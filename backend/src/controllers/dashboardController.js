const User = require('../models/User');
const CV = require('../models/CV');
const Order = require('../models/Order');
const Payout = require('../models/Payout');
const Revenue = require('../models/Revenue');
const Tracker = require('../models/Tracker');

exports.getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const cvs = await CV.find({ userId }).sort('-createdAt').limit(10);
    const orders = await Order.find({ userId }).sort('-createdAt').limit(5);
    const latestOrder = orders[0];
    const remainingCredits = user.tier === 'free' ? user.credits : null;
    
    res.json({
      user: { name: user.name, email: user.email, tier: user.tier, tierExpiry: user.tierExpiry },
      cvs,
      orders,
      remainingCredits,
      atsScoreTrend: await getATSTrend(userId),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Dashboard error' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    if (!['admin', 'owner'].includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    
    const totalUsers = await User.countDocuments();
    const paidUsers = await User.countDocuments({ tier: { $ne: 'free' } });
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const revenueToday = await getRevenueByPeriod('day');
    const revenueMonth = await getRevenueByPeriod('month');
    const topPlans = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$tier', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      totalUsers,
      paidUsers,
      totalOrders,
      revenue: { today: revenueToday, month: revenueMonth },
      topPlans,
      recentOrders: await Order.find({ paymentStatus: 'paid' }).sort('-paidAt').limit(20).populate('userId', 'name email'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Admin dashboard error' });
  }
};

exports.getOwnerDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    
    const totalRevenue = await Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const payouts = await Payout.find().sort('-date').limit(30);
    const upgradeReserve = await getUpgradeReserve();
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7*24*60*60*1000) } });
    const marketingMetrics = await Tracker.find({ type: 'marketing' }).sort('-timestamp').limit(100);
    
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      upgradeReserve,
      recentPayouts: payouts,
      activeUsers,
      marketingMetrics,
      systemStatus: { ai: true, payments: true, workers: 'running' },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Owner dashboard error' });
  }
};

async function getRevenueByPeriod(period) {
  const start = new Date();
  if (period === 'day') start.setHours(0,0,0,0);
  else if (period === 'month') start.setDate(1);
  const result = await Order.aggregate([
    { $match: { paymentStatus: 'paid', paidAt: { $gte: start } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result[0]?.total || 0;
}

async function getATSTrend(userId) {
  const cvs = await CV.find({ userId }).sort('createdAt').select('atsScore createdAt');
  return cvs.map(cv => ({ date: cv.createdAt, score: cv.atsScore }));
}

async function getUpgradeReserve() {
  const payouts = await Payout.find().sort('-date');
  let reserve = 0;
  for (const p of payouts) {
    reserve += p.upgradeShare;
  }
  return reserve;
}
