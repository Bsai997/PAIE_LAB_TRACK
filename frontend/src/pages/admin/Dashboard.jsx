import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import DashboardCard from '../../components/DashboardCard';
import '../../styles/dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    { id: 1, image: '/assets/tasks.jpg', text: 'Tasks', route: 'tasks' },
    { id: 2, image: '/assets/performance.jpg', text: 'Performance', route: 'performance' },
    { id: 3, image: '/assets/tests.jpg', text: 'Tests', route: 'tests' },
    { id: 4, image: '/assets/leaderboard.jpg', text: 'Leaderboard', route: 'leaderboard' }
  ];

  const handleCardClick = (route) => {
    navigate(`/admin/${route}`);
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h2>Admin Dashboard</h2>
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
