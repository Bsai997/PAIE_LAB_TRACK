import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import TaskCard from '../../components/TaskCard';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function StudentTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ submitted: 0, pending: 0, notSubmitted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await studentAPI.getDashboard();
        setStats(dashboardRes.data.weekStats);

        const tasksRes = await studentAPI.getTasks();
        setTasks(tasksRes.data.tasks);
      } catch (err) {
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchData();
  }, [user?.token]);

  const handleStartTask = async (taskId) => {
    try {
      await studentAPI.startTask(taskId);
      // Refresh tasks
      const tasksRes = await studentAPI.getTasks();
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      setError('Failed to start task');
    }
  };

  const handleViewDetails = (taskId) => {
    navigate(`/student/tasks/${taskId}`);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Tasks - This Week</h2>
        
        <div className="stats-grid">
          <StatCard label="Tasks Submitted" value={stats.submitted} color="#4CAF50" />
          <StatCard label="Pending Tasks" value={stats.pending} color="#FFC107" />
          <StatCard label="Not Submitted" value={stats.notSubmitted} color="#F44336" />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tasks-container">
          {tasks?.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStart={handleStartTask}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {!tasks?.length && <p className="no-data">No tasks assigned for this week.</p>}
      </div>
    </>
  );
}
