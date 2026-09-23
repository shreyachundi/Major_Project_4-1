import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { callLLM, parseJSON } from '../services/llm.service.js';
import { getCached, setCached } from '../utils/cache.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

function buildImageUrl(concept) {
  // Construct a prompt for Pollinations from the concept
  const prompt = [
    concept.thumbnailConcept,
    `text overlay saying "${concept.textOverlay}"`,
    concept.expression ? `${concept.expression} expression` : '',
    'YouTube thumbnail style, high contrast, bold colors, professional, cinematic lighting, 16:9',
  ].filter(Boolean).join(', ');

  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}`;
}

router.get('/', async (req, res) => {
  try {
    const cacheKey = `thumbnails:${req.channelId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('✅ Returning cached thumbnails');
      return res.json(cached);
    }

    const { channel, recentVideos, topPerforming } = req.channelData;
    const videoList = recentVideos.map(v => `- "${v.title}" (${v.viewCount} views)`).join('\n');
    const topList = (topPerforming || [])
      .map(v => `- "${v.title}" (${v.vsAverage > 0 ? '+' : ''}${v.vsAverage}% vs average)`)
      .join('\n');

    const prompt = `
You are a YouTube thumbnail strategist.
Generate thumbnail concepts for this channel's NEXT videos.

Channel: ${channel.name}

Recent videos:
${videoList}

Top performing videos:
${topList}

Return ONLY a JSON array (no markdown, no code fences) with exactly 4 thumbnail concepts.
Each concept must have these keys:
- "id": unique number
- "videoTitle": a compelling YouTube video title
- "thumbnailConcept": description of the visual (1-2 sentences) — this will be used to generate an image
- "textOverlay": 3-5 words of bold text
- "colorPalette": array of 3 hex colors
- "expression": suggested facial expression
- "why": 1 sentence on why it works
- "ctrPrediction": estimated CTR like "6.8%–9.2%"

Example:
[{"id":1,"videoTitle":"I Tried X for 30 Days","thumbnailConcept":"Close-up face on left, product on right with red arrow","textOverlay":"IT ACTUALLY WORKS","colorPalette":["#FF3B5C","#FFFFFF","#0F1117"],"expression":"shocked","why":"Faces + bold text increase CTR","ctrPrediction":"7.2%–10.1%"}]
`.trim();

    const { text } = await callLLM(prompt);
    const concepts = parseJSON(text);

    // Add generated image URLs
    const conceptsWithImages = concepts.map(c => ({
      ...c,
      imageUrl: buildImageUrl(c),
    }));

    const result = {
      concepts: conceptsWithImages,
      recentThumbnails: recentVideos.slice(0, 6).map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
      })),
    };

    setCached(cacheKey, result, 600);
    console.log('✅ Thumbnails generated with images');
    res.json(result);
  } catch (error) {
    console.error('❌ Thumbnails generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate thumbnail ideas. Please try again.' });
  }
});

export default router;