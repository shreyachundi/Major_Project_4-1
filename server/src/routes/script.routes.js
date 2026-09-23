import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { callLLM } from '../services/llm.service.js';
import { getCached, setCached } from '../utils/cache.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

router.post('/', async (req, res) => {
  try {
    const { videoTitle, why, channelName, subscribers } = req.body || {};
    if (!videoTitle) return res.status(400).json({ error: 'Video title required' });

    const cacheKey = `script:${req.channelId}:${videoTitle}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const prompt = `
You are a professional YouTube scriptwriter.
Write a COMPLETE, ready-to-record video script for the video below.

Channel: ${channelName} (${subscribers} subscribers)
Video Title: "${videoTitle}"
Why this works: ${why || 'Relevant to the channel\'s audience'}

Return the script in this exact structure (plain text, no markdown):

HOOK (0:00-0:15)
[Write the opening 15 seconds — must be attention-grabbing]

INTRO (0:15-0:45)
[Briefly introduce the topic and what viewers will learn]

MAIN CONTENT
[3-5 sections with clear headers and talking points. Each section should have: what to say, what to show on screen, and tips]

CALL TO ACTION (End)
[What to ask viewers to do — subscribe, comment, watch next]

TITLE & DESCRIPTION
[Suggested YouTube title]
[Suggested description, 2-3 sentences]

TAGS
[5-10 relevant tags]

Keep it specific to the title and channel's niche. Aim for a 5-10 minute video.
    `.trim();

    const { text } = await callLLM(prompt);
    const result = { script: text };
    setCached(cacheKey, result, 3600); // cache 1 hour
    res.json(result);
  } catch (error) {
    console.error('❌ Script error:', error.message);
    res.status(500).json({ error: 'Failed to generate script. Please try again.' });
  }
});

export default router;