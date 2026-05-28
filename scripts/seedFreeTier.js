const { connectDB } = require('../config/database');
const User = require('../models/User');

async function seedFreeTier() {
  await connectDB();
  
  const result = await User.updateMany(
    { tier: 'free', credits: { $lt: 2 } },
    { $set: { credits: 2 } }
  );
  
  console.log(`✅ Free tier credits seeded: ${result.modifiedCount} users updated`);
  process.exit(0);
}

seedFreeTier();
