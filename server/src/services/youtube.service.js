import { google } from 'googleapis';
import { env } from '../config/env.js';
import { parseChannelUrl } from '../utils/youtubeUrl.js';
import { getCachedChannelId, setCachedChannelId } from '../utils/channelCache.js';

const youtube = google.youtube({
  version: 'v3',
  auth: env.youtubeApiKey,
});

export async function resolveChannelId(input) {
  if (!input) throw new Error('Channel URL required');

  // 1. Check cache first (costs 0 units)
  const cached = getCachedChannelId(input);
  if (cached) {
    console.log(`✅ Channel ID from cache: ${cached}`);
    return cached;
  }

  // 2. Parse the URL
  const parsed = parseChannelUrl(input);
  if (!parsed) throw new Error('Could not parse YouTube URL. Try pasting the full channel URL.');

  // 3. If it's already a channel ID, return directly (costs 0 units)
  if (parsed.type === 'channelId') {
    setCachedChannelId(input, parsed.value);
    return parsed.value;
  }

  // 4. Check cache again with just the handle
  const handleKey = parsed.value;
  const cachedHandle = getCachedChannelId(handleKey);
  if (cachedHandle) {
    console.log(`✅ Handle resolved from cache: ${handleKey} → ${cachedHandle}`);
    setCachedChannelId(input, cachedHandle);
    return cachedHandle;
  }

  // 5. Fall back to search.list — costs 100 units (use sparingly!)
  console.log(`🔍 Calling YouTube search.list for ${handleKey} (costs 100 units)`);

  try {
    const searchRes = await youtube.search.list({
      part: 'snippet',
      q: handleKey,
      type: 'channel',
      maxResults: 1,
    });
    const item = searchRes.data.items?.[0];
    if (!item) throw new Error('No channel found for that URL');

    const channelId = item.snippet.channelId || item.id.channelId;

    // Cache the result so we never pay again
    setCachedChannelId(input, channelId);
    setCachedChannelId(handleKey, channelId);

    console.log(`✅ Resolved and cached: ${handleKey} → ${channelId}`);
    return channelId;
  } catch (error) {
    if (error.message?.includes('quota')) {
      throw new Error(
        'YouTube quota exceeded. Wait until tomorrow for it to reset. ' +
        'In the meantime, you can paste the direct channel URL (https://youtube.com/channel/UCxxxx) to avoid searches.'
      );
    }
    throw error;
  }
}

export async function getChannelData(channelId) {
  if (!channelId) throw new Error('Channel ID required');

  try {
    // 1. Get channel info (1 unit)
    const channelResponse = await youtube.channels.list({
      part: 'snippet,statistics,contentDetails',
      id: channelId,
    });

    const channel = channelResponse.data.items?.[0];
    if (!channel) throw new Error('Channel not found');

    const subscriberCount = Number(channel.statistics.subscriberCount || 0);
    const viewCount = Number(channel.statistics.viewCount || 0);
    const videoCount = Number(channel.statistics.videoCount || 0);
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    // 2. Get recent video IDs from uploads playlist (1 unit)
    let recentVideoIds = [];
    if (uploadsPlaylistId) {
      const playlistResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: 10,
      });
      recentVideoIds = (playlistResponse.data.items || [])
        .map(item => item.snippet.resourceId?.videoId)
        .filter(Boolean);
    }

    // 3. Get detailed stats for videos (1 unit)
    let recentVideos = [];
    if (recentVideoIds.length > 0) {
      const videosResponse = await youtube.videos.list({
        part: 'snippet,statistics',
        id: recentVideoIds.join(','),
      });

      recentVideos = (videosResponse.data.items || []).map(v => ({
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
        viewCount: Number(v.statistics.viewCount || 0),
        likeCount: Number(v.statistics.likeCount || 0),
        commentCount: Number(v.statistics.commentCount || 0),
      }));
    }

    const avgViews = recentVideos.length
      ? Math.round(recentVideos.reduce((sum, v) => sum + v.viewCount, 0) / recentVideos.length)
      : 0;

    const topPerforming = [...recentVideos]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3)
      .map(v => ({
        id: v.id,
        title: v.title,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
        thumbnail: v.thumbnail,
        vsAverage: avgViews ? Math.round(((v.viewCount - avgViews) / avgViews) * 100) : 0,
      }));

    const engagementRate = recentVideos.length
      ? Math.round(
          (recentVideos.reduce((sum, v) => sum + v.likeCount + v.commentCount, 0) /
            Math.max(recentVideos.reduce((sum, v) => sum + v.viewCount, 0), 1)) *
            10000
        ) / 100
      : 0;

    const kpis = [
      { label: 'Total Views', value: formatNumber(viewCount), delta: 0, trend: 'neutral' },
      { label: 'Subscribers', value: formatNumber(subscriberCount), delta: 0, trend: 'neutral' },
      { label: 'Total Videos', value: formatNumber(videoCount), delta: 0, trend: 'neutral' },
      { label: 'Avg. Views/Video', value: formatNumber(avgViews), delta: 0, trend: 'neutral' },
    ];

    return {
      channel: {
        id: channelId,
        name: channel.snippet.title,
        initials: channel.snippet.title.substring(0, 2).toUpperCase(),
        subscribers: subscriberCount,
        thumbnail: channel.snippet.thumbnails?.default?.url,
        periodLabel: 'Live Data',
      },
      kpis,
      recentVideos,
      topPerforming,
      engagementRate,
      avgViews,
      sentiment: {
        labels: ['Positive', 'Neutral', 'Questions', 'Critical'],
        data: [58, 22, 14, 6],
      },
    };
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    throw new Error('Failed to fetch YouTube data. ' + error.message);
  }
}

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}