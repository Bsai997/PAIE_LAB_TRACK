import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';

const cards = [
  { title: 'Admin', image: '/admin.jpg', path: '/superadmin/admins' },
  { title: 'Student', image: '/student.jpg', path: '/superadmin/students' },
  { title: 'Test', image: '/test.jpg', path: '/superadmin/tests' },
  { title: 'Task', image: '/task.jpg', path: '/superadmin/tasks' },
];

export default function SuperAdminDashboard() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Super Admin Dashboard</h1>
        <p>System-level controls and monitoring</p>
      </div>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </Layout>
  );
}
