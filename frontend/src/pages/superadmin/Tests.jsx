import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import TestCard from '../../components/TestCard';
import { useAuth } from '../../context/AuthContext';
import { superAdminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function SuperAdminTests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    date: ''
  });

  useEffect(() => {
    setLoading(false);
  }, [user?.token]);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await superAdminAPI.createTest(formData);
      setFormData({ name: '', duration: 60, date: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create test', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h2>Tests</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Test'}
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <form onSubmit={handleCreateTest}>
              <input
                type="text"
                placeholder="Test Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
              />
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary">Create Test</button>
            </form>
          </div>
        )}

        <div className="tests-container">
          {tests?.map(test => (
            <TestCard key={test.id} test={test} onJoin={() => {}} />
          ))}
        </div>

        {!tests?.length && <p className="no-data">No tests created yet.</p>}
      </div>
    </>
  );
}
