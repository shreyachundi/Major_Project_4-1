import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale,
  BarElement, ArcElement, RadialLinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
  LineElement, PointElement, LinearScale, CategoryScale,
  BarElement, ArcElement, RadialLinearScale,
  Tooltip, Legend, Filler
);

ChartJS.defaults.color = '#8b93a7';
ChartJS.defaults.borderColor = '#262b38';
ChartJS.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
ChartJS.defaults.font.size = 11;