import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

export async function findUserById(id) {
  return User.findById(id);
}

export async function findUserByGoogleId(googleId) {
  return User.findOne({ googleId });
}

export async function verifyPassword(user, password) {
  if (!user.passwordHash) return false;
  return bcrypt.compareSync(password, user.passwordHash);
}

export async function createUser({ email, password, name }) {
  const exists = await findUserByEmail(email);
  if (exists) throw new Error('User already exists');
  const passwordHash = bcrypt.hashSync(password, 10);
  return User.create({ email, passwordHash, name: name || 'New Creator', authProvider: 'local' });
}

export async function findOrCreateGoogleUser({ googleId, email, name }) {
  // 1. Try to find by googleId
  let user = await findUserByGoogleId(googleId);
  if (user) return user;

  // 2. Try to find by email (existing local account)
  user = await findUserByEmail(email);
  if (user) {
    // Link Google to existing account
    user.googleId = googleId;
    user.authProvider = 'google';
    await user.save();
    return user;
  }

  // 3. Create a new user
  user = await User.create({
    email,
    googleId,
    name: name || 'New Creator',
    authProvider: 'google',
  });
  return user;
}

export async function updateUserChannel(userId, { channelId, channelUrl, channelName, subscribers }) {
  return User.findByIdAndUpdate(
    userId,
    { channelId, channelUrl, channelName, subscribers },
    { new: true }
  );
}

export function publicUser(u) {
  return {
    id: u._id.toString(),
    email: u.email,
    name: u.name,
    channelId: u.channelId,
    channelUrl: u.channelUrl,
    channelName: u.channelName,
    subscribers: u.subscribers,
    authProvider: u.authProvider,
  };
}