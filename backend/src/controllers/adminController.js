import supabase from '../utils/supabase.js';
import { getCurrentWeekNumber } from '../utils/cron.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const currentWeek = getCurrentWeekNumber();

    // Get this week's stats
    const { data: assignments } = await supabase
      .from('taskassignments')
      .select('status')
      .gte('created_at', getWeekStartDate(currentWeek));

    const allCompleted = assignments?.filter(s => s.status === 'completed').length || 0;
    const notStarted = assignments?.filter(s => s.status === 'not_started').length || 0;
    const notSubmitted = assignments?.filter(s => s.status === 'not_started').length || 0;

    res.json({
      weekStats: { allCompleted, notStarted, notSubmitted },
      message: 'Admin dashboard data'
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, type, difficulty, deadline, description, conceptOrOptions } = req.body;
    const adminId = req.user.id;
    const currentWeek = getCurrentWeekNumber();

    // Insert task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title,
        type,
        difficulty,
        deadline,
        description,
        created_by: adminId,
        week_number: currentWeek
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // Handle type-specific data
    if (type === 'mcq' && conceptOrOptions.options) {
      const options = conceptOrOptions.options.map((opt, idx) => ({
        task_id: task.id,
        option_text: opt.text,
        is_correct: opt.isCorrect
      }));

      const { error: optError } = await supabase
        .from('mcqoptions')
        .insert(options);

      if (optError) throw optError;
    } else if (type === 'coding' && conceptOrOptions.leetcodeLink) {
      const { error: codingError } = await supabase
        .from('codingtasks')
        .insert({
          task_id: task.id,
          concept: conceptOrOptions.concept,
          leetcode_link: conceptOrOptions.leetcodeLink
        });

      if (codingError) throw codingError;
    }

    res.json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminTasks = async (req, res) => {
  try {
    const currentWeek = getCurrentWeekNumber();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignments:TaskAssignments(status)
      `)
      .eq('week_number', currentWeek);

    if (error) throw error;

    res.json({ tasks });
  } catch (error) {
    console.error('Get admin tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTaskStudents = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data: students, error } = await supabase
      .from('taskassignments')
      .select(`
        status,
        student:Users(id, name, department)
      `)
      .eq('task_id', taskId);

    if (error) throw error;

    res.json({ students });
  } catch (error) {
    console.error('Get task students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminPerformance = async (req, res) => {
  try {
    // Get weekly student completions
    const { data: weeklyStats } = await supabase
      .from('weeklystats')
      .select('*')
      .order('week_number', { ascending: false });

    // Get all students
    const { data: students } = await supabase
      .from('Users')
      .select(`
        id,
        name,
        department,
        assignments:TaskAssignments(status)
      `)
      .eq('role', 'student');

    res.json({ weeklyStats, students });
  } catch (error) {
    console.error('Admin performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTest = async (req, res) => {
  try {
    const { name, duration, date } = req.body;
    const adminId = req.user.id;

    const { data: test, error } = await supabase
      .from('tests')
      .insert({
        name,
        duration,
        date,
        created_by: adminId
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Test created', test });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addTestQuestion = async (req, res) => {
  try {
    const { testId } = req.params;
    const { question, options, correctAnswer, type, leetcodeLink } = req.body;

    const { data: testQuestion, error } = await supabase
      .from('testquestions')
      .insert({
        test_id: testId,
        question,
        options,
        correct_answer: correctAnswer,
        type,
        leetcode_link: leetcodeLink
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Question added', testQuestion });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function getWeekStartDate(weekNumber) {
  const start = new Date('2026-01-01');
  const weekStart = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  return weekStart.toISOString();
}
