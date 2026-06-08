import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';

const cards = [
  { title: 'Tasks', image: '/task.jpg', path: '/admin/tasks' },
  { title: 'Performance', image: '/performance.jpg', path: '/admin/performance' },
  { title: 'Tests', image: '/test.jpg', path: '/admin/tests' },
  { title: 'Leaderboard', image: '/leaderboard.jpg', path: '/admin/leaderboard' },
];

export default function AdminDashboard() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage tasks, tests, and monitor student progress</p>
      </div>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </Layout>
  );
}
