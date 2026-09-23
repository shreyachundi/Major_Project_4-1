import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

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