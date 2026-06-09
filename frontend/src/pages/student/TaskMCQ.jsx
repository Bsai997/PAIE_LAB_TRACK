import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const normalizeAnswers = (raw, totalQuestions) => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'number') return { 0: raw };
  const fallback = {};
  for (let i = 0; i < totalQuestions; i += 1) {
    fallback[i] = undefined;
  }
  return fallback;
};

export default function TaskMCQ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/student/tasks/${id}`).then((res) => {
      const loadedTask = res.data;
      setTask(loadedTask);

      const questions = Array.isArray(loadedTask.mcq_data?.questions) && loadedTask.mcq_data.questions.length
        ? loadedTask.mcq_data.questions
        : [{
          question: loadedTask.mcq_data?.question || loadedTask.description,
          options: loadedTask.mcq_data?.options || [],
          correct_answer: loadedTask.mcq_data?.correct_answer ?? 0,
        }];

      if (loadedTask.status === 'completed' && loadedTask.submission_answer !== null) {
        setSelectedAnswers(normalizeAnswers(loadedTask.submission_answer, questions.length));
      }
    });
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const questions = Array.isArray(task.mcq_data?.questions) && task.mcq_data.questions.length
      ? task.mcq_data.questions
      : [{
        question: task.mcq_data?.question || task.description,
        options: task.mcq_data?.options || [],
        correct_answer: task.mcq_data?.correct_answer ?? 0,
      }];

    const score = questions.reduce((acc, q, index) => (
      selectedAnswers[index] === q.correct_answer ? acc + 1 : acc
    ), 0);

    await api.post(`/student/tasks/${id}/submit`, { answer: selectedAnswers, score });
    setTask((prev) => ({
      ...prev,
      status: 'completed',
      submission_score: score,
      submission_answer: selectedAnswers,
    }));
    setSubmitting(false);
  };

  if (!task) return <Layout><p>Loading...</p></Layout>;

  const mcqQuestions = Array.isArray(task.mcq_data?.questions) && task.mcq_data.questions.length
    ? task.mcq_data.questions
    : [{
      question: task.mcq_data?.question || task.description,
      options: task.mcq_data?.options || [],
      correct_answer: task.mcq_data?.correct_answer ?? 0,
    }];

  const allAnswered = mcqQuestions.every((_, index) => selectedAnswers[index] !== undefined);
  const isCompleted = task.status === 'completed';
  const totalScore = task.submission_score ?? 0;

  const selectOption = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  return (
    <Layout>
      <div className="task-interface">
        <h1>{task.title}</h1>
        {isCompleted && (
          <div className="task-score-banner">
            <strong>Total Score:</strong> {totalScore} / {mcqQuestions.length}
          </div>
        )}
        {mcqQuestions.map((mcq, qIndex) => (
          <div key={qIndex} className="task-question-block">
            <p className="task-question">Q{qIndex + 1}. {mcq.question}</p>
            <div className="mcq-options">
              {(mcq.options || []).map((opt, i) => (
                <label
                  key={i}
                  className={`mcq-option ${selectedAnswers[qIndex] === i && !isCompleted ? 'selected' : ''} ${isCompleted && i === mcq.correct_answer ? 'correct' : ''} ${isCompleted && selectedAnswers[qIndex] === i && i !== mcq.correct_answer ? 'incorrect' : ''}`}
                >
                  <input
                    type="radio"
                    name={`answer-${qIndex}`}
                    checked={selectedAnswers[qIndex] === i}
                    onChange={() => selectOption(qIndex, i)}
                    disabled={isCompleted}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {isCompleted && (
              <p className="mcq-answer-review">Correct Answer: {(mcq.options || [])[mcq.correct_answer] || 'N/A'}</p>
            )}
          </div>
        ))}
        {isCompleted ? (
          <button className="btn btn-outline" onClick={() => navigate('/student/tasks')}>
            Back to Tasks
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered || submitting}>
            Submit Answer
          </button>
        )}
      </div>
    </Layout>
  );
}
