import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function SubmitAlgorithm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [algorithm, setAlgorithm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const res = await api.get(`/student/tasks/${id}`);
        setTask(res.data);
        if (res.data.submission_answer) {
          setAlgorithm(res.data.submission_answer);
        }
      } catch (error) {
        setMessage('Failed to load task');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!algorithm.trim()) {
      setMessage('Please write your algorithm');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/student/tasks/${id}/submit`, { answer: algorithm });
      setMessage(res.data.message || 'Algorithm submitted successfully!');
      setMessageType('success');
      setTimeout(() => {
        navigate('/student/tasks');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to submit algorithm');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="tasks-feedback-card">Loading...</div></Layout>;
  if (!task) return <Layout><div className="tasks-feedback-card">Task not found</div></Layout>;

  return (
    <Layout>
      <div className="task-page-header">
        <button className="back-nav-btn" onClick={() => navigate('/student/tasks')} aria-label="Go back">
          <span aria-hidden="true">←</span>
          Back to Tasks
        </button>
        <h1>{task.title}</h1>
        <p className="task-meta-line">
          Difficulty: <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span> | 
          Due: {new Date(task.deadline).toLocaleDateString()}
        </p>
      </div>

      <div className="algorithm-task-container">
        <div className="algorithm-problem-panel">
          <h2>Problem Statement</h2>
          <div className="problem-content">
            <p>{task.typeSpecific?.problem_statement}</p>
          </div>

          <h3>Input</h3>
          <div className="example-box">
            <pre>{task.typeSpecific?.input_description}</pre>
          </div>

          <h3>Output</h3>
          <div className="example-box">
            <pre>{task.typeSpecific?.output_description}</pre>
          </div>

          {task.admin_feedback && (
            <div className={`feedback-box feedback-${task.submission_status}`}>
              <h4>{task.submission_status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}</h4>
              <p>{task.admin_feedback}</p>
            </div>
          )}
        </div>

        <div className="algorithm-submission-panel">
          <h2>Your Algorithm</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <textarea
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                placeholder="Write your algorithm here. Explain your approach step by step...&#10;&#10;Example:&#10;1. Check if array is empty&#10;2. Initialize low = 0, high = len-1&#10;3. While low <= high:&#10;   - Calculate mid = (low + high) / 2&#10;   - If arr[mid] == target, return mid&#10;   - Else if arr[mid] < target, low = mid + 1&#10;   - Else high = mid - 1&#10;4. Return -1 if not found"
                rows={14}
                disabled={task.submission_status === 'accepted'}
                className="algorithm-textarea"
              />
            </div>

            {message && (
              <div className={`alert alert-${messageType === 'success' ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {task.submission_status === 'accepted' ? (
              <div className="success-message">
                ✓ Your algorithm has been accepted!
              </div>
            ) : (
              <button 
                type="submit" 
                className="btn btn-primary btn-large" 
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : task.submission_status === 'submitted' ? 'Resubmit Algorithm' : 'Submit Algorithm'}
              </button>
            )}
          </form>

          {task.submission_status === 'submitted' && (
            <div className="status-info">
              <p>⏳ Your algorithm is pending review by admin</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .algorithm-task-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin: 2rem 0;
        }

        .algorithm-problem-panel,
        .algorithm-submission-panel {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .problem-content {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .example-box {
          background: #1f1f1f;
          color: #d4d4d4;
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .feedback-box {
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 4px;
          border-left: 4px solid;
        }

        .feedback-accepted {
          background-color: #f0fdf4;
          border-left-color: #22c55e;
          color: #166534;
        }

        .feedback-rejected {
          background-color: #fef2f2;
          border-left-color: #ef4444;
          color: #991b1b;
        }

        .algorithm-textarea {
          width: 100%;
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        }

        .algorithm-textarea:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .btn-large {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .success-message {
          background-color: #f0fdf4;
          border: 1px solid #22c55e;
          color: #166534;
          padding: 1rem;
          border-radius: 4px;
          text-align: center;
          margin-top: 1rem;
        }

        .status-info {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 4px;
          color: #92400e;
          text-align: center;
        }

        @media (max-width: 768px) {
          .algorithm-task-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
