import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Topbar from '../components/Topbar.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Thumbnails() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/thumbnails`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('creatoriq_token')}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message));
  }, []);

  if (error) return <Layout><Topbar title="Thumbnails" /><div style={{ color: 'var(--accent)' }}>{error}</div></Layout>;
  if (!data) return <Layout><Topbar title="Thumbnails" /><div>Generating creative thumbnail ideas...</div></Layout>;

  return (
    <Layout>
      <Topbar
        title="Creative Thumbnail Ideas"
        subtitle="AI-generated thumbnail concepts — visuals, colors, text, and CTR predictions"
      />

      {/* Recent thumbnails */}
      {data.recentThumbnails && data.recentThumbnails.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-label">📸 Your Recent Thumbnails</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12, marginTop: 12,
          }}>
            {data.recentThumbnails.map(v => (
              <div key={v.id} style={{
                background: 'var(--bg-3)', borderRadius: 8, overflow: 'hidden',
                border: '1px solid var(--border)',
              }}>
                {v.thumbnail && (
                  <img src={v.thumbnail} alt="" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                )}
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    👁 {v.viewCount.toLocaleString()} · 👍 {v.likeCount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI-generated concepts */}
      <div className="card-label" style={{ marginTop: 20, marginBottom: 12 }}>
        🎨 AI-Generated Thumbnail Concepts (with visuals)
      </div>

      <div className="grid" style={{ gap: 16 }}>
        {(data.concepts || []).map(concept => (
          <div key={concept.id} className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  🎬 "{concept.videoTitle}"
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{concept.why}</div>
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: 'rgba(34,197,94,0.15)', color: 'var(--green)',
                whiteSpace: 'nowrap', marginLeft: 12,
              }}>
                CTR {concept.ctrPrediction}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(220px, 1fr)', gap: 16 }}>
              {/* Generated Image */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  🖼️ AI-Generated Preview
                </div>
                <div style={{
                  background: 'var(--bg-3)', borderRadius: 10,
                  border: '1px solid var(--border)',
                  overflow: 'hidden', position: 'relative',
                  aspectRatio: '16/9',
                }}>
                  <img
                    src={concept.imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: 10, fontSize: 11, color: '#fff',
                  }}>
                    ⏳ Loading takes ~5 seconds · Free AI image
                  </div>
                </div>
                <a
                  href={concept.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block', marginTop: 8,
                    fontSize: 12, color: 'var(--accent-2)',
                    textDecoration: 'underline',
                  }}
                >
                  Open full size →
                </a>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    🎨 Concept
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{concept.thumbnailConcept}</div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    ✍️ Text Overlay
                  </div>
                  <div style={{
                    padding: '8px 12px', background: 'rgba(255,59,92,0.15)',
                    borderRadius: 6, fontSize: 13, fontWeight: 800,
                    color: 'var(--accent)', letterSpacing: 0.8,
                  }}>
                    {concept.textOverlay}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    🎨 Palette
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(concept.colorPalette || []).map((hex, i) => (
                      <div key={i} title={hex} style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: hex, border: '2px solid var(--border)',
                      }} />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    😮 Expression
                  </div>
                  <div style={{
                    padding: '6px 12px', background: 'rgba(124,92,255,0.15)',
                    borderRadius: 6, fontSize: 12, fontWeight: 600,
                    color: '#a78bfa', textTransform: 'capitalize',
                    display: 'inline-block',
                  }}>
                    {concept.expression}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}