import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TestCard from '../../components/TestCard';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function StudentTests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await studentAPI.getTests();
        setTests(res.data.tests);
      } catch (err) {
        setError('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchTests();
  }, [user?.token]);

  const handleJoinTest = (testId) => {
    navigate(`/student/tests/${testId}`);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Available Tests</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="tests-container">
          {tests?.map(test => (
            <TestCard
              key={test.id}
              test={test}
              onJoin={handleJoinTest}
            />
          ))}
        </div>

        {!tests?.length && <p className="no-data">No tests available.</p>}
      </div>
    </>
  );
}
