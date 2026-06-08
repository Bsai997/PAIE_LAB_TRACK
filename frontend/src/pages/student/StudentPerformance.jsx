import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function StudentPerformance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/student/performance').then((res) => setData(res.data));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>Performance</h1>
        <p>Week-wise task completion summary</p>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Easy</th>
              <th>Medium</th>
              <th>Hard</th>
              <th>Missed</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.week}>
                <td>{row.week}</td>
                <td>{row.easy}</td>
                <td>{row.medium}</td>
                <td>{row.hard}</td>
                <td>{row.missed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
