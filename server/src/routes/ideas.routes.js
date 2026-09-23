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
You are a YouTube growth strategist.
Generate ${count} NEW, UNIQUE video ideas for this channel.

Channel: ${channel.name}
Subscribers: ${channel.subscribers}
${kpiSummary}

Recent Videos:
${videoTitles}

Top Performing Videos:
${topList}
${avoidText}

Return ONLY a JSON array with exactly ${count} objects with keys:
"id" (unique string), "score" (0-100), "tier" ("hot"|"good"|"avg"), "title",
"why", "predictedViews", "bestLength", "upload".
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