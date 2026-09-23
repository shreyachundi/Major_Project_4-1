const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'creatoriq_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${res.status}`);
    err.code = data.error;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  login:    (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (email, password, name) => request('/auth/register', { method: 'POST', body: { email, password, name }, auth: false }),
  me:       () => request('/auth/me'),

  connectChannel: (url) => request('/channel/connect', { method: 'POST', body: { url } }),
  channelSummary: () => request('/channel/summary'),
  insights:       () => request('/insights'),
  ideas:          () => request('/ideas'),
  trends:         () => request('/trends'),
  competitors:    () => request('/competitors'),

  aiSuggestions:  () => request('/ai/suggestions'),
  aiAsk:          (question) => request('/ai/ask', { method: 'POST', body: { question } }),
};