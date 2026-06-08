import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student/tasks').then((res) => setTasks(res.data)).finally(() => setLoading(false));
  }, []);

  const handleStart = async (task) => {
    await api.post(`/student/tasks/${task.id}/start`);
    if (task.type === 'mcq') navigate(`/student/tasks/${task.id}/mcq`);
    else if (task.type === 'coding') navigate(`/student/tasks/${task.id}/coding`);
    else navigate(`/student/tasks/${task.id}/error`);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Weekly Tasks</h1>
        <p>Tasks assigned for the current week</p>
      </div>
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks assigned this week.</div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h3>{task.title}</h3>
                <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
              </div>
              <div className="task-meta">
                <p><strong>Type:</strong> {task.type.toUpperCase()}</p>
                <p><strong>Due:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                <p><strong>Created by:</strong> {task.created_by}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                </p>
              </div>
              {task.status !== 'completed' && (
                <button className="btn btn-primary" onClick={() => handleStart(task)}>
                  Start
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
