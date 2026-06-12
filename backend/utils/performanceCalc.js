// Shared utility to eliminate duplicate performance calculation logic across 3 endpoints
import { supabase } from '../config/supabase.js';

export async function calculatePerformanceStats(studentId) {
  const { data: submissions, error } = await supabase
    .from('task_submissions')
    .select(`
      status,
      task:tasks(difficulty, week_number, year)
    `)
    .eq('student_id', studentId);

  if (error) throw error;

  const weekMap = {};
  (submissions || []).forEach((s) => {
    if (!s.task) return;
    const key = `Week ${s.task.week_number} (${s.task.year})`;

    if (!weekMap[key]) {
      weekMap[key] = {
        week: key,
        easy: 0,
        medium: 0,
        hard: 0,
        missed: 0,
      };
    }

    if (s.status === 'completed') {
      weekMap[key][s.task.difficulty]++;
    } else {
      weekMap[key].missed++;
    }
  });

  return Object.values(weekMap);
}

export function createIdMap(items, keyField, valueField) {
  return Object.fromEntries((items || []).map((item) => [item[keyField], item[valueField]]));
}
