import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function TaskError() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/student/tasks/${id}`).then((res) => setTask(res.data));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const correct = task.error_data?.correct_line;
    const score = parseInt(answer, 10) === correct ? 1 : 0;
    await api.post(`/student/tasks/${id}/submit`, { answer, score });
    navigate('/student/tasks');
  };

  if (!task) return <Layout><p>Loading...</p></Layout>;

  const errData = task.error_data || { code: task.description, correct_line: 1 };

  return (
    <Layout>
      <div className="task-interface">
        <h1>{task.title}</h1>
        <p>Find the line with the error in the code below:</p>
        <pre className="code-block">
          {(errData.code || '').split('\n').map((line, i) => (
            <div key={i} className="code-line">
              <span className="line-num">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </pre>
        <div className="form-group">
          <label>Enter the line number with the error:</label>
          <input type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} min="1" />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!answer || submitting}>
          Submit Answer
        </button>
      </div>
    </Layout>
  );
}
