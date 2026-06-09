import Layout from '../../components/Layout';
import DashboardCard from '../../components/DashboardCard';
import { useNavigate } from 'react-router-dom';

const cards = [
  { title: 'Admins', image: '/admin.jpg', path: '/superadmin/admins', description: 'Manage admin members and their contributions' },
  { title: 'Students', image: '/student.jpg', path: '/superadmin/students', description: 'View student rosters and individual performance' },
  { title: 'Tests', image: '/test.jpg', path: '/superadmin/tests', description: 'Configure and oversee assessments' },
  { title: 'Tasks', image: '/task.jpg', path: '/superadmin/tasks', description: 'Monitor every task across the program' },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="page-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </Layout>
  );
}
