import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { callLLM, parseJSON } from '../services/llm.service.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const count = parseInt(req.query.count) || 5;

    const { channel, recentVideos, kpis, topPerforming } = req.channelData;
    const videoTitles = recentVideos.map(v => `- ${v.title}`).join('\n');
    const kpiSummary = kpis.map(k => `${k.label}: ${k.value}`).join('\n');
    const topList = (topPerforming || [])
      .map(v => `- "${v.title}" (${v.vsAverage > 0 ? '+' : ''}${v.vsAverage}% vs avg)`)
      .join('\n');

    const existingTitles = (req.query.existing || '').split('|').filter(Boolean);
    const avoidText = existingTitles.length
      ? `\nIMPORTANT: Do NOT repeat these existing ideas:\n${existingTitles.map(t => `- ${t}`).join('\n')}\n`
      : '';

    const prompt = `
You are a YouTube growth strategist AND SEO specialist.
Based on this channel's data, generate 5 NEW video ideas with SEO-optimized titles.

Channel: ${channel.name}
Subscribers: ${channel.subscribers}
${kpiSummary}

Recent Videos:
${videoTitles}

Return ONLY a JSON array with exactly 5 objects with these keys:
- "id": unique string
- "score": number 0-100
- "tier": "hot"|"good"|"avg"
- "title": creative/catchy video title (as before)
- "seoTitle": SEO-optimized title that includes high-search keywords, current year (2025), numbers, or modifiers like "(Full Guide)", "Ranked", "Beginner to Pro" etc.
- "keywords": array of 4-6 specific search keywords this video should target
- "why": 1-2 sentence reason
- "predictedViews": estimated range
- "bestLength": recommended length
- "upload": suggested publish time

Example:
[{"id":"1","score":92,"tier":"hot","title":"I Tried 7 AI Tools for a Week","seoTitle":"7 Best AI Tools for Content Creators in 2025 (Tested & Ranked)","keywords":["best ai tools 2025","ai tools for youtubers","free ai tools","ai content creation"],"why":"Search volume for 'best AI tools 2025' is high and competitors under-serve this niche","predictedViews":"80K–140K","bestLength":"9–12 min","upload":"Tuesday 7 PM"}]
`.trim();

    console.log(`🔵 Generating ${count} ideas (page ${page})...`);
    const { text } = await callLLM(prompt);
    const ideas = parseJSON(text);

    // Give each idea a unique id
    const ideasWithIds = ideas.map((idea, i) => ({
      ...idea,
      id: `${Date.now()}-${i}`,
    }));

    console.log(`✅ ${ideasWithIds.length} ideas generated`);
    res.json({ ideas: ideasWithIds, page });
  } catch (error) {
    console.error('❌ Ideas generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate ideas. Please try again in a moment.' });
  }
});

export default router;