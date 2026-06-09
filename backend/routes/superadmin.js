import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../utils/mailer.js';
import { getCurrentWeek } from '../utils/week.js';

const router = express.Router();
router.use(authenticate, authorize('super_admin'));

router.get('/admins', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase
      .from('users')
      .select('id, name, branch, profile_photo, skills')
      .eq('role', 'admin');

    if (search) query = query.ilike('name', `%${search}%`);

    const { data: admins, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const { data: tasks } = await supabase
      .from('tasks')
      .select('created_by, difficulty');

    const contribMap = {};
    (tasks || []).forEach((t) => {
      if (!contribMap[t.created_by]) contribMap[t.created_by] = { easy: 0, medium: 0, hard: 0 };
      contribMap[t.created_by][t.difficulty]++;
    });

    res.json(
      (admins || []).map((a) => ({
        ...a,
        contribution: contribMap[a.id] || { easy: 0, medium: 0, hard: 0 },
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase
      .from('users')
      .select('id, name, branch, profile_photo')
      .eq('role', 'student');

    if (search) query = query.ilike('name', `%${search}%`);

    const { data: students, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const { data: subs } = await supabase
      .from('task_submissions')
      .select('student_id, status, task:tasks(difficulty)')
      .eq('status', 'completed');

    const scoreMap = {};
    (subs || []).forEach((s) => {
      if (!scoreMap[s.student_id]) scoreMap[s.student_id] = { easy: 0, medium: 0, hard: 0 };
      if (s.task?.difficulty) scoreMap[s.student_id][s.task.difficulty]++;
    });

    res.json(
      (students || []).map((s) => ({
        ...s,
        solved: scoreMap[s.id] || { easy: 0, medium: 0, hard: 0 },
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/students/:id/performance', async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from('users')
      .select('id, name, branch, profile_photo')
      .eq('id', req.params.id)
      .single();

    if (error || !student) return res.status(404).json({ error: 'Student not found' });

    const { data: subs } = await supabase
      .from('task_submissions')
      .select('status, task:tasks(difficulty, week_number, year)')
      .eq('student_id', req.params.id);

    const { data: allTasks } = await supabase.from('tasks').select('difficulty, week_number, year');

    const weekMap = {};
    (allTasks || []).forEach((t) => {
      const key = `Week ${t.week_number}`;
      if (!weekMap[key]) {
        weekMap[key] = { week: key, easy_solved: 0, medium_solved: 0, hard_solved: 0, assigned: 0, not_submitted: 0 };
      }
      weekMap[key].assigned++;
    });

    (subs || []).forEach((s) => {
      if (!s.task) return;
      const key = `Week ${s.task.week_number}`;
      if (!weekMap[key]) {
        weekMap[key] = { week: key, easy_solved: 0, medium_solved: 0, hard_solved: 0, assigned: 0, not_submitted: 0 };
      }
      if (s.status === 'completed') {
        weekMap[key][`${s.task.difficulty}_solved`]++;
      } else {
        weekMap[key].not_submitted++;
      }
    });

    const totalSolved = (subs || []).filter((s) => s.status === 'completed').length;
    const totalAssigned = (allTasks || []).length;
    const progress = totalAssigned ? Math.round((totalSolved / totalAssigned) * 100) : 0;

    res.json({
      student,
      progress,
      weekly: Object.values(weekMap),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id, title, difficulty, deadline, type,
        created_by_user:users!tasks_created_by_fkey(name),
        submissions:task_submissions(id, status, student_id)
      `)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      (tasks || []).map((t) => ({
        id: t.id,
        title: t.title,
        difficulty: t.difficulty,
        deadline: t.deadline,
        type: t.type,
        created_by: t.created_by_user?.name || 'Admin',
        total_submissions: (t.submissions || []).filter((s) => s.status === 'completed').length,
        students_assigned: (t.submissions || []).length,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
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

    res.json(
      (data || []).map((d) => ({
        id: d.student?.id,
        name: d.student?.name,
        branch: d.student?.branch,
        status: d.status,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.post('/members', async (req, res) => {
  try {
    const { name, branch, clubmail, originalmail, password, role, skills } = req.body;

    if (!name || !clubmail || !originalmail || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('regdid', clubmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'Registration ID already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        branch: branch || '',
        clubmail,
        originalmail,
        regdid: clubmail,
        password_hash,
        role,
        skills: skills || '',
        profile_photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f5c3a&color=fff`,
      })
      .select('id, name, role, clubmail')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const emailResult = await sendWelcomeEmail({ originalmail, name, clubmail, password });

    res.status(201).json({
      user,
      email: emailResult,
      message: emailResult.sent
        ? 'Member created and welcome email sent successfully'
        : `Member created (Email: ${emailResult.error || 'Preview mode - SMTP not configured'})`,
    });
  } catch (err) {
    console.error('[Create Member Error]', err);
    res.status(500).json({ error: err.message || 'Failed to create member' });
  }
});

router.get('/tests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('id, name, duration, test_date, is_active')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

router.post('/tests', async (req, res) => {
  try {
    const { name, duration, test_date } = req.body;
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

export default router;
