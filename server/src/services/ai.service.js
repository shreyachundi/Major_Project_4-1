import { callLLM, parseJSON } from './llm.service.js';

export async function generateInsights(channelData) {
  const { name, subscribers, kpis, recentVideos, topPerforming, engagementRate, avgViews } = channelData;

  const kpiSummary = kpis.map(k => `${k.label}: ${k.value}`).join('\n');
  const allVideos = recentVideos
    .map(v => `- "${v.title}" — ${v.viewCount} views, ${v.likeCount} likes, ${v.commentCount} comments`)
    .join('\n');
  const topVids = topPerforming
    .map(v => `- "${v.title}" — ${v.vsAverage > 0 ? '+' : ''}${v.vsAverage}% vs channel average`)
    .join('\n');

  const prompt = `
You are CreatorIQ, an AI YouTube audience analyst.
Analyze what this channel's AUDIENCE actually likes based on REAL engagement metrics.

Channel: ${name}
Subscribers: ${subscribers}
${kpiSummary}
Average views per video: ${avgViews}
Overall engagement rate: ${engagementRate}%

Recent videos with REAL engagement:
${allVideos}

Top 3 performing videos (compared to channel average):
${topVids}

Your task:
1. Identify PATTERNS in what the audience likes (topics, formats, video lengths).
2. Point out what's NOT working (underperforming content).
3. Give actionable recommendations.

Return ONLY a JSON array (no markdown, no code fences) with exactly 4 objects having "tag" and "text".
"tag" must be: opportunity, warning, critical, or info.

Example:
[{"tag":"opportunity","text":"Your tech review videos average 2x more views than tutorials."}]
  `.trim();

  try {
    const { text } = await callLLM(prompt);
    return parseJSON(text);
  } catch (error) {
    console.error('❌ Insights generation failed:', error.message);
    return [
      { tag: 'info', text: 'AI insights are temporarily unavailable. Please try again in a moment.' },
    ];
  }
}

export async function answerQuestion(question, channelData) {
  const { channel, recentVideos, kpis, engagementRate } = channelData;

  const videoTitles = recentVideos
    .map(v => `- "${v.title}" (${v.viewCount} views, ${v.likeCount} likes)`)
    .join('\n');
  const kpiSummary = kpis.map(k => `${k.label}: ${k.value}`).join('\n');

  const prompt = `
You are CreatorIQ, an AI YouTube growth coach.
Answer the creator's question using ONLY the data below.

Channel: ${channel.name}
Subscribers: ${channel.subscribers}
${kpiSummary}
Engagement rate: ${engagementRate}%

Recent videos with engagement:
${videoTitles}

Question: ${question}

Reply in 2-3 sentences with specific, data-backed advice. Use <b> tags for emphasis.
  `.trim();

  try {
    const { text } = await callLLM(prompt);
    return { answer: text };
  } catch (error) {
    console.error('❌ Answer failed:', error.message);
    return { answer: 'Sorry, I could not process that request right now. Please try again in a minute.' };
  }
}

export function getSuggestions() {
  return [
    { label: 'What content do my viewers like most?', q: 'Based on my top performing videos, what topics do my viewers like most?' },
    { label: 'Which video should I make a sequel to?', q: 'Which of my videos should I make a sequel to based on engagement?' },
    { label: 'Why is my engagement low?', q: 'Why is my engagement rate lower than expected, and how can I improve it?' },
    { label: 'What content should I stop making?', q: 'Based on my low-performing videos, what content should I stop making?' },
  ];
}