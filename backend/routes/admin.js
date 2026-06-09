import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getCurrentWeek } from '../utils/week.js';

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/tasks', async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id, title, type, difficulty, deadline, description,
        created_by_user:users!tasks_created_by_fkey(name),
        submissions:task_submissions(id, status)
      `)
      .eq('week_number', weekNumber)
      .eq('year', year)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const result = (tasks || []).map((t) => ({
      id: t.id,
      title: t.title,
      type: t.type,
      difficulty: t.difficulty,
      deadline: t.deadline,
      description: t.description,
      created_by: t.created_by_user?.name || 'Admin',
      total_submissions: (t.submissions || []).filter((s) => s.status === 'completed').length,
      total_assigned: (t.submissions || []).length,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, type, difficulty, deadline, description, leetcode_link, mcq_data, error_data, concept } =
      req.body;

    if (!title || !type || !difficulty || !deadline) {
      return res.status(400).json({ error: 'Title, type, difficulty, and deadline are required' });
    }

    const { weekNumber, year } = getCurrentWeek();

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        type,
        difficulty,
        deadline,
        description: description || concept || '',
        leetcode_link: leetcode_link || null,
        mcq_data: mcq_data || null,
        error_data: error_data || null,
        created_by: req.user.id,
        week_number: weekNumber,
        year,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const { data: students } = await supabase.from('users').select('id').eq('role', 'student');

    if (students?.length) {
      const assignments = students.map((s) => ({
        task_id: task.id,
        student_id: s.id,
        status: 'not_started',
      }));
      await supabase.from('task_submissions').insert(assignments);
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.get('/tasks/:id/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        status,
        student:users!task_submissions_student_id_fkey(id, name, branch)
      `)
      .eq('task_id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });

    const { weekNumber, year } = getCurrentWeek();
    const { data: weekSubs } = await supabase
      .from('task_submissions')
      .select('student_id, status, task:tasks(difficulty, week_number, year)')
      .eq('status', 'completed');

    const solvedMap = {};
    (weekSubs || []).forEach((s) => {
      if (s.task?.week_number === weekNumber && s.task?.year === year) {
        if (!solvedMap[s.student_id]) solvedMap[s.student_id] = 0;
        solvedMap[s.student_id]++;
      }
    });

    res.json(
      (data || []).map((d) => ({
        id: d.student?.id,
        name: d.student?.name,
        branch: d.student?.branch,
        questions_solved: solvedMap[d.student?.id] || 0,
        status: d.status,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/tasks/stats', async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('week_number', weekNumber)
      .eq('year', year);

    const taskIds = (tasks || []).map((t) => t.id);
    if (!taskIds.length) return res.json({ completed_count: 0 });

    const { data: subs } = await supabase
      .from('task_submissions')
      .select('student_id, status')
      .in('task_id', taskIds)
      .eq('status', 'completed');

    const uniqueStudents = new Set((subs || []).map((s) => s.student_id));
    res.json({ completed_count: uniqueStudents.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/performance', async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('users')
      .select('id, name, branch')
      .eq('role', 'student');

    if (error) return res.status(500).json({ error: error.message });

    const { weekNumber, year } = getCurrentWeek();

    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('week_number', weekNumber)
      .eq('year', year);

    const taskIds = (tasks || []).map((t) => t.id);

    const { data: subs } = await supabase
      .from('task_submissions')
      .select('student_id, status, task_id')
      .in('task_id', taskIds.length ? taskIds : ['00000000-0000-0000-0000-000000000000']);

    const result = (students || []).map((s) => {
      const studentSubs = (subs || []).filter((sub) => sub.student_id === s.id);
      const completed = studentSubs.filter((sub) => sub.status === 'completed').length;
      const notCompleted = studentSubs.filter(
        (sub) => sub.status === 'pending' || sub.status === 'not_started'
      ).length;
      return {
        ...s,
        completed,
        not_completed: notCompleted,
        total_assigned: studentSubs.length,
      };
    });

    res.json(result);
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
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(tests || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

router.post('/tests', async (req, res) => {
  try {
    const { name, duration, test_date } = req.body;
    if (!name || !duration) {
      return res.status(400).json({ error: 'Name and duration are required' });
    }

    const { data: test, error } = await supabase
      .from('tests')
      .insert({
        name,
        duration: parseInt(duration, 10),
        test_date: test_date || new Date().toISOString(),
        created_by: req.user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(test);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

router.post('/tests/:id/questions', async (req, res) => {
  try {
    const { question, options, correct_answer } = req.body;
    if (!question || !options?.length) {
      return res.status(400).json({ error: 'Question and options are required' });
    }

    const { count } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', req.params.id);

    const { data, error } = await supabase
      .from('test_questions')
      .insert({
        test_id: req.params.id,
        question,
        options,
        correct_answer: correct_answer ?? 0,
        question_order: (count || 0) + 1,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

router.get('/tests/:id/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', req.params.id)
      .order('question_order');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { search, sort } = req.query;

    let query = supabase
      .from('users')
      .select('id, name, branch, profile_photo')
      .eq('role', 'student');

    if (search) query = query.ilike('name', `%${search}%`);

    const { data: students, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const { data: submissions } = await supabase
      .from('task_submissions')
      .select('student_id, task:tasks(difficulty)')
      .eq('status', 'completed');

    const scoreMap = {};
    (submissions || []).forEach((s) => {
      if (!scoreMap[s.student_id]) scoreMap[s.student_id] = { easy: 0, medium: 0, hard: 0, total: 0 };
      if (s.task?.difficulty) {
        scoreMap[s.student_id][s.task.difficulty]++;
        scoreMap[s.student_id].total++;
      }
    });

    let result = (students || []).map((s) => ({
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
