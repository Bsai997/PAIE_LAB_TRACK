import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function Leaderboard({ apiPath = '/student/leaderboard' }) {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [sort, setSort] = useState('total');

  const fetchData = () => {
    api.get(apiPath, { params: { search, department, sort } }).then((res) => setData(res.data));
  };

  useEffect(() => {
    fetchData();
  }, [search, department, sort]);

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1>Leaderboard</h1>
        <p>Student rankings based on task completion</p>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="all">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="total">Sort by Total</option>
          <option value="easy">Sort by Easy</option>
          <option value="medium">Sort by Medium</option>
          <option value="hard">Sort by Hard</option>
        </select>
      </div>
      <div className="leaderboard-list">
        {data.map((s) => (
          <div key={s.id} className="leaderboard-item">
            <span className="rank">#{s.rank}</span>
            <img src={s.profile_photo} alt={s.name} className="avatar" />
            <div className="leaderboard-info">
              <strong>{s.name}</strong>
              <span>{s.department} · {s.branch}</span>
            </div>
            <div className="leaderboard-scores">
              <span className="score easy">E: {s.easy}</span>
              <span className="score medium">M: {s.medium}</span>
              <span className="score hard">H: {s.hard}</span>
              <span className="score total">Total: {s.total}</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
