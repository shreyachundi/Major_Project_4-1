import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Topbar from '../components/Topbar.jsx';
import ScriptModal from '../components/ScriptModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getToken } from '../api/client.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const tierColors = {
  hot:  { bg: 'rgba(34,197,94,0.15)',  color: 'var(--green)'  },
  good: { bg: 'rgba(59,130,246,0.15)', color: 'var(--blue)'   },
  avg:  { bg: 'rgba(234,179,8,0.15)',  color: 'var(--yellow)' },
};

export default function ContentIdeas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIdea, setSelectedIdea] = useState(null);

  async function loadIdeas(pageNum = 1) {
    const existing = pageNum === 1 ? '' : ideas.map(i => i.title).join('|');
    const url = `${API_URL}/ideas?page=${pageNum}&count=5&existing=${encodeURIComponent(existing)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    return data.ideas;
  }

  useEffect(() => {
    loadIdeas(1)
      .then(setIdeas)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newIdeas = await loadIdeas(nextPage);
      setIdeas(prev => [...prev, ...newIdeas]);
      setPage(nextPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Layout>
      <Topbar
        title="AI Content Ideas"
        subtitle="Personalized video ideas based on your data, trends, and audience requests"
      />

      {loading && <div className="card">Generating your personalized ideas…</div>}
      {error && <div className="card" style={{ color: 'var(--accent)' }}>{error}</div>}

      <div className="grid" style={{ gap: 12 }}>
        {ideas.map(idea => {
          const c = tierColors[idea.tier] || tierColors.avg;
          return (
            <div
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className="card"
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent-2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 15, flexShrink: 0,
                background: c.bg, color: c.color,
              }}>{idea.score}</div>
              <div style={{ flex: 1 }}>
  {/* Creative title */}
  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{idea.title}</div>

  {/* SEO title */}
  {idea.seoTitle && (
    <div style={{
      marginTop: 6, marginBottom: 8, padding: '8px 12px',
      background: 'rgba(34,197,94,0.08)',
      border: '1px solid rgba(34,197,94,0.25)',
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        🔍 SEO Title
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4, fontWeight: 500 }}>
        {idea.seoTitle}
      </div>
    </div>
  )}

  {/* Keywords */}
  {idea.keywords && idea.keywords.length > 0 && (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
      {idea.keywords.map((kw, idx) => (
        <span key={idx} style={{
          background: 'rgba(124,92,255,0.12)',
          border: '1px solid rgba(124,92,255,0.3)',
          color: '#a78bfa',
          fontSize: 10.5,
          padding: '3px 8px',
          borderRadius: 4,
          fontWeight: 500,
        }}>
          #{kw}
        </span>
      ))}
    </div>
  )}

  <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>{idea.why}</div>
  <div style={{
    fontSize: 11.5, color: 'var(--text-dim)',
    marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap',
  }}>
    <span>🎯 Predicted: {idea.predictedViews}</span>
    <span>⏱ Length: {idea.bestLength}</span>
    <span>📅 Upload: {idea.upload}</span>
    <span style={{ color: 'var(--accent-2)' }}>→ Click for full script</span>
  </div>
</div>
            </div>
          );
        })}
      </div>

      {!loading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            className="btn"
            onClick={loadMore}
            disabled={loadingMore}
            style={{ padding: '12px 32px' }}
          >
            {loadingMore ? 'Generating more ideas…' : '✨ Load 5 More Ideas'}
          </button>
        </div>
      )}

      {selectedIdea && (
        <ScriptModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          channelName={user?.channelName || 'My Channel'}
          subscribers={user?.subscribers || 0}
        />
      )}
    </Layout>
  );
}