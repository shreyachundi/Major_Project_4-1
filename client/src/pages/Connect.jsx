import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function Connect() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChanging = new URLSearchParams(location.search).get('change') === '1';

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: async (tokenResponse) => {
      setBusy(true);
      setError('');
      try {
        const { channel } = await api.connectWithGoogle(
          tokenResponse.access_token,
          user?.id
        );
        updateUser({
          channelId: channel.id,
          channelUrl: `https://youtube.com/channel/${channel.id}`,
          channelName: channel.name,
          subscribers: channel.subscribers,
        });
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Failed to connect channel');
      } finally {
        setBusy(false);
      }
    },
    onError: (err) => {
      console.error(err);
      setError('Google sign-in failed. Please try again.');
    },
  });

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
              Hi {user?.name || 'there'} — sign in with Google to verify your channel
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 20, padding: 14,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 8, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6,
        }}>
          <b style={{ color: 'var(--text)' }}>Why Google sign-in?</b><br />
          It verifies you own the channel — you can only analyze your own YouTube account. We use YouTube's read-only API access.
        </div>

        {isChanging && user?.channelName && (
          <div style={{
            marginTop: 12, padding: 14,
            background: 'rgba(234,179,8,0.08)',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 8, fontSize: 12.5, color: 'var(--text-dim)',
          }}>
            ⚠️ Currently connected: <b style={{ color: 'var(--text)' }}>{user.channelName}</b>. Signing in with a different Google account will switch channels.
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 16, background: 'rgba(255,59,92,0.1)',
            border: '1px solid rgba(255,59,92,0.35)',
            color: '#ff8ea0', fontSize: 13,
            padding: '10px 12px', borderRadius: 8,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => login()}
          disabled={busy}
          className="btn"
          style={{
            width: '100%', padding: '14px 0', marginTop: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, fontSize: 14,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ background: '#fff', borderRadius: 4, padding: 2 }}>
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          {busy ? 'Verifying channel…' : 'Sign in with Google'}
        </button>

        <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
          We use YouTube Data API v3 (read-only) to fetch your channel stats and AI to generate insights.
        </div>
      </div>
    </div>
  );
}