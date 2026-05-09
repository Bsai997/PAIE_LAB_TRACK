import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import BarGraph from '../../components/BarGraph';
import { useAuth } from '../../context/AuthContext';
import { superAdminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function SuperAdminAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    regdid: '',
    email: '',
    password: '',
    branch: ''
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await superAdminAPI.getAdmins();
        setAdmins(res.data.admins);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchAdmins();
  }, [user?.token]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await superAdminAPI.createAdmin(formData);
      setFormData({ name: '', regdid: '', email: '', password: '', branch: '' });
      setShowForm(false);
      // Refresh admins
      const res = await superAdminAPI.getAdmins();
      setAdmins(res.data.admins);
    } catch (err) {
      console.error('Failed to create admin', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Questions Created',
      data: [12, 19, 15, 20],
      backgroundColor: '#2196F3'
    }]
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2>Admin Management</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Admin'}
          </button>
        </div>

        <div className="chart-container">
          <BarGraph title="Questions Created Weekly" data={chartData} />
        </div>

        {showForm && (
          <div className="form-container">
            <form onSubmit={handleCreateAdmin}>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Registration ID"
                value={formData.regdid}
                onChange={(e) => setFormData({ ...formData, regdid: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary">Create Admin</button>
            </form>
          </div>
        )}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Easy Questions</th>
                <th>Medium Questions</th>
                <th>Hard Questions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins?.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.department}</td>
                  <td>{admin.contribution?.easy || 0}</td>
                  <td>{admin.contribution?.medium || 0}</td>
                  <td>{admin.contribution?.hard || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
