import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LeaderboardTable from '../../components/LeaderboardTable';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function AdminLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await studentAPI.getLeaderboard(searchTerm);
        setLeaderboard(res.data.leaderboard);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchLeaderboard();
  }, [user?.token, searchTerm]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Leaderboard</h2>
        <LeaderboardTable
          data={leaderboard}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
      </div>
    </>
  );
}
