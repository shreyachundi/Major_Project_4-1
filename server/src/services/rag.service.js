import { fetchTranscript } from 'youtube-transcript';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

// In-memory vector store — no external DB needed
// Structure: { channelId: [ { videoId, videoTitle, chunkIndex, text, embedding } ] }
const vectorStore = new Map();

// Generate embedding for a piece of text
export async function embedText(text, taskType = 'RETRIEVAL_DOCUMENT') {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { taskType },
  });
  return response.embeddings[0].values;
}

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Split long transcript into overlapping chunks
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

// Fetch transcript and index it into the in-memory store
export async function indexVideo(videoId, videoTitle, channelId) {
  try {
    console.log(`📥 Fetching transcript for: ${videoTitle}`);

    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (err) {
      console.log(`⚠️  No transcript for ${videoId}: ${err.message}`);
      return 0;
    }

    const fullText = transcript.map(t => t.text).join(' ');
    if (!fullText || fullText.length < 100) {
      console.log(`⚠️  Transcript too short for ${videoId}`);
      return 0;
    }

    const chunks = chunkText(fullText);

    // Get or create channel store
    if (!vectorStore.has(channelId)) {
      vectorStore.set(channelId, []);
    }
    const store = vectorStore.get(channelId);

    // Remove existing chunks for this video (in case of re-index)
    const filtered = store.filter(c => c.videoId !== videoId);
    vectorStore.set(channelId, filtered);

    // Embed and store each chunk
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      vectorStore.get(channelId).push({
        videoId,
        videoTitle,
        chunkIndex: i,
        text: chunks[i],
        embedding,
      });
    }

    console.log(`✅ Indexed ${chunks.length} chunks for "${videoTitle}"`);
    return chunks.length;
  } catch (error) {
    console.error(`❌ Failed to index ${videoId}:`, error.message);
    return 0;
  }
}

// Retrieve relevant chunks for a query
export async function retrieveContext(question, channelId, topK = 5) {
  const store = vectorStore.get(channelId);
  if (!store || store.length === 0) {
    return [];
  }

  // Embed the question as a query
  const queryEmbedding = await embedText(question, 'RETRIEVAL_QUERY');

  // Score all chunks and return top K
  const scored = store.map(item => ({
    ...item,
    score: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map(s => ({
    text: s.text,
    videoId: s.videoId,
    videoTitle: s.videoTitle,
    score: s.score,
  }));
}

// Answer a question with RAG
export async function answerWithRAG(question, channelId, channelData) {
  const context = await retrieveContext(question, channelId);

  if (context.length === 0) {
    return {
      answer: 'I could not find any relevant content in your videos for that question. Try indexing your videos first by clicking "📚 Index My Videos".',
      sources: [],
    };
  }

  const contextText = context
    .map((c, i) => `[Video: "${c.videoTitle}" - excerpt ${i + 1}]\n${c.text}`)
    .join('\n\n---\n\n');

  const prompt = `
You are CreatorIQ, an AI assistant with access to the creator's YouTube video transcripts.
Answer the user's question based ONLY on the transcript excerpts below.

If the answer is not in the excerpts, say so clearly.

Channel: ${channelData.channel.name}
Subscribers: ${channelData.channel.subscribers}

TRANSCRIPT EXCERPTS:
${contextText}

USER QUESTION: ${question}

Answer in 2-4 sentences, citing which video the information came from.
  `.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
  });

  return {
    answer: response.text,
    sources: context.map(c => ({ videoId: c.videoId, videoTitle: c.videoTitle })),
  };
}

// Get stats about the store
export function getStoreStats(channelId) {
  const store = vectorStore.get(channelId);
  return {
    chunks: store?.length || 0,
    videos: new Set(store?.map(c => c.videoId) || []).size,
  };
}