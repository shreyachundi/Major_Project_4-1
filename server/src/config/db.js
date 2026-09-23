import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.mongodbUri) {
    console.warn('⚠️  MONGODB_URI not set — running without database');
    return;
  }
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}