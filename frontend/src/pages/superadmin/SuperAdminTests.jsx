import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import api from '../../api/axios';

export default function SuperAdminTests() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [testForm, setTestForm] = useState({ name: '', duration: 30, test_date: '' });
  const [questionForm, setQuestionForm] = useState({ question: '', options: ['', '', '', ''], correct_answer: 0 });
  const [questions, setQuestions] = useState([]);

  const loadTests = () => api.get('/superadmin/tests').then((res) => setTests(res.data));
  useEffect(() => { loadTests(); }, []);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    const res = await api.post('/superadmin/tests', testForm);
    setSelectedTest(res.data);
    setShowCreate(false);
    setShowQuestion(true);
    loadTests();
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    await api.post(`/superadmin/tests/${selectedTest.id}/questions`, {
      question: questionForm.question,
      options: questionForm.options.filter(Boolean),
      correct_answer: questionForm.correct_answer,
    });
    setQuestionForm({ question: '', options: ['', '', '', ''], correct_answer: 0 });
    const res = await api.get(`/superadmin/tests/${selectedTest.id}/questions`);
    setQuestions(res.data);
  };

  const openQuestions = async (test) => {
    setSelectedTest(test);
    const res = await api.get(`/superadmin/tests/${test.id}/questions`);
    setQuestions(res.data);
    setShowQuestion(true);
  };

  const updateOption = (i, val) => {
    const opts = [...questionForm.options];
    opts[i] = val;
    setQuestionForm({ ...questionForm, options: opts });
  };

  return (
    <Layout>
      <div className="admin-tasks-header">
        <div>
          <h1>Test Control</h1>
          <p>Add and manage test questions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Test</button>
      </div>
      <div className="task-grid">
        {tests.map((test) => (
          <div key={test.id} className="task-card">
            <h3>{test.name}</h3>
            <p>Duration: {test.duration} min</p>
            <button className="btn btn-outline" onClick={() => openQuestions(test)}>Manage Questions</button>
          </div>
        ))}
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Test">
        <form onSubmit={handleCreateTest}>
          <div className="form-group"><label>Name</label><input value={testForm.name} onChange={(e) => setTestForm({ ...testForm, name: e.target.value })} required /></div>
          <div className="form-group"><label>Duration (min)</label><input type="number" value={testForm.duration} onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })} required /></div>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </Modal>
      <Modal open={showQuestion} onClose={() => setShowQuestion(false)} title={`Questions — ${selectedTest?.name}`} wide>
        {questions.length > 0 && <p>{questions.length} question(s) added</p>}
        <form onSubmit={handleAddQuestion}>
          <div className="form-group"><label>Question</label><textarea value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} rows={3} required /></div>
          {questionForm.options.map((opt, i) => (
            <div key={i} className="form-group mcq-form-option">
              <label><input type="radio" checked={questionForm.correct_answer === i} onChange={() => setQuestionForm({ ...questionForm, correct_answer: i })} /> Option {i + 1}</label>
              <input value={opt} onChange={(e) => updateOption(i, e.target.value)} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary">Add Question</button>
        </form>
      </Modal>
    </Layout>
  );
}
