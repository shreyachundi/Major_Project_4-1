import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, getToken } from '../api/client.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm CreatorIQ Assistant. Ask me anything about your channel — performance, ideas, strategy. Click '📚 Index My Videos' first to unlock transcript-based answers." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [indexed, setIndexed] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const bottomRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Hide chatbot on login/connect pages
  if (location.pathname === '/login' || location.pathname === '/connect' || location.pathname === '/') {
    return null;
  }

  async function indexVideos() {
    setIndexing(true);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '📚 Indexing your videos… this may take 30-60 seconds depending on how many videos you have.',
    }]);

    try {
      const res = await fetch(`${API_URL}/rag/index`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to index');

      setIndexed(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Indexed ${data.totalChunks} transcript chunks from ${data.videos.length} videos. Now I can answer questions based on what you actually said in your videos.`,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Indexing failed: ${err.message}`,
      }]);
    } finally {
      setIndexing(false);
    }
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
      const endpoint = indexed ? '/rag/ask' : '/chat';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          question: msg,
          message: msg,
          history: newHistory.slice(-8),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const replyText = data.answer || data.reply || 'No response';
      const sources = data.sources || [];

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: replyText,
        sources,
      }]);
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>CreatorIQ Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                {indexed ? '✅ RAG mode — answers from your transcripts' : 'Ask about your channel'}
              </div>
            </div>
            {indexed && (
              <button
                onClick={indexVideos}
                disabled={indexing}
                title="Re-index videos"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  cursor: indexing ? 'not-allowed' : 'pointer',
                  opacity: indexing ? 0.5 : 1,
                }}
              >
                🔄
              </button>
            )}
          </div>

          {/* Index Button (shown until indexing is done) */}
          {!indexed && (
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(124,92,255,0.05)',
            }}>
              <button
                onClick={indexVideos}
                disabled={indexing}
                className="btn"
                style={{ width: '100%', padding: '8px 0', fontSize: 12 }}
              >
                {indexing ? '⏳ Indexing videos…' : '📚 Index My Videos (One-time)'}
              </button>
              <div style={{
                fontSize: 10.5, color: 'var(--text-dim)',
                marginTop: 6, textAlign: 'center', lineHeight: 1.4,
              }}>
                Enables answering questions from your video transcripts
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                    : 'var(--bg-3)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  fontSize: 13, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  border: m.role === 'assistant' && indexed
                    ? '1px solid rgba(124,92,255,0.3)'
                    : '1px solid transparent',
                }}>
                  {m.content}
                </div>

                {/* Show source videos for RAG answers */}
                {m.sources && m.sources.length > 0 && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(124,92,255,0.08)',
                    border: '1px solid rgba(124,92,255,0.25)',
                    borderRadius: 8,
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>
                      📚 Sources ({[...new Set(m.sources.map(s => s.videoTitle))].length}):
                    </div>
                    {[...new Set(m.sources.map(s => s.videoTitle))].map((title, j) => (
                      <div key={j} style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        • {title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '10px 14px', borderRadius: 12,
                background: 'var(--bg-3)', fontSize: 13,
                color: 'var(--text-dim)',
              }}>
                {indexed ? '🔍 Searching your videos…' : 'Thinking…'}
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
              placeholder={indexed ? 'Ask about your videos…' : 'Ask anything…'}
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