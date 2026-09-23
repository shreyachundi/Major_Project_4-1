import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Topbar from '../components/Topbar.jsx';
import AskAI from '../components/AskAI.jsx';
import InsightItem from '../components/InsightItem.jsx';
import ViewsChart from '../components/charts/ViewsChart.jsx';
import { api } from '../api/client.js';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.channelSummary(), api.insights()])
      .then(([s, i]) => { setSummary(s); setInsights(i.insights); })
      .catch(e => setError(e.message));
  }, []);

  if (error) return <Layout><Topbar title="Dashboard" /><div style={{ color: 'var(--accent)' }}>{error}</div></Layout>;
  if (!summary) return <Layout><Topbar title="Dashboard" /><div>Loading…</div></Layout>;

  return (
    <Layout>
      <Topbar
        title="Channel Dashboard"
        subtitle={`${summary.channel.periodLabel} · Updated just now`}
        channel={summary.channel}
      />

      <div className="grid grid-4">
        {summary.kpis.map(k => (
          <div key={k.label} className="card">
            <div className="card-label">{k.label}</div>
            <div className="card-value">{k.value}</div>
            <div className={`card-delta delta-${k.trend || 'neutral'}`}>
              {k.trend === 'up' ? '▲' : k.trend === 'down' ? '▼' : '●'} {Math.abs(k.delta || 0)}% vs last period
            </div>
          </div>
        ))}
      </div>

      {summary.views && summary.views.labels && summary.views.data && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-label">Views Over Time</div>
          <ViewsChart labels={summary.views.labels} data={summary.views.data} />
        </div>
      )}

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
            <div style={{ fontWeight: 600, fontSize: 14 }}>AI Insights — This Week</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
              Generated from your live channel data
            </div>
          </div>
        </div>
        {insights.map((i, idx) => <InsightItem key={idx} tag={i.tag} text={i.text} />)}
      </div>

      <AskAI />
    </Layout>
  );
}