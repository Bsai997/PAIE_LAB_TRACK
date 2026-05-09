import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import BarGraph from '../../components/BarGraph';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function StudentPerformance() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await studentAPI.getPerformance();
        setPerformance(res.data);
      } catch (err) {
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchPerformance();
  }, [user?.token]);

  if (loading) return <div className="loading">Loading...</div>;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Tasks Completed',
      data: [5, 8, 12, 10],
      backgroundColor: '#4CAF50'
    }]
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Performance Analytics</h2>

        <div className="stats-grid">
          <StatCard label="Total Completed" value={performance?.totalCompleted || 0} color="#4CAF50" />
          <StatCard label="This Week" value="12" color="#2196F3" />
          <StatCard label="Not Submitted" value={performance?.totalNotSubmitted || 0} color="#F44336" />
        </div>

        <div className="chart-container">
          <BarGraph title="Weekly Task Completion" data={chartData} />
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
}
