import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireChannel } from '../middleware/userChannel.js';
import { indexVideo, answerWithRAG, retrieveContext } from '../services/rag.service.js';
import { getChannelData } from '../services/youtube.service.js';

const router = Router();
router.use(requireAuth);
router.use(requireChannel);

// Index all recent videos
router.post('/index', async (req, res) => {
  try {
    const channelData = await getChannelData(req.channelId);
    const { recentVideos } = channelData;

    let totalChunks = 0;
    const results = [];

    for (const video of recentVideos) {
      const count = await indexVideo(video.id, video.title, req.channelId);
      totalChunks += count;
      results.push({ videoId: video.id, title: video.title, chunks: count });
    }

    res.json({ ok: true, totalChunks, videos: results });
  } catch (error) {
    console.error('Indexing error:', error.message);
    res.status(500).json({ error: 'Failed to index videos' });
  }
});

// Ask a question with RAG
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question) return res.status(400).json({ error: 'Question required' });

    const channelData = await getChannelData(req.channelId);
    const result = await answerWithRAG(question, req.channelId, channelData);
    res.json(result);
  } catch (error) {
    console.error('RAG error:', error.message);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

// Search transcripts without LLM (raw results)
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body || {};
    const results = await retrieveContext(query, req.channelId, 10);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;