import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AdminPerformance() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/performance').then((res) => setData(res.data));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1>Performance Overview</h1>
        <p>Student task completion this week</p>
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
