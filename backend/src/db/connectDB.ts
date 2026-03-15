import mongoose from 'mongoose';
import { env } from '../config/env';

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
