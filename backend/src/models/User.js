const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'owner'], default: 'customer' },
  tier: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  tierExpiry: { type: Date, default: null },
  credits: { type: Number, default: 0 }, // For free tier limited rewrites
  bankAccount: {
    country: String, // 'south-africa', 'african', 'global'
    accountName: String,
    accountNumber: String,
    bankCode: String,
    branchCode: String,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
