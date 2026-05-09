import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import TaskCard from '../../components/TaskCard';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function AdminTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ allCompleted: 0, notStarted: 0, notSubmitted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'mcq',
    difficulty: 'medium',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await adminAPI.getDashboard();
        setStats(dashboardRes.data.weekStats);

        const tasksRes = await adminAPI.getTasks();
        setTasks(tasksRes.data.tasks);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchData();
  }, [user?.token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createTask(formData);
      setFormData({ title: '', type: 'mcq', difficulty: 'medium', deadline: '', description: '' });
      setShowForm(false);
      // Refresh tasks
      const tasksRes = await adminAPI.getTasks();
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      setError('Failed to create task');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2>Tasks</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Contribution'}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="mcq">MCQ</option>
                <option value="coding">Coding</option>
                <option value="error">Error Finding</option>
              </select>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">Create Task</button>
            </form>
          </div>
        )}

        <div className="stats-grid">
          <StatCard label="Students Completed All" value={stats.allCompleted} color="#4CAF50" />
          <StatCard label="Not Started" value={stats.notStarted} color="#FFC107" />
          <StatCard label="Not Submitted" value={stats.notSubmitted} color="#F44336" />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tasks-container">
          {tasks?.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={() => {}}
              onViewDetails={() => {}}
            />
          ))}
        </div>
      </div>
    </>
  );
}
