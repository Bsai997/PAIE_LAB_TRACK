import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function SuperAdminTasks() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/superadmin/tasks').then((res) => setTasks(res.data));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>Task Monitoring</h1>
        <p>All tasks across the system</p>
      </div>
      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className="admin-task-card">
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
        ))}
      </div>
    </Layout>
  );
}
