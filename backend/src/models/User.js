const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['customer', 'admin', 'owner'], default: 'customer' },
  tier: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  tierExpiry: { type: Date, default: null },
  credits: { type: Number, default: 2 },
  bankAccount: {
    country: { type: String, enum: ['south-africa', 'african', 'global'] },
    accountName: String,
    accountNumber: String,
    bankCode: String,
    branchCode: String,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.useCredit = async function() {
  if (this.tier === 'free' && this.credits > 0) {
    this.credits -= 1;
    await this.save();
    return true;
  }
  return false;
};

userSchema.statics.resetMonthlyFreeCredits = async function() {
  await this.updateMany(
    { tier: 'free', credits: { $lt: 2 } },
    { $set: { credits: 2 } }
  );
  console.log('Monthly free credits reset');
};

module.exports = mongoose.model('User', userSchema);
