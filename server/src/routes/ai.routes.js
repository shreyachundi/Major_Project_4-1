import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { answerQuestion, getSuggestions } from '../services/ai.service.js';
import { getChannelData } from '../services/youtube.service.js';

const router = Router();
router.use(requireAuth);

router.get('/suggestions', (_req, res) => {
  res.json({ suggestions: getSuggestions() });
});

router.post('/ask', requireChannel, async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question) return res.status(400).json({ error: 'Question required' });
    const channelData = await getChannelData(req.channelId);
    const result = await answerQuestion(question, channelData);
    res.json(result);
  } catch (error) {
    console.error('AI Ask Error:', error.message);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;