import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

export async function findUserById(id) {
  return User.findById(id);
}

export async function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.passwordHash);
}

export async function createUser({ email, password, name }) {
  const exists = await findUserByEmail(email);
  if (exists) throw new Error('User already exists');
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await User.create({ email, passwordHash, name: name || 'New Creator' });
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
  };
}