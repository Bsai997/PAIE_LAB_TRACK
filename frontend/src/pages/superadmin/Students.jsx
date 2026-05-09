import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BarGraph from '../../components/BarGraph';
import { useAuth } from '../../context/AuthContext';
import { superAdminAPI } from '../../services/api';
import '../../styles/dashboard.css';

export default function SuperAdminStudents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await superAdminAPI.getStudents();
        setStudents(res.data.students);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchStudents();
  }, [user?.token]);

  if (loading) return <div className="loading">Loading...</div>;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Students Completed Tasks',
      data: [45, 52, 48, 61],
      backgroundColor: '#4CAF50'
    }]
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h2>Student Management</h2>

        <div className="chart-container">
          <BarGraph title="Weekly Student Task Completion" data={chartData} />
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search students..."
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
                <th>Email</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents?.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.department}</td>
                  <td>
                    <button
                      className="btn btn-small"
                      onClick={() => navigate(`/superadmin/students/${student.id}/performance`)}
                    >
                      View Performance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
