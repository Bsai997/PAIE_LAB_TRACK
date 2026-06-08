import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';

const cards = [
  { title: 'Tasks', image: '/task.jpg', path: '/admin/tasks', description: 'Monitor every task across the program' },
  { title: 'Performance', image: '/performance.jpg', path: '/admin/performance', description: 'Analyze student progress and results' },
  { title: 'Tests', image: '/test.jpg', path: '/admin/tests', description: 'Configure and oversee assessments' },
  { title: 'Leaderboard', image: '/leaderboard.jpg', path: '/admin/leaderboard', description: 'View student rankings and scores' },
];

export default function AdminDashboard() {
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
