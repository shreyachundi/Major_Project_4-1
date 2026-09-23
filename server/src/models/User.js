import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'New Creator' },
  channelId: { type: String, default: null },
  channelUrl: { type: String, default: null },
  channelName: { type: String, default: null },
  subscribers: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);