// In-memory cache: handle/URL → channelId
// Prevents repeated search.list calls (100 units each) for the same channel

const handleToChannelId = new Map();

// Pre-seeded channels to save YouTube quota (search.list = 100 units per call)
handleToChannelId.set('@shreyachundi', 'UCa-E8MzzEmqieB5XsBzoSNw');
handleToChannelId.set('shreyachundi', 'UCa-E8MzzEmqieB5XsBzoSNw');
handleToChannelId.set('https://www.youtube.com/@shreyachundi', 'UCa-E8MzzEmqieB5XsBzoSNw');
handleToChannelId.set('https://youtube.com/@shreyachundi', 'UCa-E8MzzEmqieB5XsBzoSNw');

// Useful well-known channels for testing
handleToChannelId.set('@mrbeast', 'UCX6OQ3DkcsbYNE6H8uQQuVA');
handleToChannelId.set('@mkbhd', 'UCBJycsmduvYEL83R_U4JriQ');
handleToChannelId.set('@googledevelopers', 'UC_x5XG1OV2P6uZZ5FSM9Ttw');

export function getCachedChannelId(handleOrUrl) {
  if (!handleOrUrl) return null;
  const key = handleOrUrl.trim().toLowerCase().replace(/\/$/, '');
  return handleToChannelId.get(key) || null;
}

export function setCachedChannelId(handleOrUrl, channelId) {
  if (!handleOrUrl || !channelId) return;
  const key = handleOrUrl.trim().toLowerCase().replace(/\/$/, '');
  handleToChannelId.set(key, channelId);
  console.log(`📦 Cached: ${key} → ${channelId}`);
}