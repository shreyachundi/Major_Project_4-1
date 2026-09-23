import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ title, subtitle, channel }) {
  const { user } = useAuth();
  const initials = (user?.name || 'U').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const ch = channel || { name: user?.channelName || 'My Channel', subscribers: user?.subscribers || 0 };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>{title}</h1>
        {subtitle && <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-2)', padding: '8px 14px',
        borderRadius: 10, border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff3b5c, #7c5cff)',
          display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13,
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ch.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {Number(ch.subscribers).toLocaleString()} subscribers
          </div>
        </div>
      </div>
    </div>
  );
}