import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BarGraph from '../../components/BarGraph';
import { useAuth } from '../../context/AuthContext';
import { superAdminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function StudentPerformance() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await superAdminAPI.getStudentPerformance(studentId);
        setPerformance(res.data);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchPerformance();
  }, [user?.token, studentId]);

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
        <div className="student-header">
          <div className="student-profile">
            <img src="/assets/profile.png" alt="Profile" className="profile-img" />
            <div className="profile-info">
              <h2>{performance?.student?.name}</h2>
              <p>{performance?.student?.department}</p>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <BarGraph title="Weekly Task Completion" data={chartData} />
        </div>

        <div className="table-container">
          <h3>Week-wise Breakdown</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Easy</th>
                <th>Medium</th>
                <th>Hard</th>
                <th>Not Completed</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(performance?.weeklyStats || {}).map(([week, stats]) => (
                <tr key={week}>
                  <td>Week {week}</td>
                  <td>{stats.easy}</td>
                  <td>{stats.medium}</td>
                  <td>{stats.hard}</td>
                  <td>{stats.notCompleted}</td>
                  <td>{stats.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
