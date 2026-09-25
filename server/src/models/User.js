import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, default: null },   // null for OAuth-only users
  googleId: { type: String, default: null, index: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  name: { type: String, default: 'New Creator' },
  channelId: { type: String, default: null },
  channelUrl: { type: String, default: null },
  channelName: { type: String, default: null },
  subscribers: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);