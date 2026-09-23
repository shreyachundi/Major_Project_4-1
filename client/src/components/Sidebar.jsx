import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const items = [
  { to: '/dashboard',   icon: '📊', label: 'Dashboard' },
  { to: '/insights',    icon: '🧠', label: 'Audience Insights' },
  { to: '/content',     icon: '💡', label: 'Content Ideas' },
  { to: '/thumbnails',  icon: '🖼️', label: 'Thumbnails' },
  { to: '/competitors', icon: '🎯', label: 'Competitors' },
];

export default function Sidebar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  function goToChangeChannel() {
    navigate('/connect?change=1');
  }

  function disconnectChannel() {
    if (!confirm('Disconnect your current channel? You can connect a new one after.')) return;
    updateUser({
      channelId: null,
      channelUrl: null,
      channelName: null,
      subscribers: 0,
    });
    navigate('/connect');
  }

  return (
    <aside style={{
      width: 240, background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      padding: '20px 0', position: 'fixed',
      height: '100vh', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '0 20px 24px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700 }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 16,
        }}>⚡</div>
        <span>CreatorIQ</span>
      </div>

      {items.map(it => (
        <NavLink
          key={it.to}
          to={it.to}
          style={({ isActive }) => ({
            padding: '10px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            color: isActive ? 'var(--text)' : 'var(--text-dim)',
            background: isActive ? 'var(--bg-3)' : 'transparent',
            borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
            fontSize: 13.5,
          })}
        >
          <span style={{ fontSize: 16, width: 20 }}>{it.icon}</span>
          {it.label}
        </NavLink>
      ))}

      <div style={{ padding: 20, marginTop: 'auto' }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>
          Connected channel
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
          {user?.channelName || 'Not connected'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 12 }}>
          {user?.subscribers
            ? `${Number(user.subscribers).toLocaleString()} subs`
            : user?.email}
        </div>

        <button
          onClick={goToChangeChannel}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px 12px', fontSize: 12, marginBottom: 8 }}
        >
          Change channel
        </button>

        {user?.channelId && (
          <button
            onClick={disconnectChannel}
            className="btn btn-secondary"
            style={{
              width: '100%', padding: '8px 12px', fontSize: 12,
              marginBottom: 8, color: 'var(--accent)',
            }}
          >
            Disconnect channel
          </button>
        )}

        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}