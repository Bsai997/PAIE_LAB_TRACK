import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', branch: '', clubmail: '', originalmail: '', password: '', role: 'admin', skills: '',
  });
  const [message, setMessage] = useState('');

  const load = () => {
    api.get('/superadmin/admins', { params: { search } }).then((res) => {
      setAdmins(res.data);
    });
  };

  useEffect(() => { load(); }, [search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/superadmin/members', form);
    setMessage(res.data.message);
    setShowForm(false);
    setForm({ name: '', branch: '', clubmail: '', originalmail: '', password: '', role: 'admin', skills: '' });
    load();
  };

  const total = contributionStats.easy + contributionStats.medium + contributionStats.hard;
  const easyPercent = total ? (contributionStats.easy / total * 100) : 0;
  const mediumPercent = total ? (contributionStats.medium / total * 100) : 0;
  const hardPercent = total ? (contributionStats.hard / total * 100) : 0;

  return (
    <Layout>
      <div className="admin-tasks-header">
        <div>
          <h1>Admin Control</h1>
          <p>Manage admin members and contributions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add a Member</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="filters">
        <input placeholder="Search admins..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="admin-section">
        <div className="admin-list-container">
          <div className="admin-list">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-card">
                <img src={admin.profile_photo} alt={admin.name} className="avatar-lg" />
                <div className="admin-info">
                  <h3>{admin.name}</h3>
                  <p>{admin.skills || 'No skills listed'}</p>
                </div>
                <div className="contribution-circles">
                  <div className="circle easy"><span>{admin.contribution?.easy || 0}</span><small>Easy</small></div>
                  <div className="circle medium"><span>{admin.contribution?.medium || 0}</span><small>Medium</small></div>
                  <div className="circle hard"><span>{admin.contribution?.hard || 0}</span><small>Hard</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add a Member">
        <form onSubmit={handleAdd}>
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Branch</label><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
          <div className="form-group"><label>Skills</label><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g., React, Node.js, Python" /></div>
          <div className="form-group"><label>Club Mail (Reg ID)</label><input value={form.clubmail} onChange={(e) => setForm({ ...form, clubmail: e.target.value })} required /></div>
          <div className="form-group"><label>Original Mail</label><input type="email" value={form.originalmail} onChange={(e) => setForm({ ...form, originalmail: e.target.value })} required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Create Account</button>
        </form>
      </Modal>
    </Layout>
  );
}
