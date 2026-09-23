import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function Connect() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChanging = new URLSearchParams(location.search).get('change') === '1';

  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { channel } = await api.connectChannel(url);
      updateUser({
        channelId: channel.id,
        channelUrl: url,
        channelName: channel.name,
        subscribers: channel.subscribers,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function cancelChange() {
    navigate('/dashboard');
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'radial-gradient(circle at 20% 20%, rgba(255,59,92,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(124,92,255,0.14), transparent 45%), var(--bg)',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 22,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {isChanging ? 'Change Your Channel' : 'Connect Your Channel'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {isChanging
                ? `Currently connected: ${user?.channelName || 'none'}`
                : `Hi ${user?.name || 'there'} — paste your YouTube channel URL to begin`}
            </div>
          </div>
        </div>

        {isChanging && (
          <div style={{
            marginTop: 20, padding: 14,
            background: 'rgba(234,179,8,0.08)',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 8, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6,
          }}>
            ⚠️ Connecting a new channel will replace your current one. Your old data will still be accessible if you reconnect.
          </div>
        )}

        <div style={{
          marginTop: 20, padding: 14,
          background: 'rgba(124,92,255,0.08)',
          border: '1px solid rgba(124,92,255,0.25)',
          borderRadius: 8, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6,
        }}>
          <b style={{ color: 'var(--text)' }}>Accepted formats:</b><br />
          • https://youtube.com/@yourhandle<br />
          • https://youtube.com/channel/UCxxxxxxxx<br />
          • https://youtube.com/c/YourCustomName
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>
            YouTube Channel URL
          </div>
          <input
            type="text"
            required
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/@yourchannel"
            style={{
              width: '100%', background: 'var(--bg-3)',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '11px 13px', color: 'var(--text)',
              fontSize: 14, outline: 'none',
            }}
            autoFocus
          />

          {error && (
            <div style={{
              marginTop: 12, background: 'rgba(255,59,92,0.1)',
              border: '1px solid rgba(255,59,92,0.35)',
              color: '#ff8ea0', fontSize: 13,
              padding: '10px 12px', borderRadius: 8,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {isChanging && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelChange}
                style={{ flex: 1, padding: '12px 0' }}
              >
                Cancel
              </button>
            )}
            <button
              className="btn"
              type="submit"
              disabled={busy}
              style={{ flex: 2, padding: '12px 0' }}
            >
              {busy ? 'Analyzing channel…' : isChanging ? 'Switch Channel' : 'Connect & Analyze'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--text-dim)', textAlign: 'center' }}>
          We use YouTube Data API v3 to fetch public stats and AI to generate insights.
        </div>
      </div>
    </div>
  );
}