import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function SuperAdminStudentPerformance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/superadmin/students/${id}/performance`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <Layout><p>Loading...</p></Layout>;

  const { student, progress, weekly, totalSolved = 0, totalAssigned = 0 } = data;
  const progressText = `${totalSolved} / ${totalAssigned}`;
  const skills = (student.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Layout>
      <div className="page-header superadmin-performance-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1>Student Profile Dashboard</h1>
      </div>
      <div className="performance-detail superadmin-performance-layout">
        <div className="performance-left superadmin-student-card">
          <img src={student.profile_photo} alt={student.name} className="avatar-xl superadmin-student-avatar" />
          <div className="superadmin-student-meta">
            <h2>{student.name}</h2>
            <p><strong>Department:</strong> {student.branch || 'N/A'}</p>
            <p><strong>Reg ID:</strong> {student.regdid || student.clubmail || 'N/A'}</p>
            <div className="superadmin-skills-row">
              <strong>Skills:</strong>
              <div className="superadmin-skills-chips">
                {skills.length > 0 ? (
                  skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)
                ) : (
                  <span className="skill-chip">No skills</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="performance-center superadmin-performance-center">
          <div className="progress-circle superadmin-progress-circle" style={{ '--progress': progress }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="progress-bg" />
              <circle cx="50" cy="50" r="45" className="progress-fill" strokeDasharray={`${progress * 2.83} 283`} />
            </svg>
            <span className="progress-text">{progressText}</span>
          </div>
          <p className="progress-caption">TOTAL QUESTIONS SOLVED VS. TOTAL ASSIGNED</p>
        </div>
      </div>

      <div className="table-container superadmin-performance-table">
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
    </Layout>
  );
}
