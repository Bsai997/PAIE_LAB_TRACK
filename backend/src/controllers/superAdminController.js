import supabase from '../utils/supabase.js';
import bcrypt from 'bcrypt';
import { getCurrentWeekNumber } from '../utils/cron.js';

export const getSuperAdminDashboard = async (req, res) => {
  try {
    res.json({ message: 'Super Admin dashboard' });
  } catch (error) {
    console.error('Super admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminList = async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from('Users')
      .select('id, name, email, department')
      .eq('role', 'admin');

    if (error) throw error;

    // Get contribution counts for each admin
    const adminsWithContribution = await Promise.all(
      admins.map(async (admin) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('difficulty')
          .eq('created_by', admin.id);

        const contribution = {
          easy: tasks?.filter(t => t.difficulty === 'easy').length || 0,
          medium: tasks?.filter(t => t.difficulty === 'medium').length || 0,
          hard: tasks?.filter(t => t.difficulty === 'hard').length || 0
        };

        return { ...admin, contribution };
      })
    );

    res.json({ admins: adminsWithContribution });
  } catch (error) {
    console.error('Get admin list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, regdid, email, password, branch } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: admin, error } = await supabase
      .from('users')
      .insert({
        name,
        regdid,
        email,
        password_hash: hashedPassword,
        role: 'admin',
        department: branch
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Admin created successfully', admin });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentList = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('Users')
      .select('id, name, email, department')
      .eq('role', 'student');

    if (error) throw error;

    res.json({ students });
  } catch (error) {
    console.error('Get student list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const { data: student } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single();

    const { data: assignments } = await supabase
      .from('taskassignments')
      .select(`
        *,
        task:Tasks(difficulty, week_number)
      `)
      .eq('student_id', studentId);

    // Calculate weekly stats
    const weeklyStats = {};
    assignments?.forEach(assignment => {
      const week = assignment.task.week_number;
      if (!weeklyStats[week]) {
        weeklyStats[week] = { easy: 0, medium: 0, hard: 0, notCompleted: 0, total: 0 };
      }
      weeklyStats[week].total++;
      if (assignment.status === 'completed') {
        weeklyStats[week][assignment.task.difficulty]++;
      } else {
        weeklyStats[week].notCompleted++;
      }
    });

    res.json({ student, weeklyStats });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        created_by_user:Users(name),
        assignments:TaskAssignments(status)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tasksWithStats = tasks.map(task => ({
      ...task,
      totalSubmissions: task.assignments?.length || 0,
      completed: task.assignments?.filter(a => a.status === 'completed').length || 0
    }));

    res.json({ tasks: tasksWithStats });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTaskStudents = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.query;

    let query = supabase
      .from('taskassignments')
      .select(`
        status,
        student:Users(id, name, department)
      `)
      .eq('task_id', taskId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: students, error } = await query;

    if (error) throw error;

    res.json({ students });
  } catch (error) {
    console.error('Get task students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTest = async (req, res) => {
  try {
    const { name, duration, date } = req.body;
    const superAdminId = req.user.id;

    const { data: test, error } = await supabase
      .from('tests')
      .insert({
        name,
        duration,
        date,
        created_by: superAdminId
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
