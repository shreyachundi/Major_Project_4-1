import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { callLLM, parseJSON } from '../services/llm.service.js';
import { getCached, setCached } from '../utils/cache.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

router.get('/', async (req, res) => {
  try {
    const cacheKey = `competitors:${req.channelId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('✅ Returning cached competitors');
      return res.json(cached);
    }

    const { channel, kpis, recentVideos } = req.channelData;
    const kpiSummary = kpis.map(k => `${k.label}: ${k.value}`).join('\n');
    const videoTitles = recentVideos.map(v => `- ${v.title}`).join('\n');

    const prompt = `
You are a competitive intelligence analyst.
Produce a competitive benchmark for this channel.

Channel: ${channel.name}
Subscribers: ${channel.subscribers}
${kpiSummary}

Recent Videos:
${videoTitles}

Return ONLY a JSON object with:
{
  "cards": {
    "yours": { "name": "${channel.name}", "uploadsPerWeek": number, "avgViews": "string", "ctr": "string", "retention": "string" },
    "nicheAvg": { "name": "Similar Channels", "uploadsPerWeek": number, "avgViews": "string", "ctr": "string", "retention": "string" },
    "advantage": { "title": "Above Average", "lines": ["✅ ...", "⚠️ ...", "✅ ..."] }
  },
  "radar": { "labels": ["Views","CTR","Retention","Engagement","Upload Freq.","Growth"], "yours": [0-100 x6], "niche": [0-100 x6] },
  "insights": [{ "tag": "opportunity", "text": "..." }, { "tag": "warning", "text": "..." }, { "tag": "info", "text": "..." }]
}
`.trim();

    const { text } = await callLLM(prompt);
    const result = parseJSON(text);

    setCached(cacheKey, result, 600);
    console.log('✅ Competitors generated and cached');
    res.json(result);
  } catch (error) {
    console.error('❌ Competitors generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate competitive analysis. Please try again in a moment.' });
  }
});

export default router;