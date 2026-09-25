import { google } from 'googleapis';
import { env } from '../config/env.js';

export function createOAuthClient() {
  return new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    'http://localhost:4000/auth/google/callback'
  );
}

// Get the authenticated user's OWN channel (mine=true is the key!)
export async function getMyChannel(accessToken) {
  const auth = createOAuthClient();
  auth.setCredentials({ access_token: accessToken });

  const youtube = google.youtube({ version: 'v3', auth });

  // mine=true → returns ONLY the channel owned by the authenticated user
  const channelResponse = await youtube.channels.list({
    part: 'snippet,statistics,contentDetails',
    mine: true,
  });

  const channel = channelResponse.data.items?.[0];
  if (!channel) {
    throw new Error('No YouTube channel found for this Google account. Create a channel first at youtube.com.');
  }

  return {
    id: channel.id,
    name: channel.snippet.title,
    subscribers: Number(channel.statistics.subscriberCount || 0),
    thumbnail: channel.snippet.thumbnails?.default?.url,
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
  };
}