import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const submitTest = useCallback(async () => {
    await api.post(`/student/tests/${id}/submit`, { answers });
    navigate('/student/tests');
  }, [id, answers, navigate]);

  useEffect(() => {
    api.post(`/student/tests/${id}/start`).then((res) => {
      setTestData(res.data);
      const end = new Date(res.data.endTime).getTime();
      setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    });
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || !testData) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, testData, submitTest]);

  if (!testData) return <Layout><p>Loading test...</p></Layout>;

  const questions = testData.questions || [];
  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <Layout>
      <div className="test-interface">
        <div className="test-header">
          <h1>{testData.test.name}</h1>
          <div className={`timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
        {q && (
          <>
            <p className="question-counter">Question {currentQ + 1} of {questions.length}</p>
            <p className="task-question">{q.question}</p>
            <div className="mcq-options">
              {(q.options || []).map((opt, i) => (
                <label key={i} className={`mcq-option ${answers[q.id] === i ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            <div className="test-nav">
              {currentQ > 0 && (
                <button className="btn btn-outline" onClick={() => setCurrentQ(currentQ - 1)}>Previous</button>
              )}
              {currentQ < questions.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next</button>
              ) : (
                <button className="btn btn-primary" onClick={submitTest}>Submit Test</button>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
