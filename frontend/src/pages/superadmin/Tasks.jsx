import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { superAdminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function SuperAdminTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await superAdminAPI.getAllTasks();
        setTasks(res.data.tasks);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchTasks();
  }, [user?.token]);

  if (loading) return <div className="loading">Loading...</div>;

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return true; // Add more filtering logic as needed
  });

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>All Tasks</h2>

        <div className="filter-container">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Type</th>
                <th>Created By</th>
                <th>Total Submissions</th>
                <th>Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks?.map(task => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.difficulty}</td>
                  <td>{task.type}</td>
                  <td>{task.created_by_user?.name || 'Admin'}</td>
                  <td>{task.totalSubmissions}</td>
                  <td>{task.completed}</td>
                  <td>
                    <button className="btn btn-small">View Students</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
