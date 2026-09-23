import { useState } from 'react';
import { api } from '../api/client.js';

export default function ScriptModal({ idea, onClose, channelName, subscribers }) {
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/script`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('creatoriq_token')}`,
          },
          body: JSON.stringify({
            videoTitle: idea.title,
            why: idea.why,
            channelName,
            subscribers,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate script');
      setScript(data.script);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate on open
  useState(() => { generate(); });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 2000,
        display: 'grid', placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 780,
          maxHeight: '90vh',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(124,92,255,0.08))',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              📝 Video Script
            </div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{idea.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 12px', color: 'var(--text)',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 20, marginBottom: 12 }}>✍️</div>
              <div>Writing a complete script for you…</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>This takes 5-15 seconds</div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(255,59,92,0.1)',
              border: '1px solid rgba(255,59,92,0.35)',
              padding: 14, borderRadius: 8,
              color: '#ff8ea0', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {script && !loading && (
            <>
              <pre style={{
                whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)',
                background: 'var(--bg-3)', padding: 16,
                borderRadius: 10, border: '1px solid var(--border)',
              }}>
                {script}
              </pre>

              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <button
                  className="btn"
                  onClick={() => {
                    navigator.clipboard.writeText(script);
                    alert('Script copied to clipboard!');
                  }}
                  style={{ flex: 1, padding: '10px 0' }}
                >
                  📋 Copy Script
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={generate}
                  style={{ flex: 1, padding: '10px 0' }}
                >
                  🔄 Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}