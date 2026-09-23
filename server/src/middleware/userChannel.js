import { findUserById } from '../services/auth.service.js';
import { getChannelData } from '../services/youtube.service.js';
import { getCached, setCached } from '../utils/cache.js';

export async function requireChannel(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user || !user.channelId) {
      return res.status(400).json({ error: 'NO_CHANNEL', message: 'Please connect your YouTube channel first' });
    }

    req.userDoc = user;
    req.channelId = user.channelId;

    // Try to load channel data from cache first
    const cacheKey = `channel:${req.channelId}`;
    let channelData = getCached(cacheKey);

    if (!channelData) {
      channelData = await getChannelData(req.channelId);
      setCached(cacheKey, channelData, 600);
    }

    // Attach to request so routes don't need to fetch again
    req.channelData = channelData;
    next();
  } catch (err) {
    console.error('requireChannel error:', err.message);
    res.status(500).json({ error: err.message });
  }
}