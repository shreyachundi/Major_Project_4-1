import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { getChannelData, resolveChannelId } from '../services/youtube.service.js';
import { updateUserChannel } from '../services/auth.service.js';
import { getCached, setCached } from '../utils/cache.js';

const router = Router();
router.use(requireAuth);

router.post('/connect', async (req, res) => {
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

    // Cache the channel data
    setCached(`channel:${channelId}`, data, 600);

    res.json({ ok: true, channel: data.channel });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/summary', requireChannel, async (req, res) => {
  try {
    const cacheKey = `channel:${req.channelId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('✅ Returning cached channel data');
      return res.json(cached);
    }

    const data = await getChannelData(req.channelId);
    setCached(cacheKey, data, 600); // 10 min cache
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;