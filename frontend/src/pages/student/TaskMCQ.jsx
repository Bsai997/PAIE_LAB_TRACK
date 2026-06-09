import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

export default function TaskMCQ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/student/tasks/${id}`).then((res) => setTask(res.data));
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
    navigate('/student/tasks');
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

  const selectOption = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  return (
    <Layout>
      <div className="task-interface">
        <h1>{task.title}</h1>
        {mcqQuestions.map((mcq, qIndex) => (
          <div key={qIndex} className="task-question-block">
            <p className="task-question">Q{qIndex + 1}. {mcq.question}</p>
            <div className="mcq-options">
              {(mcq.options || []).map((opt, i) => (
                <label key={i} className={`mcq-option ${selectedAnswers[qIndex] === i ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`answer-${qIndex}`}
                    checked={selectedAnswers[qIndex] === i}
                    onChange={() => selectOption(qIndex, i)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered || submitting}>
          Submit Answer
        </button>
      </div>
    </Layout>
  );
}
