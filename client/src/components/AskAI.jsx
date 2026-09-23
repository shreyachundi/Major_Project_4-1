import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function AskAI() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    api.aiSuggestions().then(d => setSuggestions(d.suggestions)).catch(() => {});
  }, []);

  async function ask(q) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setResponse('Thinking…');
    try {
      const { answer } = await api.aiAsk(q);
      await new Promise(r => setTimeout(r, 500));
      setResponse(answer);
    } catch (e) {
      setResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'grid', placeItems: 'center', fontSize: 16,
        }}>💬</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Ask CreatorIQ</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>Natural language questions about your channel</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(input)}
          placeholder="e.g. Analyze my recent videos"
          style={{
            flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 14px', color: 'var(--text)',
            fontSize: 14, outline: 'none',
          }}
        />
        <button className="btn" onClick={() => ask(input)} disabled={loading}>
          {loading ? '…' : 'Ask AI'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {suggestions.map(s => (
          <button
            key={s.q}
            onClick={() => { setInput(s.q); ask(s.q); }}
            style={{
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              padding: '7px 12px', borderRadius: 20, fontSize: 12,
              color: 'var(--text-dim)', cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {response && (
        <div
          style={{
            marginTop: 14, padding: 14,
            background: 'rgba(124,92,255,0.08)',
            borderLeft: '3px solid var(--accent-2)',
            borderRadius: 6, fontSize: 13.5, lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: response }}
        />
      )}
    </div>
  );
}