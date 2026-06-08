import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AdminPerformance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/admin/performance').then((res) => setData(res.data));
  }, []);

  const maxCompleted = Math.max(...data.map((d) => d.completed), 1);

  return (
    <Layout>
      <div className="page-header">
        <h1>Performance Overview</h1>
        <p>Student task completion this week</p>
      </div>

      <div className="chart-container">
        <h3>Completion Chart</h3>
        <div className="bar-chart">
          {data.slice(0, 10).map((s) => (
            <div key={s.id} className="bar-item">
              <span className="bar-label">{s.name.split(' ')[0]}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(s.completed / maxCompleted) * 100}%` }} />
              </div>
              <span className="bar-value">{s.completed}/{s.total_assigned}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Completed</th>
              <th>Not Completed</th>
              <th>Total Assigned</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.department}</td>
                <td>{s.completed}</td>
                <td>{s.not_completed}</td>
                <td>{s.total_assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
