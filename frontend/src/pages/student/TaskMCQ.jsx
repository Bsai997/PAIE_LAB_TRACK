import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function TaskMCQ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/student/tasks/${id}`).then((res) => setTask(res.data));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const correct = task.mcq_data?.correct_answer;
    const score = selected === correct ? 1 : 0;
    await api.post(`/student/tasks/${id}/submit`, { answer: selected, score });
    navigate('/student/tasks');
  };

  if (!task) return <Layout><p>Loading...</p></Layout>;

  const mcq = task.mcq_data || { question: task.description, options: [], correct_answer: 0 };

  return (
    <Layout>
      <div className="task-interface">
        <h1>{task.title}</h1>
        <p className="task-question">{mcq.question}</p>
        <div className="mcq-options">
          {(mcq.options || []).map((opt, i) => (
            <label key={i} className={`mcq-option ${selected === i ? 'selected' : ''}`}>
              <input type="radio" name="answer" checked={selected === i} onChange={() => setSelected(i)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={selected === null || submitting}>
          Submit Answer
        </button>
      </div>
    </Layout>
  );
}
