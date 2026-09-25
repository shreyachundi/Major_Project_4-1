import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { getChannelData, resolveChannelId } from '../services/youtube.service.js';
import { getMyChannel } from '../services/google.service.js';
import { updateUserChannel } from '../services/auth.service.js';
import { getCached, setCached } from '../utils/cache.js';
import { env } from '../config/env.js';

const router = Router();

// NEW: Connect channel using Google OAuth token (secure — only own channel)
router.post('/connect-with-google', async (req, res) => {
  try {
    const { accessToken } = req.body || {};
    if (!accessToken) return res.status(400).json({ error: 'Access token required' });

    // Fetch ONLY the user's own channel (mine=true)
    const channel = await getMyChannel(accessToken);

    // Save to user (using JWT id from token)
    // But this route doesn't require auth — it's called right after OAuth redirect
    // Actually we'll accept userId from body since frontend has JWT
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: 'User ID required' });

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

// Legacy: connect via pasted URL (keep for reference, or remove later)
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
      console.log('✅ Returning cached channel data');
      return res.json(cached);
    }
    const data = await getChannelData(req.channelId);
    setCached(cacheKey, data, 600);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;