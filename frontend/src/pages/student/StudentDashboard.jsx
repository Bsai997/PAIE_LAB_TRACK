import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';

const cards = [
  { title: 'Tasks', image: '/task.jpg', path: '/student/tasks', description: 'Complete MCQ, coding, and error-finding tasks' },
  { title: 'Performance', image: '/performance.jpg', path: '/student/performance', description: 'Track your progress and improvements' },
  { title: 'Tests', image: '/test.jpg', path: '/student/tests', description: 'Take timed assessments and quizzes' },
  { title: 'Leaderboard', image: '/leaderboard.jpg', path: '/student/leaderboard', description: 'Compete and see your ranking' },
];

export default function StudentDashboard() {
  return (
    <Layout>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </Layout>
  );
}
