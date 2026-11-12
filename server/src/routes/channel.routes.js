import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { getChannelData, resolveChannelId } from '../services/youtube.service.js';
import { getMyChannel } from '../services/google.service.js';
import { updateUserChannel } from '../services/auth.service.js';
import { getCached, setCached } from '../utils/cache.js';

const router = Router();

router.post('/connect-with-google', async (req, res) => {
  try {
    const { accessToken, userId } = req.body || {};
    if (!accessToken || !userId) return res.status(400).json({ error: 'Access token and user ID required' });

    const channel = await getMyChannel(accessToken);

    await updateUserChannel(userId, {
      channelId: channel.id,
      channelUrl: `https://youtube.com/channel/${channel.id}`,
      channelName: channel.name,
      subscribers: channel.subscribers,
    });

    res.json({ ok: true, channel });
  } catch (err) {
    console.error('connect-with-google error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post('/connect', requireAuth, async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Channel URL required' });

    const channelId = await resolveChannelId(url);
    const data = await getChannelData(channelId);

    await updateUserChannel(req.user.id, {
      channelId,
      channelUrl: url,
      channelName: data.channel.name,
      subscribers: data.channel.subscribers,
    });

    setCached(`channel:${channelId}`, data, 600);
    res.json({ ok: true, channel: data.channel });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/summary', requireAuth, requireChannel, async (req, res) => {
  try {
    const cacheKey = `channel:${req.channelId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      // Even if data is cached, make sure the user doc is updated
      await updateUserChannel(req.user.id, {
        channelId: req.channelId,
        channelUrl: req.userDoc?.channelUrl || `https://youtube.com/channel/${req.channelId}`,
        channelName: cached.channel.name,
        subscribers: cached.channel.subscribers,
      });
      console.log('✅ Returning cached channel data');
      return res.json(cached);
    }
    
    const data = await getChannelData(req.channelId);
    setCached(cacheKey, data, 600);

    // Save the fresh data to MongoDB
    await updateUserChannel(req.user.id, {
      channelId: req.channelId,
      channelUrl: req.userDoc?.channelUrl || `https://youtube.com/channel/${req.channelId}`,
      channelName: data.channel.name,
      subscribers: data.channel.subscribers,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;