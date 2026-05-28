const crypto = require('crypto');

exports.generateOrderId = () => {
  return `ORD_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};

exports.formatCurrency = (amount, currency = 'ZAR') => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);
};

exports.calculatePagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

exports.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.extractErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'An unknown error occurred';
};

exports.sanitizeUser = (user) => {
  const { password, resetPasswordToken, ...safe } = user.toObject ? user.toObject() : user;
  return safe;
};

exports.isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
