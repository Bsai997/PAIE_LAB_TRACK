import cron from 'node-cron';
import supabase from './supabase.js';

export const scheduleCleanup = () => {
  // Every Sunday at midnight - archives old tasks and saves stats
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log('Running weekly cleanup job...');
      const currentWeek = getCurrentWeekNumber();
      const weekToDelete = currentWeek - 5;

      if (weekToDelete > 0) {
        // Archive stats before deleting
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('week_number', weekToDelete);

        if (tasks && tasks.length > 0) {
          // Save to WeeklyStats
          for (const task of tasks) {
            const { data: submissions } = await supabase
              .from('taskassignments')
              .select('*')
              .eq('task_id', task.id);

            const completed = submissions?.filter(s => s.status === 'completed').length || 0;
            
            await supabase
              .from('weeklystats')
              .insert({
                week_number: weekToDelete,
                task_id: task.id,
                total_completions: completed,
              });
          }

          // Delete old tasks
          await supabase
            .from('tasks')
            .delete()
            .eq('week_number', weekToDelete);

          console.log(`Archived and deleted tasks from week ${weekToDelete}`);
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });

  console.log('Cleanup cron job scheduled');
};

export function getCurrentWeekNumber() {
  const start = new Date('2026-01-01');
  const now = new Date();
  const diff = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  return diff + 1;
}
