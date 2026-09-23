import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, getToken } from '../api/client.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm CreatorIQ Assistant. Ask me anything about your channel — performance, ideas, strategy." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Hide chatbot on login/connect pages
  if (location.pathname === '/login' || location.pathname === '/connect' || location.pathname === '/') {
    return null;
  }

  async function send(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg = { role: 'user', content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: msg,
          history: newHistory.slice(-8),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          fontSize: 24, color: '#fff',
          boxShadow: '0 8px 30px rgba(124,92,255,0.4)',
          zIndex: 1000,
        }}
        aria-label="Open chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24,
          width: 380, height: 520,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(124,92,255,0.08))',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'grid', placeItems: 'center', fontSize: 16,
            }}>🧠</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>CreatorIQ Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Ask about your channel</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: 12,
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                  : 'var(--bg-3)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                fontSize: 13, lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '10px 14px', borderRadius: 12,
                background: 'var(--bg-3)', fontSize: 13,
                color: 'var(--text-dim)',
              }}>
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            borderTop: '1px solid var(--border)',
            padding: 12, display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              style={{
                flex: 1, background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 12px',
                color: 'var(--text)', fontSize: 13, outline: 'none',
              }}
            />
            <button
              className="btn"
              onClick={() => send()}
              disabled={loading}
              style={{ padding: '10px 16px', fontSize: 12 }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}