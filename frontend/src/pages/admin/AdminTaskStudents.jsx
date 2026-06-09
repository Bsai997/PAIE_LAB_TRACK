import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function AdminTaskStudents() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskType = searchParams.get('type') || 'mcq'; // Default to mcq if not provided
  const [students, setStudents] = useState([]);
  const [isAlgorithmTask, setIsAlgorithmTask] = useState(taskType === 'algorithm');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading students for task ID:', id, 'Type:', taskType);
      
      // Fetch students based on task type
      if (taskType === 'algorithm') {
        const algRes = await api.get(`/admin/algorithm/${id}/submissions`);
        console.log('Algorithm submissions:', algRes.data);
        setStudents(algRes.data.submissions || []);
      } else {
        const studRes = await api.get(`/admin/tasks/${id}/students`);
        console.log('Students data:', studRes.data);
        setStudents(studRes.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, taskType]);

  const openReviewModal = (submission) => {
    setSelectedSubmission(submission);
    setReviewStatus('');
    setFeedback('');
    setMessage('');
    setShowReviewModal(true);
  };

  const handleReview = async (status) => {
    if (!status || !['accepted', 'rejected'].includes(status)) {
      setMessage('Invalid status');
      return;
    }

    if (status === 'rejected' && !feedback.trim()) {
      setMessage('Please provide feedback when rejecting');
      return;
    }

    setReviewing(true);
    try {
      await api.post(`/admin/algorithm/submissions/${selectedSubmission.id}/review`, {
        status,
        feedback: feedback || null,
      });
      setMessage(`Submission ${status} successfully`);
      setReviewStatus(status);
      setTimeout(() => {
        setShowReviewModal(false);
        loadData();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to review submission');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <h1>Task Students</h1>
        <p>Student progress for this task ({taskType})</p>
      </div>

      {loading && (
        <div className="tasks-feedback-card">
          <p>Loading students...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && isAlgorithmTask ? (
        <div className="algorithm-submissions-container">
          {students.length === 0 ? (
            <div className="tasks-feedback-card">No submissions yet</div>
          ) : (
            <div className="submissions-list">
              {students.map((submission) => (
                <div key={submission.id} className="submission-card">
                  <div className="submission-header">
                    <div>
                      <h3>{submission.student?.name}</h3>
                      <p className="submission-meta">Branch: {submission.student?.branch}</p>
                      {submission.submitted_at && (
                        <p className="submission-meta">Submitted: {new Date(submission.submitted_at).toLocaleString()}</p>
                      )}
                    </div>
                    <div className="submission-status">
                      {submission.answer ? (
                        <span className={`status-badge status-${submission.submission_status || 'submitted'}`}>
                          {submission.submission_status ? submission.submission_status.toUpperCase() : 'PENDING'}
                        </span>
                      ) : (
                        <span className="status-badge status-not-submitted">NOT SUBMITTED</span>
                      )}
                    </div>
                  </div>
                  <div className="submission-actions">
                    {submission.answer ? (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openReviewModal(submission)}
                      >
                        Open
                      </button>
                    ) : (
                      <span className="status-text">Awaiting submission</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !loading ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Branch</th>
                <th>Questions Solved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    No students assigned to this task
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.branch}</td>
                    <td>{s.questions_solved}</td>
                    <td><span className={`status status-${s.status}`}>{s.status.replace('_', ' ')}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal 
        open={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
        title="Review Algorithm Submission"
        wide
      >
        {selectedSubmission && (
          <div className="algorithm-review-modal">
            <div className="modal-header-section">
              <div className="student-card">
                <div className="student-info">
                  <h3 className="student-name">{selectedSubmission.student?.name}</h3>
                  <p className="student-detail"><strong>Branch:</strong> {selectedSubmission.student?.branch}</p>
                  <p className="student-detail"><strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                </div>
                <div className="student-status">
                  <span className={`status-badge status-${selectedSubmission.submission_status || 'submitted'}`}>
                    {selectedSubmission.submission_status ? selectedSubmission.submission_status.toUpperCase() : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-body-section">
              <div className="algorithm-section">
                <h4 className="section-title">Submitted Algorithm</h4>
                <pre className="algorithm-text">{selectedSubmission.answer}</pre>
              </div>
            </div>

            <div className="modal-footer-section">
              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
                  {message}
                </div>
              )}

              {!reviewStatus && (
                <div className="review-form">
                  <div className="form-group">
                    <label className="form-label">Your Feedback</label>
                    <p className="form-hint">Optional when accepting • Required when requesting changes</p>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide constructive feedback for the student..."
                      rows={3}
                      disabled={reviewing}
                      className="feedback-textarea"
                    />
                  </div>

                  <div className="review-button-group">
                    <button
                      className="btn btn-accept"
                      onClick={() => handleReview('accepted')}
                      disabled={reviewing}
                    >
                      <span>✓</span> Accept Submission
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleReview('rejected')}
                      disabled={reviewing}
                    >
                      <span>→</span> Request Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .algorithm-submissions-container {
          margin-top: 2rem;
        }

        .submissions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .submission-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .submission-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          flex: 1;
        }

        .submission-header h3 {
          margin: 0 0 0.5rem 0;
        }

        .submission-meta {
          margin: 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .submission-status {
          text-align: right;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .status-submitted {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-accepted {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-rejected {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .status-not-submitted {
          background-color: #e5e7eb;
          color: #6b7280;
        }

        .submission-actions {
          margin-left: 2rem;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .alert-error {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alert strong {
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
}
