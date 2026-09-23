import { Radar } from 'react-chartjs-2';
import './register.js';

export default function CompetitorChart({ labels, yours, niche }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Your Channel',
        data: yours,
        borderColor: '#ff3b5c',
        backgroundColor: 'rgba(255,59,92,0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#ff3b5c',
      },
      {
        label: 'Niche Avg.',
        data: niche,
        borderColor: '#7c5cff',
        backgroundColor: 'rgba(124,92,255,0.12)',
        borderWidth: 2,
        pointBackgroundColor: '#7c5cff',
      },
    ],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { padding: 16 } } },
    scales: {
      r: {
        angleLines: { color: '#262b38' },
        grid: { color: '#262b38' },
        pointLabels: { color: '#8b93a7', font: { size: 11 } },
        ticks: { display: false },
        suggestedMin: 0, suggestedMax: 100,
      },
    },
  };
  return <div style={{ height: 320 }}><Radar data={chartData} options={options} /></div>;
}