import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';

const cards = [
  { title: 'Tasks', image: '/task.jpg', path: '/student/tasks' },
  { title: 'Performance', image: '/performance.jpg', path: '/student/performance' },
  { title: 'Tests', image: '/test.jpg', path: '/student/tests' },
  { title: 'Leaderboard', image: '/leaderboard.jpg', path: '/student/leaderboard' },
];

export default function StudentDashboard() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <p>Welcome! Choose a section below.</p>
      </div>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </Layout>
  );
}
