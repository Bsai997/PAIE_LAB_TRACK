import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTasks = async () => {
    const res = await api.get('/student/tasks');
    setTasks(res.data);
  };

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const pendingCount = tasks.filter((task) => task.status !== 'completed').length;

  useEffect(() => {
    loadTasks().finally(() => setLoading(false));
  }, []);

  const handleStart = async (task) => {
    await api.post(`/student/tasks/${task.id}/start`);
    if (task.type === 'mcq') navigate(`/student/tasks/${task.id}/mcq`);
    else if (task.type === 'coding') {
      // Coding tasks should send students directly to the external problem page.
      if (task.coding?.practice_link) {
        window.open(task.coding.practice_link, '_blank', 'noopener,noreferrer');
      }
    } else if (task.type === 'error') {
      navigate(`/student/tasks/${task.id}/error`);
    } else if (task.type === 'algorithm') {
      navigate(`/student/tasks/${task.id}/algorithm`);
    }
  };

  const handleMarkCompleted = async (taskId) => {
    await api.post(`/student/tasks/${taskId}/submit`, {
      answer: 'Marked complete from tasks page',
    });
    await loadTasks();
  };

  return (
    <Layout>
      <div className="tasks-page-hero">
        <div>
          <button className="back-nav-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <span aria-hidden="true">←</span>
            Back
          </button>
          <h1>Weekly Tasks</h1>
          <p>Plan your week, start tasks on time, and track completion progress.</p>
        </div>
        <div className="tasks-hero-metrics">
          <div className="metric-chip">
            <span>Total</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="metric-chip metric-chip-completed">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
          <div className="metric-chip metric-chip-pending">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="tasks-feedback-card">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="tasks-feedback-card">No tasks assigned this week.</div>
      ) : (
        <div className="task-grid task-grid-professional">
          {tasks.map((task) => (
            <div key={task.id} className="task-card task-card-professional">
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <div className="task-card-header-right">
                  <span className={`status-pill status-pill-${task.status}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                </div>
              </div>
              {task.description && <p className="task-description">{task.description}</p>}
              <div className="task-meta task-meta-compact">
                <p><strong>Type:</strong> {task.type.toUpperCase()}</p>
                <p><strong>Due:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                <p><strong>Created by:</strong> {task.created_by}</p>
              </div>
              <div className="task-footer-row">
                {task.status !== 'completed' && (
                  <>
                    <button className="btn btn-primary" onClick={() => handleStart(task)}>
                      Start
                    </button>
                    {task.type === 'coding' && (
                      <button className="btn btn-outline" onClick={() => handleMarkCompleted(task.id)}>
                        Mark as Completed
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
