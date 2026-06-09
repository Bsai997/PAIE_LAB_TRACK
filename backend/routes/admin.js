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
    const { 
      title, 
      type, 
      difficulty, 
      deadline, 
      description,
      // Coding task fields
      practice_link,
      // MCQ task fields
      question,
      options,
      correct_answer,
      // Error task fields
      code,
      correct_line,
      // Algorithm task fields
      problem_statement,
      input_description,
      output_description,
      concept 
    } = req.body;

    if (!title || !type || !difficulty || !deadline) {
      return res.status(400).json({ error: 'Title, type, difficulty, and deadline are required' });
    }

<<<<<<< HEAD
    const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
    const toIsoDeadline = (value) => {
      const raw = String(value || '').trim();
      if (!raw) return null;
      const normalized = raw.includes('T') ? raw : `${raw}T23:59:59.000Z`;
      const parsed = new Date(normalized);
      if (Number.isNaN(parsed.getTime())) return null;
      return parsed.toISOString();
    };

    const normalizedDeadline = toIsoDeadline(deadline);
    if (!normalizedDeadline) {
      return res.status(400).json({ error: 'Invalid deadline format' });
=======
    // Validate type-specific required fields
    if (type === 'coding' && !practice_link) {
      return res.status(400).json({ error: 'practice_link is required for coding tasks' });
    }
    if (type === 'mcq' && (!question || !options || correct_answer === undefined)) {
      return res.status(400).json({ error: 'question, options, and correct_answer are required for MCQ tasks' });
    }
    if (type === 'error' && (!code || !correct_line)) {
      return res.status(400).json({ error: 'code and correct_line are required for error tasks' });
    }
    if (type === 'algorithm' && (!problem_statement || !input_description || !output_description)) {
      return res.status(400).json({ error: 'problem_statement, input_description, and output_description are required for algorithm tasks' });
>>>>>>> 1d8cbca7f558aea3370c17d1f98d95781533d1f5
    }

    const { weekNumber, year } = getCurrentWeek();

<<<<<<< HEAD
    const payload = {
      title,
      type,
      difficulty,
      deadline: normalizedDeadline,
      description: description || concept || '',
      created_by: isUuid(req.user.id) ? req.user.id : null,
      week_number: weekNumber,
      year,
    };

    if (type === 'coding') {
      payload.leetcode_link = leetcode_link || null;
    }

    if (type === 'mcq') {
      const questions = Array.isArray(mcq_data?.questions) ? mcq_data.questions : [];
      const firstQuestion = questions[0] || mcq_data || {};
      payload.mcq_data = {
        question: firstQuestion.question || '',
        options: Array.isArray(firstQuestion.options) ? firstQuestion.options : [],
        correct_answer: Number.isInteger(firstQuestion.correct_answer) ? firstQuestion.correct_answer : 0,
        questions,
      };
    }

    if (type === 'error') {
      payload.error_data = error_data || null;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(payload)
=======
    // Create the base task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title,
        type,
        difficulty,
        deadline,
        description: description || concept || '',
        created_by: req.user.id,
        week_number: weekNumber,
        year,
      })
>>>>>>> 1d8cbca7f558aea3370c17d1f98d95781533d1f5
      .select()
      .single();

    if (taskError) return res.status(500).json({ error: taskError.message });

    // Create type-specific record
    if (type === 'coding') {
      await supabase.from('coding_tasks').insert({
        task_id: task.id,
        practice_link,
      });
    } else if (type === 'mcq') {
      await supabase.from('mcq_tasks').insert({
        task_id: task.id,
        question,
        options,
        correct_answer: parseInt(correct_answer, 10),
      });
    } else if (type === 'error') {
      await supabase.from('error_tasks').insert({
        task_id: task.id,
        code,
        correct_line: parseInt(correct_line, 10),
      });
    } else if (type === 'algorithm') {
      await supabase.from('algorithm_tasks').insert({
        task_id: task.id,
        problem_statement,
        input_description,
        output_description,
      });
    }

    // Assign to all students
    const { data: students } = await supabase.from('users').select('id').eq('role', 'student');

    if (students?.length) {
      const assignments = students.map((s) => ({
        task_id: task.id,
        student_id: s.id,
        status: 'not_started',
      }));
      await supabase.from('task_submissions').insert(assignments);
    }

    res.status(201).json({ ...task, message: `${type} task created successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to create task' });
  }
});

router.get('/tasks/:id/students', async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();
    const studentIds = [];

    // OPTIMIZED: First query - get submissions for this task
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        status,
        student_id,
        student:users!task_submissions_student_id_fkey(id, name, branch)
      `)
      .eq('task_id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });

    // Collect student IDs
    (data || []).forEach((d) => {
      if (d.student_id) studentIds.push(d.student_id);
    });

    // OPTIMIZED: Second query - use COUNT in aggregate instead of fetching all records
    const { data: weekSubs } = await supabase
      .from('task_submissions')
      .select('student_id')
      .eq('status', 'completed')
      .in('student_id', studentIds.length ? studentIds : ['00000000-0000-0000-0000-000000000000'])
      .in(
        'task_id',
        (await supabase.from('tasks').select('id').eq('week_number', weekNumber).eq('year', year)).data?.map((t) => t.id) || []
      );

    const solvedMap = {};
    (weekSubs || []).forEach((s) => {
      solvedMap[s.student_id] = (solvedMap[s.student_id] || 0) + 1;
    });

    res.json(
      (data || []).map((d) => ({
        id: d.student?.id,
        name: d.student?.name,
        branch: d.student?.branch,
        questions_solved: solvedMap[d.student_id] || 0,
        status: d.status,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get algorithm task submissions for review
router.get('/algorithm/:taskId/submissions', async (req, res) => {
  try {
    const { data: submissions, error } = await supabase
      .from('task_submissions')
      .select(`
        id,
        student_id,
        submission_status,
        admin_feedback,
        answer,
        submitted_at,
        student:users!task_submissions_student_id_fkey(id, name, branch)
      `)
      .eq('task_id', req.params.taskId);

    if (error) return res.status(500).json({ error: error.message });

    const { data: algorithmTask } = await supabase
      .from('algorithm_tasks')
      .select('*')
      .eq('task_id', req.params.taskId)
      .single();

    const { data: baseTask } = await supabase
      .from('tasks')
      .select('title, description')
      .eq('id', req.params.taskId)
      .single();

    res.json({
      task: baseTask,
      algorithm: algorithmTask,
      submissions: submissions || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch algorithm submissions' });
  }
});

// Review algorithm submission (accept/reject)
router.post('/algorithm/submissions/:submissionId/review', async (req, res) => {
  try {
    const { status, feedback } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
    }

    const { error } = await supabase
      .from('task_submissions')
      .update({
        submission_status: status,
        admin_feedback: feedback || null,
      })
      .eq('id', req.params.submissionId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: `Submission ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to review submission' });
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
    const { weekNumber, year } = getCurrentWeek();

    // OPTIMIZED: Single efficient query with aggregation at DB level
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        branch,
        subs:task_submissions(
          status,
          task:tasks!inner(week_number, year)
        )
      `)
      .eq('role', 'student')
      .eq('subs.task.week_number', weekNumber)
      .eq('subs.task.year', year);

    if (error) return res.status(500).json({ error: error.message });

    const result = (data || []).map((s) => {
      const subs = s.subs || [];
      const completed = subs.filter((sub) => sub.status === 'completed').length;
      const notCompleted = subs.filter((sub) => sub.status === 'pending' || sub.status === 'not_started').length;

      return {
        id: s.id,
        name: s.name,
        branch: s.branch,
        completed,
        not_completed: notCompleted,
        total_assigned: subs.length,
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
