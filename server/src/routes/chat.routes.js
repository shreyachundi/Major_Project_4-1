import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { callLLM } from '../services/llm.service.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Message required' });

    const { channel, recentVideos, topPerforming, kpis, engagementRate, avgViews } = req.channelData;

    // Build channel context for the chatbot
    const kpiSummary = kpis.map(k => `${k.label}: ${k.value}`).join('\n');
    const videoList = (recentVideos || [])
      .map(v => `- "${v.title}" (${v.viewCount} views, ${v.likeCount} likes)`)
      .join('\n');
    const topList = (topPerforming || [])
      .map(v => `- "${v.title}" (${v.vsAverage > 0 ? '+' : ''}${v.vsAverage}% vs average)`)
      .join('\n');

    const historyText = (history || [])
      .slice(-6) // last 6 messages for context
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const prompt = `
You are CreatorIQ Assistant — a friendly, expert YouTube growth coach embedded in a creator's dashboard.
You have FULL ACCESS to the creator's channel data below. Answer their questions using REAL data.

=== CHANNEL CONTEXT ===
Channel: ${channel.name}
Subscribers: ${channel.subscribers}
${kpiSummary}
Engagement rate: ${engagementRate}%
Average views per video: ${avgViews}

Recent videos:
${videoList}

Top performing videos:
${topList}
=== END CONTEXT ===

${historyText ? `Previous conversation:\n${historyText}\n` : ''}

User's new message: ${message}

Reply in a helpful, concise way (2-4 sentences or a short list). Be specific to THIS channel's data.
Use plain text — no markdown formatting, no code fences.
    `.trim();

    const { text } = await callLLM(prompt);
    res.json({ reply: text });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ error: 'Chat is temporarily unavailable. Please try again.' });
  }
});

export default router;