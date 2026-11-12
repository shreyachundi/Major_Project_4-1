import { fetchTranscript } from 'youtube-transcript';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { callLLM } from './llm.service.js'; // Use your multi-LLM service instead

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

const vectorStore = new Map();

export async function embedText(text, taskType = 'RETRIEVAL_DOCUMENT') {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { taskType },
  });
  return response.embeddings[0].values;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function chunkText(text, maxChars = 1500, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start >= text.length - overlap) break;
  }
  return chunks.filter(c => c.length > 50);
}

export async function indexVideo(videoId, videoTitle, channelId) {
  try {
    console.log(`📥 Fetching transcript for: ${videoTitle}`);
    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (err) {
      console.log(`⚠️  No transcript for ${videoId}`);
      return 0;
    }

    const fullText = transcript.map(t => t.text).join(' ');
    if (!fullText || fullText.length < 100) return 0;

    const chunks = chunkText(fullText);
    if (!vectorStore.has(channelId)) vectorStore.set(channelId, []);
    const store = vectorStore.get(channelId);

    const filtered = store.filter(c => c.videoId !== videoId);
    vectorStore.set(channelId, filtered);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      vectorStore.get(channelId).push({
        videoId, videoTitle, chunkIndex: i, text: chunks[i], embedding,
      });
    }
    console.log(`✅ Indexed ${chunks.length} chunks for "${videoTitle}"`);
    return chunks.length;
  } catch (error) {
    console.error(`❌ Failed to index ${videoId}:`, error.message);
    return 0;
  }
}

export async function retrieveContext(question, channelId, topK = 5) {
  const store = vectorStore.get(channelId);
  if (!store || store.length === 0) return [];

  const queryEmbedding = await embedText(question, 'RETRIEVAL_QUERY');
  const scored = store.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => ({
    text: s.text, videoId: s.videoId, videoTitle: s.videoTitle, score: s.score,
  }));
}

export async function answerWithRAG(question, channelId, channelData) {
  const context = await retrieveContext(question, channelId);

  if (context.length === 0) {
    return {
      answer: 'I could not find any relevant content in your videos for that question.',
      sources: [],
    };
  }

  const contextText = context
    .map((c, i) => `[Video: "${c.videoTitle}"]\n${c.text}`)
    .join('\n\n---\n\n');

  const prompt = `
You are CreatorIQ. Answer the user's question using ONLY the transcript excerpts below.
If the answer is not in the excerpts, say so clearly.

TRANSCRIPT EXCERPTS:
${contextText}

USER QUESTION: ${question}

Answer in 2-4 sentences, citing the video title.
  `.trim();

  try {
    // Use the multi-LLM service so it falls back to Groq if Gemini fails
    const { text } = await callLLM(prompt);
    return {
      answer: text,
      sources: context.map(c => ({ videoId: c.videoId, videoTitle: c.videoTitle })),
    };
  } catch (error) {
    console.error('❌ RAG LLM Error:', error.message);
    // Pass the REAL error back to the UI
    throw new Error(`AI Provider Error: ${error.message}`);
  }
}