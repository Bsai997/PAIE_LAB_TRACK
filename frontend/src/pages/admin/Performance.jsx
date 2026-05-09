import Navbar from '../../components/Navbar';
import BarGraph from '../../components/BarGraph';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function AdminPerformance() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await adminAPI.getPerformance();
        setPerformance(res.data);
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
      label: 'Students Completed All Tasks',
      data: [15, 18, 22, 20],
      backgroundColor: '#4CAF50'
    }]
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Performance Analytics</h2>

        <div className="chart-container">
          <BarGraph title="Weekly Student Performance" data={chartData} />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Department</th>
                <th>Tasks Completed</th>
                <th>Tasks Pending</th>
              </tr>
            </thead>
            <tbody>
              {performance?.students?.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.department}</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
