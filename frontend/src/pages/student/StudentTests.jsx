import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function StudentTests() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student/tests').then((res) => setTests(res.data));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>Tests</h1>
        <p>Available tests — click Join to start</p>
      </div>
      <div className="task-grid">
        {tests.map((test) => (
          <div key={test.id} className="task-card">
            <h3>{test.name}</h3>
            <p><strong>Duration:</strong> {test.duration} minutes</p>
            <p><strong>Date:</strong> {new Date(test.test_date).toLocaleDateString()}</p>
            {test.attempted ? (
              <span className="badge badge-completed">Completed</span>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate(`/student/tests/${test.id}/take`)}>
                Join
              </button>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}
