import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function SuperAdminStudentPerformance() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/superadmin/students/${id}/performance`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <Layout><p>Loading...</p></Layout>;

  const { student, progress, weekly } = data;

  return (
    <Layout>
      <div className="performance-detail">
        <div className="performance-left">
          <img src={student.profile_photo} alt={student.name} className="avatar-xl" />
          <h2>{student.name}</h2>
          <p>{student.department}</p>
        </div>
        <div className="performance-center">
          <div className="progress-circle" style={{ '--progress': progress }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="progress-bg" />
              <circle cx="50" cy="50" r="45" className="progress-fill" strokeDasharray={`${progress * 2.83} 283`} />
            </svg>
            <span className="progress-text">{progress}%</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Easy</th>
                  <th>Medium</th>
                  <th>Hard</th>
                  <th>Assigned</th>
                  <th>Not Submitted</th>
                </tr>
              </thead>
              <tbody>
                {weekly.map((w) => (
                  <tr key={w.week}>
                    <td>{w.week}</td>
                    <td>{w.easy_solved}</td>
                    <td>{w.medium_solved}</td>
                    <td>{w.hard_solved}</td>
                    <td>{w.assigned}</td>
                    <td>{w.not_submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
