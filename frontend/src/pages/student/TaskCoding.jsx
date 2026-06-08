import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function TaskCoding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/student/tasks/${id}`).then((res) => setTask(res.data));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    await api.post(`/student/tasks/${id}/submit`, { answer: 'completed_on_leetcode' });
    navigate('/student/tasks');
  };

  if (!task) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="task-interface">
        <h1>{task.title}</h1>
        <p className="task-description">{task.description}</p>
        {task.leetcode_link && (
          <a href={task.leetcode_link} target="_blank" rel="noreferrer" className="btn btn-outline leetcode-link">
            Open LeetCode Problem
          </a>
        )}
        <p className="hint">Complete the problem on LeetCode, then mark as done below.</p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          Mark as Completed
        </button>
      </div>
    </Layout>
  );
}
