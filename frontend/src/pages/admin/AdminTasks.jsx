import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const createEmptyMcq = () => ({ question: '', options: ['', ''], correct_answer: 0 });

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ completed_count: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'mcq', difficulty: 'easy', deadline: '', description: '',
    leetcode_link: '', concept: '',
    mcq_questions: [createEmptyMcq()],
    error_code: '', error_line: 1,
  });
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

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
      deadline: (form.deadline || '').slice(0, 10),
      description: form.description,
    };

    if (form.type === 'coding') {
      payload.leetcode_link = form.leetcode_link;
      payload.description = form.concept || form.description;
    } else if (form.type === 'mcq') {
      const questions = (form.mcq_questions || [])
        .map((q) => {
          const cleanOptions = (q.options || []).map((o) => (o || '').trim()).filter(Boolean);
          const maxIndex = Math.max(cleanOptions.length - 1, 0);
          return {
            question: (q.question || '').trim(),
            options: cleanOptions,
            correct_answer: Math.min(parseInt(q.correct_answer, 10) || 0, maxIndex),
          };
        })
        .filter((q) => q.question && q.options.length >= 2);

      if (!questions.length) {
        showError('Please add at least one MCQ with a question and two options.');
        return;
      }

      payload.mcq_data = {
        questions,
        question: questions[0].question,
        options: questions[0].options,
        correct_answer: questions[0].correct_answer,
      };
    } else {
      payload.error_data = { code: form.error_code, correct_line: parseInt(form.error_line, 10) };
    }

    try {
      await api.post('/admin/tasks', payload);
      setShowForm(false);
      showSuccess('Task created successfully.');
      load();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to create task. Please try again.');
    }
  };

  const updateMcqQuestion = (questionIndex, value) => {
    setForm((prev) => ({
      ...prev,
      mcq_questions: prev.mcq_questions.map((q, i) =>
        i === questionIndex ? { ...q, question: value } : q
      ),
    }));
  };

  const updateMcqOption = (questionIndex, optionIndex, value) => {
    setForm((prev) => ({
      ...prev,
      mcq_questions: prev.mcq_questions.map((q, i) => {
        if (i !== questionIndex) return q;
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options };
      }),
    }));
  };

  const setCorrectOption = (questionIndex, optionIndex) => {
    setForm((prev) => ({
      ...prev,
      mcq_questions: prev.mcq_questions.map((q, i) =>
        i === questionIndex ? { ...q, correct_answer: optionIndex } : q
      ),
    }));
  };

  const addMcqOption = (questionIndex) => {
    setForm((prev) => ({
      ...prev,
      mcq_questions: prev.mcq_questions.map((q, i) =>
        i === questionIndex ? { ...q, options: [...q.options, ''] } : q
      ),
    }));
  };

  const removeMcqOption = (questionIndex, optionIndex) => {
    setForm((prev) => ({
      ...prev,
      mcq_questions: prev.mcq_questions.map((q, i) => {
        if (i !== questionIndex || q.options.length <= 2) return q;
        const nextOptions = q.options.filter((_, idx) => idx !== optionIndex);
        const nextCorrect = q.correct_answer === optionIndex
          ? 0
          : q.correct_answer > optionIndex
            ? q.correct_answer - 1
            : q.correct_answer;

        return { ...q, options: nextOptions, correct_answer: nextCorrect };
      }),
    }));
  };

  const addAnotherQuestion = () => {
    setForm((prev) => ({
      ...prev,
      mcq_questions: [...prev.mcq_questions, createEmptyMcq()],
    }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((prev) => {
      if (prev.mcq_questions.length <= 1) return prev;
      return {
        ...prev,
        mcq_questions: prev.mcq_questions.filter((_, i) => i !== questionIndex),
      };
    });
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
                  <p><strong>Topic:</strong> {task.description}</p>
                  <div className="task-meta-row">
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span>Submissions: {task.total_submissions}</span>
                    <span>By: {task.created_by}</span>
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: '0.5rem', textAlign: 'right' }}>
                    <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                  </div>
                  <button className="btn btn-outline" onClick={() => navigate(`/admin/tasks/${task.id}/students`)}>
                    View Students
                  </button>
                </div>
              </div>
            ))
          )}
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
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
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
            <div className="mcq-builder-stack">
              {form.mcq_questions.map((mcq, qIndex) => (
                <div key={qIndex} className="mcq-builder-card">
                  <div className="mcq-builder-titlebar">
                    <span className="mcq-question-tag">Question {qIndex + 1}</span>
                    {form.mcq_questions.length > 1 && (
                      <button
                        type="button"
                        className="mcq-remove-question"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        Remove Question
                      </button>
                    )}
                  </div>
                  <div className="mcq-question-header">
                    <input
                      className="mcq-question-input"
                      value={mcq.question}
                      onChange={(e) => updateMcqQuestion(qIndex, e.target.value)}
                      placeholder="Untitled Question"
                    />
                  </div>
                  <p className="mcq-answer-hint">Select the correct answer using the radio button. Students can view correct answers only after completing the task.</p>
                  {mcq.options.map((opt, i) => (
                    <div key={i} className="mcq-option-row">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={mcq.correct_answer === i}
                        onChange={() => setCorrectOption(qIndex, i)}
                        aria-label={`Mark option ${i + 1} as correct for question ${qIndex + 1}`}
                      />
                      <input
                        className="mcq-option-input"
                        value={opt}
                        onChange={(e) => updateMcqOption(qIndex, i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                      />
                      {mcq.options.length > 2 && (
                        <button
                          type="button"
                          className="mcq-remove-option"
                          onClick={() => removeMcqOption(qIndex, i)}
                          aria-label={`Remove option ${i + 1} from question ${qIndex + 1}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="mcq-add-row">
                    <button type="button" className="mcq-add-option" onClick={() => addMcqOption(qIndex)}>Add option</button>
                    <span>or</span>
                    <button type="button" className="mcq-add-other" onClick={() => addMcqOption(qIndex)}>add "Other"</button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-outline mcq-add-question-btn" onClick={addAnotherQuestion}>
                Add Another Question
              </button>
            </div>
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
