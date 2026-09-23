import { Line } from 'react-chartjs-2';
import './register.js';

export default function ViewsChart({ labels, data }) {
  const chartData = {
    labels,
    datasets: [{
      data,
      borderColor: '#ff3b5c',
      backgroundColor: (ctx) => {
        const { chart } = ctx;
        if (!chart.chartArea) return 'rgba(255,59,92,0.1)';
        const g = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
        g.addColorStop(0, 'rgba(255,59,92,0.35)');
        g.addColorStop(1, 'rgba(255,59,92,0.02)');
        return g;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#1e222d' } },
      y: { grid: { color: '#1e222d' } },
    },
  };
  return <div style={{ height: 260 }}><Line data={chartData} options={options} /></div>;
}