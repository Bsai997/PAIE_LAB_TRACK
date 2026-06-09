import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function SuperAdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/superadmin/students', { params: { search, department } }).then((res) => setStudents(res.data));
  }, [search, department]);

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1>Student Management</h1>
        <p>View and monitor all students</p>
      </div>
      <div className="filters">
        <input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="all">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
        </select>
      </div>
      <div className="student-card-list">
        {students.map((s) => (
          <div key={s.id} className="student-rect-card">
            <div className="student-left">
              <img src={s.profile_photo} alt={s.name} className="avatar-lg" />
              <div>
                <h3>{s.name}</h3>
                <p>Department:{s.branch} </p>
              </div>
            </div>
            <div className="contribution-circles">
              <div className="circle easy"><span>{s.solved.easy}</span><small>Easy</small></div>
              <div className="circle medium"><span>{s.solved.medium}</span><small>Medium</small></div>
              <div className="circle hard"><span>{s.solved.hard}</span><small>Hard</small></div>
            </div>
            <button className="btn btn-outline" onClick={() => navigate(`/superadmin/students/${s.id}/performance`)}>
              View Performance
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
