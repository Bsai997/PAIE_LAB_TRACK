import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export default function SuperAdminAdmins() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', branch: '', clubmail: '', originalmail: '', password: '', role: 'admin', skills: '',
  });

  const load = () => {
    api.get('/superadmin/admins', { params: { search } }).then((res) => {
      setAdmins(res.data);
    });
  };

  useEffect(() => { load(); }, [search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    if (value.length > 0) {
      const filtered = admins.filter(a => a.name.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name) => {
    setSearch(name);
    setShowSuggestions(false);
  };

  const getSkillList = (skills) => {
    if (!skills) return [];
    return skills
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/superadmin/members', form);
      showSuccess(res.data.message || 'Member created successfully.');
      setShowForm(false);
      setForm({ name: '', branch: '', clubmail: '', originalmail: '', password: '', role: 'admin', skills: '' });
      load();
    } catch (error) {
      showError(error.response?.data?.error || error.message);
    }
  };

  return (
    <Layout>
      <div className="admin-tasks-header superadmin-admins-header">
        <div className="superadmin-admins-title">
          <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <h1>Admin Control</h1>
          <p>Manage admin members and contributions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add a Member</button>
      </div>

      <div className="filters superadmin-admin-search-wrap" style={{ position: 'relative' }}>
        <span className="superadmin-admin-search-icon" aria-hidden="true">⌕</span>
        <input
          className="superadmin-admin-search"
          placeholder="Search admins..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => search.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="superadmin-admin-suggestions">
            {suggestions.map((admin) => (
              <div
                key={admin.id}
                onClick={() => selectSuggestion(admin.name)}
                className="superadmin-admin-suggestion-item"
              >
                <strong>{admin.name}</strong>
                <span>{admin.branch}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-list-container">
          <div className="admin-list">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-card superadmin-admin-card">
                <div className="admin-identity">
                  <img src={admin.profile_photo} alt={admin.name} className="avatar-lg" />
                  <div className="admin-info">
                    <h3>{admin.name}</h3>
                    <p><strong>Department:</strong> {admin.department || admin.branch || 'N/A'}</p>
                    <div className="admin-skills-line">
                      <strong>Skills:</strong>
                      <div className="admin-skills-chips">
                        {getSkillList(admin.skills).length > 0 ? (
                          getSkillList(admin.skills).map((skill) => (
                            <span key={`${admin.id}-${skill}`} className="skill-chip">{skill}</span>
                          ))
                        ) : (
                          <span className="skill-chip">No skills</span>
                        )}
                      </div>
                    </div>
                  </div>
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
