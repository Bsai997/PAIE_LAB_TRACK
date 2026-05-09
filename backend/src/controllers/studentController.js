import supabase from '../utils/supabase.js';
import { getCurrentWeekNumber } from '../utils/cron.js';

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentWeek = getCurrentWeekNumber();

    // Get week stats
    const { data: weekStats } = await supabase
      .from('taskassignments')
      .select('status')
      .eq('student_id', userId)
      .gte('created_at', getWeekStartDate(currentWeek));

    const submitted = weekStats?.filter(s => s.status === 'completed').length || 0;
    const pending = weekStats?.filter(s => s.status === 'pending').length || 0;
    const notSubmitted = weekStats?.filter(s => s.status === 'not_started').length || 0;

    res.json({
      weekStats: { submitted, pending, notSubmitted },
      message: 'Dashboard data retrieved'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentWeek = getCurrentWeekNumber();

    // Get tasks for current week
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        created_by_user:Users(name),
        assignments:TaskAssignments(status)
      `)
      .eq('week_number', currentWeek);

    if (error) throw error;

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const startTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Update assignment status to pending
    const { data, error } = await supabase
      .from('taskassignments')
      .update({ status: 'pending', started_at: new Date() })
      .eq('task_id', taskId)
      .eq('student_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Task started', assignment: data });
  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    // Update assignment status to completed
    const { data, error } = await supabase
      .from('taskassignments')
      .update({ 
        status: 'completed', 
        submitted_at: new Date(),
        answer: answer 
      })
      .eq('task_id', taskId)
      .eq('student_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Task submitted successfully', assignment: data });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all submissions
    const { data: allSubmissions } = await supabase
      .from('taskassignments')
      .select('*')
      .eq('student_id', userId);

    const totalCompleted = allSubmissions?.filter(s => s.status === 'completed').length || 0;
    const totalNotSubmitted = allSubmissions?.filter(s => s.status === 'not_started').length || 0;

    // Get weekly breakdown
    const { data: weeklyData } = await supabase
      .from('tasks')
      .select(`
        week_number,
        difficulty,
        assignments:TaskAssignments(status)
      `)
      .eq('assignments.student_id', userId);

    res.json({
      totalCompleted,
      totalNotSubmitted,
      weeklyBreakdown: weeklyData || []
    });
  } catch (error) {
    console.error('Performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTests = async (req, res) => {
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    res.json({ tests });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { search, sort } = req.query;

    let query = supabase
      .from('Users')
      .select(`
        id,
        name,
        department,
        score:TestSubmissions(score)
      `)
      .eq('role', 'student');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

function getWeekStartDate(weekNumber) {
  const start = new Date('2026-01-01');
  const weekStart = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  return weekStart.toISOString();
}
