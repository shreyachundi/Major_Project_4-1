import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Topbar from '../components/Topbar.jsx';
import InsightItem from '../components/InsightItem.jsx';
import { api } from '../api/client.js';

export default function Insights() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.insights().then(setData).catch(e => setError(e.message));
    api.channelSummary().then(setSummary).catch(console.error);
  }, []);

  if (error) return <Layout><Topbar title="Audience Insights" /><div style={{ color: 'var(--accent)' }}>{error}</div></Layout>;
  if (!data || !summary) return <Layout><Topbar title="Audience Insights" /><div>Analyzing your audience...</div></Layout>;

  return (
    <Layout>
      <Topbar
        title="Audience Insights"
        subtitle="What your viewers actually like — based on real engagement data"
      />

      {/* Top Performing Videos — REAL DATA */}
      <div className="card">
        <div className="card-label">🎯 Your Top Performing Videos (by real views)</div>
        <div style={{ marginTop: 12 }}>
          {(summary.topPerforming || []).map((v, i) => (
            <div key={v.id} style={{
              display: 'flex', gap: 14, padding: '14px 0',
              borderBottom: i < summary.topPerforming.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center',
            }}>
              {v.thumbnail && (
                <img
                  src={v.thumbnail}
                  alt=""
                  style={{ width: 100, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{v.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-dim)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span>👁 {v.viewCount.toLocaleString()} views</span>
                  <span>👍 {v.likeCount.toLocaleString()}</span>
                  <span>💬 {v.commentCount.toLocaleString()}</span>
                </div>
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: v.vsAverage > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                color: v.vsAverage > 0 ? 'var(--green)' : 'var(--yellow)',
                whiteSpace: 'nowrap',
              }}>
                {v.vsAverage > 0 ? '+' : ''}{v.vsAverage}% vs avg
              </div>
            </div>
          ))}
          {(!summary.topPerforming || summary.topPerforming.length === 0) && (
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No recent videos found.</div>
          )}
        </div>
      </div>

      {/* Engagement KPIs — REAL DATA */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-label">💗 Engagement Rate</div>
          <div className="card-value">{summary.engagementRate}%</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
            Likes + comments ÷ views across recent videos
          </div>
        </div>
        <div className="card">
          <div className="card-label">📊 Average Views per Video</div>
          <div className="card-value">{summary.avgViews.toLocaleString()}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
            Your channel's baseline performance
          </div>
        </div>
      </div>

      {/* AI Analysis — Gemini-powered */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(124,92,255,0.08))',
        border: '1px solid rgba(124,92,255,0.25)',
        borderRadius: 12, padding: 20, marginTop: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'grid', placeItems: 'center', fontSize: 16,
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>AI Analysis of Your Audience</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
              Gemini analyzed your real engagement data to find what your viewers like
            </div>
          </div>
        </div>
        {(data.insights || []).map((i, idx) => <InsightItem key={idx} tag={i.tag} text={i.text} />)}
      </div>

      {/* What's Working / Hurting */}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-label">✅ What's Working</div>
          <div style={{ marginTop: 8 }}>
            {(data.working || []).map((w, i) => (
              <InsightItem key={i} tag="opportunity" text={w.text} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-label">⚠️ What Needs Improvement</div>
          <div style={{ marginTop: 8 }}>
            {(data.hurting || []).map((h, i) => (
              <InsightItem key={i} tag="warning" text={h.text} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}