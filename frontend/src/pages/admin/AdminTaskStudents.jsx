import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function AdminTaskStudents() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get(`/admin/tasks/${id}/students`).then((res) => setStudents(res.data));
  }, [id]);

  return (
    <Layout>
      <div className="page-header">
        <h1>Task Students</h1>
        <p>Student progress for this task</p>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Questions Solved (Week)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.department}</td>
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
