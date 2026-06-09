import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AdminTaskStudents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get(`/admin/tasks/${id}/students`).then((res) => setStudents(res.data));
  }, [id]);

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1>Task Students</h1>
        <p>Student progress for this task</p>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Branch</th>
              <th>Total Questions Solved </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.branch}</td>
                <td>{s.questions_solved}</td>
                <td><span className={`status status-${s.status}`}>{s.status.replace('_', ' ')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
