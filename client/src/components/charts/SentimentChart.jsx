import { Doughnut } from 'react-chartjs-2';
import './register.js';

export default function SentimentChart({ labels, data }) {
  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ff3b5c'],
      borderWidth: 0,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'right', labels: { padding: 16, font: { size: 12 } } } },
  };
  return <div style={{ height: 200 }}><Doughnut data={chartData} options={options} /></div>;
}