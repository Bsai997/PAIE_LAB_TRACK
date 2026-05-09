import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import '../../styles/dashboard.css';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    { id: 1, image: '/assets/admin.jpg', text: 'Admins', route: 'admins' },
    { id: 2, image: '/assets/student.jpg', text: 'Students', route: 'students' },
    { id: 3, image: '/assets/test.jpg', text: 'Tests', route: 'tests' },
    { id: 4, image: '/assets/task.jpg', text: 'Tasks', route: 'tasks' }
  ];

  const handleCardClick = (route) => {
    navigate(`/superadmin/${route}`);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>Super Admin Dashboard</h2>
        <div className="dashboard-grid">
          {cards.map(card => (
            <DashboardCard
              key={card.id}
              image={card.image}
              text={card.text}
              onClick={() => handleCardClick(card.route)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
