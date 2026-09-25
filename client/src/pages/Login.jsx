import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, SERVER_BASE } from '../api/client.js';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);

      const me = await api.me();
      navigate(me.user.channelId ? '/dashboard' : '/connect');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function switchMode(m) {
    setMode(m);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid', placeItems: 'center',
      background: 'radial-gradient(circle at 20% 20%, rgba(255,59,92,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(124,92,255,0.14), transparent 45%), var(--bg)',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 22,
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>CreatorIQ</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>AI-powered YouTube growth</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-3)', borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {['login','register'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '9px 0', border: 'none',
                background: mode === m ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-dim)',
                borderRadius: 7, cursor: 'pointer', fontWeight: 600,
                fontSize: 13, textTransform: 'capitalize',
              }}
            >
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          {mode === 'register' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Name</div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Email</div>
            <input
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>Password</div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: 11,
                  background: 'transparent', border: 'none',
                  color: 'var(--text-dim)', cursor: 'pointer',
                  fontSize: 16, padding: 4,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,59,92,0.1)',
              border: '1px solid rgba(255,59,92,0.35)',
              color: '#ff8ea0', fontSize: 13,
              padding: '10px 12px', borderRadius: 8, marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          <button className="btn" type="submit" disabled={busy} style={{ width: '100%', padding: '12px 0' }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        {/* OR divider */}
<div style={{
  display: 'flex', alignItems: 'center', gap: 12,
  margin: '20px 0', color: 'var(--text-dim)', fontSize: 12,
}}>
  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  OR
  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
</div>

{/* Google Sign-In */}
<button
  type="button"
  onClick={() => { window.location.href = `${SERVER_BASE}/auth/google`; }}
  className="btn btn-secondary"
  style={{
    width: '100%', padding: '12px 0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, fontSize: 13.5,
  }}
>
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
  Continue with Google
</button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-3)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '11px 13px',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  marginBottom: 12,
};