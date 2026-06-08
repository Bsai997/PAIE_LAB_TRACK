import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function SuperAdminTasks() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const totalAssigned = tasks.reduce((sum, task) => sum + (task.students_assigned || 0), 0);
  const totalSubmissions = tasks.reduce((sum, task) => sum + (task.total_submissions || 0), 0);

  useEffect(() => {
    api.get('/superadmin/tasks').then((res) => setTasks(res.data));
  }, []);

  return (
    <Layout>
      <div className="tasks-page-hero">
        <div>
          <button className="back-nav-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <span aria-hidden="true">←</span>
            Back
          </button>
          <h1>Task Monitoring</h1>
          <p>Track platform-wide task activity and drill down into student-level details.</p>
        </div>
        <div className="tasks-hero-metrics">
          <div className="metric-chip">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="metric-chip metric-chip-completed">
            <span>Total Submissions</span>
            <strong>{totalSubmissions}</strong>
          </div>
          <div className="metric-chip metric-chip-pending">
            <span>Assigned Students</span>
            <strong>{totalAssigned}</strong>
          </div>
        </div>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="tasks-feedback-card">No tasks available to monitor yet.</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="admin-task-card task-card-professional">
              <div className="admin-task-main">
                <h3>{task.title}</h3>
                <div className="task-meta-row">
                  <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                  <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  <span>Submissions: {task.total_submissions}/{task.students_assigned}</span>
                  <span>By: {task.created_by}</span>
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => navigate(`/superadmin/tasks/${task.id}/students`)}>
                View Students
              </button>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
