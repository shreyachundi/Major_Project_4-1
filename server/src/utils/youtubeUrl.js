export function parseChannelUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  const handleMatch = trimmed.match(/youtube\.com\/@([a-zA-Z0-9_\-\.]+)/);
  if (handleMatch) return { type: 'handle', value: '@' + handleMatch[1] };

  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_\-]+)/);
  if (channelMatch) return { type: 'channelId', value: channelMatch[1] };

  const customMatch = trimmed.match(/youtube\.com\/c\/([a-zA-Z0-9_\-\.]+)/);
  if (customMatch) return { type: 'custom', value: customMatch[1] };

  const userMatch = trimmed.match(/youtube\.com\/user\/([a-zA-Z0-9_\-\.]+)/);
  if (userMatch) return { type: 'user', value: userMatch[1] };

  if (/^UC[a-zA-Z0-9_\-]{20,}$/.test(trimmed)) {
    return { type: 'channelId', value: trimmed };
  }

  if (/^@[a-zA-Z0-9_\-\.]+$/.test(trimmed)) {
    return { type: 'handle', value: trimmed };
  }

  return null;
}