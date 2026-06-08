import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ completed_count: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'mcq', difficulty: 'easy', deadline: '', description: '',
    leetcode_link: '', concept: '',
    mcq_question: '', mcq_options: ['', '', '', ''], mcq_correct: 0,
    error_code: '', error_line: 1,
  });
  const navigate = useNavigate();

  const load = () => {
    api.get('/admin/tasks').then((res) => setTasks(res.data));
    api.get('/admin/tasks/stats').then((res) => setStats(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      type: form.type,
      difficulty: form.difficulty,
      deadline: form.deadline,
      description: form.description,
    };

    if (form.type === 'coding') {
      payload.leetcode_link = form.leetcode_link;
      payload.description = form.concept || form.description;
    } else if (form.type === 'mcq') {
      payload.mcq_data = {
        question: form.mcq_question,
        options: form.mcq_options.filter(Boolean),
        correct_answer: parseInt(form.mcq_correct, 10),
      };
    } else {
      payload.error_data = { code: form.error_code, correct_line: parseInt(form.error_line, 10) };
    }

    await api.post('/admin/tasks', payload);
    setShowForm(false);
    load();
  };

  const updateOption = (i, val) => {
    const opts = [...form.mcq_options];
    opts[i] = val;
    setForm({ ...form, mcq_options: opts });
  };

  return (
    <Layout>
      <div className="tasks-page-hero admin-tasks-header-hero">
        <div>
          <button className="back-nav-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <span aria-hidden="true">←</span>
            Back
          </button>
          <h1>Weekly Tasks</h1>
          <p>Manage assignments, monitor submissions, and review student progress.</p>
        </div>
        <div className="tasks-hero-metrics">
          <div className="metric-chip">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="metric-chip metric-chip-completed">
            <span>Students Completed</span>
            <strong>{stats.completed_count}</strong>
          </div>
        </div>
      </div>

      <div className="admin-tasks-header">
        <div>
          <h2>Task List</h2>
          <p>Weekly operational view</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create Weekly Task</button>
      </div>

      <div className="admin-tasks-layout">
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="tasks-feedback-card">No tasks found for this week.</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="admin-task-card task-card-professional">
                <div className="admin-task-main">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div className="task-meta-row">
                    <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span>Submissions: {task.total_submissions}</span>
                    <span>By: {task.created_by}</span>
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => navigate(`/admin/tasks/${task.id}/students`)}>
                  View Students
                </button>
              </div>
            ))
          )}
        </div>
        <div className="stat-sidebar">
          <div className="stat-card">
            <h3>Students Completed</h3>
            <p className="stat-number">{stats.completed_count}</p>
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Weekly Task" wide>
        <form onSubmit={handleCreate} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="mcq">MCQ</option>
                <option value="coding">Coding</option>
                <option value="error">Error Finding</option>
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
            </div>
          </div>

          {form.type === 'coding' && (
            <>
              <div className="form-group">
                <label>Concept of Problem</label>
                <input value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
              </div>
              <div className="form-group">
                <label>LeetCode Link</label>
                <input value={form.leetcode_link} onChange={(e) => setForm({ ...form, leetcode_link: e.target.value })} placeholder="https://leetcode.com/..." />
              </div>
            </>
          )}

          {form.type === 'mcq' && (
            <>
              <div className="form-group">
                <label>Question</label>
                <textarea value={form.mcq_question} onChange={(e) => setForm({ ...form, mcq_question: e.target.value })} rows={3} />
              </div>
              {form.mcq_options.map((opt, i) => (
                <div key={i} className="form-group mcq-form-option">
                  <label>
                    <input type="radio" name="correct" checked={form.mcq_correct === i} onChange={() => setForm({ ...form, mcq_correct: i })} />
                    Option {i + 1}
                  </label>
                  <input value={opt} onChange={(e) => updateOption(i, e.target.value)} />
                </div>
              ))}
            </>
          )}

          {form.type === 'error' && (
            <>
              <div className="form-group">
                <label>Code with Error</label>
                <textarea value={form.error_code} onChange={(e) => setForm({ ...form, error_code: e.target.value })} rows={8} placeholder="Paste code here..." />
              </div>
              <div className="form-group">
                <label>Correct Error Line Number</label>
                <input type="number" value={form.error_line} onChange={(e) => setForm({ ...form, error_line: e.target.value })} min="1" />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary">Create Task</button>
        </form>
      </Modal>
    </Layout>
  );
}
