import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getCurrentWeek } from '../utils/week.js';

const router = express.Router();
router.use(authenticate, authorize('student'));

router.get('/tasks', async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();

    // OPTIMIZED: Single query with proper joins instead of 6 separate queries
    const { data: allTasks, error } = await supabase
      .from('tasks')
      .select(`
        id, title, type, difficulty, deadline, description, week_number,
        created_by_user:users!tasks_created_by_fkey(name),
        submission:task_submissions!task_submissions_task_id_student_id_fkey(
          status, submitted_at
        ),
        coding:coding_tasks(task_id, practice_link),
        mcq:mcq_tasks(task_id, question, options, correct_answer),
        error:error_tasks(task_id, code, correct_line),
        algorithm:algorithm_tasks(task_id, problem_statement, input_description, output_description)
      `)
      .eq('week_number', weekNumber)
      .eq('year', year)
      .eq('submission.student_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });

    const result = (allTasks || []).map((t) => {
      const taskData = {
        id: t.id,
        title: t.title,
        type: t.type,
        difficulty: t.difficulty,
        deadline: t.deadline,
        description: t.description,
        created_by: t.created_by_user?.name || 'Admin',
        status: t.submission && t.submission.length > 0 ? t.submission[0].status : 'not_started',
      };

      if (t.type === 'coding' && t.coding?.length) {
        taskData.coding = t.coding[0];
      } else if (t.type === 'mcq' && t.mcq?.length) {
        taskData.mcq = t.mcq[0];
      } else if (t.type === 'error' && t.error?.length) {
        taskData.error = t.error[0];
      } else if (t.type === 'algorithm' && t.algorithm?.length) {
        taskData.algorithm = t.algorithm[0];
      }

      return taskData;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/tasks/:id', async (req, res) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !task) return res.status(404).json({ error: 'Task not found' });

    const { data: sub } = await supabase
      .from('task_submissions')
      .select('status, score, answer, submitted_at, submission_status, admin_feedback')
      .eq('task_id', req.params.id)
      .eq('student_id', req.user.id)
      .maybeSingle();

    // Fetch type-specific data
    let typeSpecificData = null;
    if (task.type === 'coding') {
      const { data } = await supabase.from('coding_tasks').select('practice_link').eq('task_id', req.params.id).single();
      typeSpecificData = data;
    } else if (task.type === 'mcq') {
      const { data } = await supabase.from('mcq_tasks').select('question, options, correct_answer').eq('task_id', req.params.id).single();
      typeSpecificData = data;
    } else if (task.type === 'error') {
      const { data } = await supabase.from('error_tasks').select('code, correct_line').eq('task_id', req.params.id).single();
      typeSpecificData = data;
    } else if (task.type === 'algorithm') {
      const { data } = await supabase.from('algorithm_tasks').select('problem_statement, input_description, output_description').eq('task_id', req.params.id).single();
      typeSpecificData = data;
    }

    res.json({
      ...task,
      typeSpecific: typeSpecificData,
      status: sub?.status || 'not_started',
      submission_score: sub?.score ?? null,
      submission_answer: sub?.answer ?? null,
      submitted_at: sub?.submitted_at ?? null,
      submission_status: sub?.submission_status ?? null,
      admin_feedback: sub?.admin_feedback ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/tasks/:id/submit', async (req, res) => {
  try {
    const { answer, score } = req.body;
    const taskId = req.params.id;

    // Get the task to determine type
    const { data: task } = await supabase.from('tasks').select('type').eq('id', taskId).single();

    const { data: existing } = await supabase
      .from('task_submissions')
      .select('id')
      .eq('task_id', taskId)
      .eq('student_id', req.user.id)
      .maybeSingle();

    const payload = {
      task_id: taskId,
      student_id: req.user.id,
      status: 'completed',
      answer: answer || null,
      score: score ?? null,
      submitted_at: new Date().toISOString(),
    };

    // For algorithm tasks, set submission_status to 'submitted' (pending review)
    if (task?.type === 'algorithm') {
      payload.submission_status = 'submitted';
    }

    if (existing) {
      await supabase.from('task_submissions').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('task_submissions').insert(payload);
    }

    const message = task?.type === 'algorithm' 
      ? 'Algorithm submitted for review' 
      : 'Task submitted successfully';

    res.json({ message, status: 'completed', submission_status: payload.submission_status || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

router.post('/tasks/:id/start', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { data: existing } = await supabase
      .from('task_submissions')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('student_id', req.user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from('task_submissions').insert({
        task_id: taskId,
        student_id: req.user.id,
        status: 'pending',
      });
    } else if (existing.status === 'not_started') {
      await supabase.from('task_submissions').update({ status: 'pending' }).eq('id', existing.id);
    }

    res.json({ message: 'Task started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start task' });
  }
});

router.get('/performance', async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from('task_submissions')
      .select(`
        status, task_id,
        task:tasks(difficulty, week_number, year)
      `)
      .eq('student_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });

    const weekMap = {};

    (submissions || []).forEach((s) => {
      if (!s.task) return;
      const key = `Week ${s.task.week_number} (${s.task.year})`;
      if (!weekMap[key]) weekMap[key] = { week: key, easy: 0, medium: 0, hard: 0, missed: 0 };

      if (s.status === 'completed') {
        weekMap[key][s.task.difficulty]++;
      } else {
        weekMap[key].missed++;
      }
    });

    const { weekNumber, year } = getCurrentWeek();
    const result = Object.values(weekMap);
    if (result.length === 0) {
      result.push({ week: `Week ${weekNumber} (${year})`, easy: 0, medium: 0, hard: 0, missed: 0 });
    }

    res.json(result.sort((a, b) => a.week.localeCompare(b.week)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

router.get('/tests', async (req, res) => {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('id, name, duration, test_date, is_active')
      .eq('is_active', true)
      .order('test_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const { data: attempts } = await supabase
      .from('test_attempts')
      .select('test_id, status')
      .eq('student_id', req.user.id);

    const attemptMap = Object.fromEntries((attempts || []).map((a) => [a.test_id, a.status]));

    res.json(
      (tests || []).map((t) => ({
        ...t,
        attempted: attemptMap[t.id] === 'submitted',
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

router.post('/tests/:id/start', async (req, res) => {
  try {
    const testId = req.params.id;

    const { data: test, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error || !test) return res.status(404).json({ error: 'Test not found' });

    const { data: questions } = await supabase
      .from('test_questions')
      .select('id, question, options, question_order')
      .eq('test_id', testId)
      .order('question_order');

    const { data: existing } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .eq('student_id', req.user.id)
      .maybeSingle();

    if (existing?.status === 'submitted') {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    let attempt = existing;
    if (!attempt) {
      const { data: newAttempt } = await supabase
        .from('test_attempts')
        .insert({
          test_id: testId,
          student_id: req.user.id,
          started_at: new Date().toISOString(),
          status: 'in_progress',
          answers: {},
        })
        .select()
        .single();
      attempt = newAttempt;
    }

    res.json({
      test: { id: test.id, name: test.name, duration: test.duration },
      questions: (questions || []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
      attempt,
      endTime: new Date(new Date(attempt.started_at).getTime() + test.duration * 60000).toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

router.post('/tests/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const testId = req.params.id;

    const { data: questions } = await supabase
      .from('test_questions')
      .select('id, correct_answer')
      .eq('test_id', testId);

    let score = 0;
    (questions || []).forEach((q) => {
      if (answers?.[q.id] === q.correct_answer) score++;
    });

    await supabase
      .from('test_attempts')
      .update({
        answers: answers || {},
        score,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('test_id', testId)
      .eq('student_id', req.user.id);

    res.json({ message: 'Test submitted', score, total: questions?.length || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { search, sort } = req.query;

    let query = supabase
      .from('users')
      .select('id, name, branch, profile_photo')
      .eq('role', 'student');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: students, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const { data: submissions } = await supabase
      .from('task_submissions')
      .select('student_id, status, task:tasks(difficulty)')
      .eq('status', 'completed');

    const scoreMap = {};
    (submissions || []).forEach((s) => {
      if (!scoreMap[s.student_id]) scoreMap[s.student_id] = { easy: 0, medium: 0, hard: 0, total: 0 };
      if (s.task?.difficulty) {
        scoreMap[s.student_id][s.task.difficulty]++;
        scoreMap[s.student_id].total++;
      }
    });

    let result = (students || []).map((s, i) => ({
      rank: i + 1,
      ...s,
      easy: scoreMap[s.id]?.easy || 0,
      medium: scoreMap[s.id]?.medium || 0,
      hard: scoreMap[s.id]?.hard || 0,
      total: scoreMap[s.id]?.total || 0,
    }));

    if (sort === 'easy') result.sort((a, b) => b.easy - a.easy);
    else if (sort === 'medium') result.sort((a, b) => b.medium - a.medium);
    else if (sort === 'hard') result.sort((a, b) => b.hard - a.hard);
    else result.sort((a, b) => b.total - a.total);

    result = result.map((s, i) => ({ ...s, rank: i + 1 }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
