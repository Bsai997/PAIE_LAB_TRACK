import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarGraph({ data, title, labels, datasets }) {
  const chartData = {
    labels: labels || data?.labels || [],
    datasets: datasets || data?.datasets || []
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: title || 'Analytics'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bar-graph-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}
