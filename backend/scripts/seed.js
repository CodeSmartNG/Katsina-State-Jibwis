import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Seed admin already exists:', email);
  } else {
    await User.create({
      fullName: 'Seed State Admin',
      email,
      password,
      role: 'stateAdmin',
      state: 'Kano',
      isApproved: true,
    });
    console.log('✅ Seed admin created:', email, '/', password);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
