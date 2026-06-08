import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', branch: '', clubmail: '', originalmail: '', password: '', role: 'admin', department: '',
  });
  const [message, setMessage] = useState('');

  const load = () => {
    api.get('/superadmin/admins', { params: { search } }).then((res) => setAdmins(res.data));
  };

  useEffect(() => { load(); }, [search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/superadmin/members', form);
    setMessage(res.data.message);
    setShowForm(false);
    load();
  };

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

      <div className="admin-list">
        {admins.map((admin) => (
          <div key={admin.id} className="admin-card">
            <img src={admin.profile_photo} alt={admin.name} className="avatar-lg" />
            <div className="admin-info">
              <h3>{admin.name}</h3>
              <p>{admin.department}</p>
            </div>
            <div className="contribution-circles">
              <div className="circle easy"><span>{admin.contribution.easy}</span><small>Easy</small></div>
              <div className="circle medium"><span>{admin.contribution.medium}</span><small>Medium</small></div>
              <div className="circle hard"><span>{admin.contribution.hard}</span><small>Hard</small></div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add a Member">
        <form onSubmit={handleAdd}>
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Branch</label><input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} /></div>
          <div className="form-group"><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
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
