import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { generateInsights } from '../services/ai.service.js';
import { getCached, setCached } from '../utils/cache.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

router.get('/', async (req, res) => {
  try {
    const cacheKey = `insights:${req.channelId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('✅ Returning cached insights');
      return res.json(cached);
    }

    const insights = await generateInsights(req.channelData);

    const result = {
      insights,
      working: [
        { text: 'Your top videos show clear topic preferences in your audience.' },
        { text: 'Higher engagement videos share a common structure worth replicating.' },
      ],
      hurting: [
        { text: 'Videos that underperform lack the engagement patterns of your hits.' },
        { text: 'Consider matching the format of your top 3 videos.' },
      ],
    };

    setCached(cacheKey, result, 600);
    res.json(result);
  } catch (error) {
    console.error('❌ Insights Error:', error.message);
    res.status(500).json({ error: 'Failed to load insights' });
  }
});

export default router;