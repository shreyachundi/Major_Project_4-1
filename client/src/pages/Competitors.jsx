import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Topbar from '../components/Topbar.jsx';
import InsightItem from '../components/InsightItem.jsx';
import CompetitorChart from '../components/charts/CompetitorChart.jsx';
import { api } from '../api/client.js';

export default function Competitors() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.competitors().then(setData).catch(e => setError(e.message));
  }, []);

  if (error) return <Layout><Topbar title="Competitors" /><div style={{ color: 'var(--accent)' }}>{error}</div></Layout>;
  if (!data) return <Layout><Topbar title="Competitors" /><div>Loading…</div></Layout>;

  const { cards, radar, insights } = data;

  return (
    <Layout>
      <Topbar
        title="Competitor Benchmarks"
        subtitle="Anonymized comparison against similar channels in your niche"
      />

      <div className="grid grid-3">
        <div className="card">
          <div className="card-label">Your Channel</div>
          <div className="card-value" style={{ fontSize: 20 }}>{cards.yours.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.7 }}>
            Uploads/week: {cards.yours.uploadsPerWeek}<br />
            Avg. views/video: {cards.yours.avgViews}<br />
            Avg. CTR: {cards.yours.ctr}<br />
            Avg. retention: {cards.yours.retention}
          </div>
        </div>
        <div className="card">
          <div className="card-label">Niche Average</div>
          <div className="card-value" style={{ fontSize: 20 }}>{cards.nicheAvg.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.7 }}>
            Uploads/week: {cards.nicheAvg.uploadsPerWeek}<br />
            Avg. views/video: {cards.nicheAvg.avgViews}<br />
            Avg. CTR: {cards.nicheAvg.ctr}<br />
            Avg. retention: {cards.nicheAvg.retention}
          </div>
        </div>
        <div className="card" style={{ borderColor: 'rgba(34,197,94,0.4)' }}>
          <div className="card-label">Your Advantage</div>
          <div className="card-value" style={{ fontSize: 20, color: 'var(--green)' }}>
            {cards.advantage.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.7 }}>
            {cards.advantage.lines.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-label">Performance Comparison</div>
        <CompetitorChart labels={radar.labels} yours={radar.yours} niche={radar.niche} />
      </div>

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
            <div style={{ fontWeight: 600, fontSize: 14 }}>AI Competitive Analysis</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
              Insights based on niche benchmark data
            </div>
          </div>
        </div>
        {insights.map((i, idx) => <InsightItem key={idx} tag={i.tag} text={i.text} />)}
      </div>
    </Layout>
  );
}