import { useNavigate } from 'react-router-dom';

export default function DashboardCard({ title, image, path, description }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <img src={image} alt={title} className="dashboard-card-icon" />
      </div>
      <div className="dashboard-card-content">
        <h3 className="dashboard-card-title">{title}</h3>
        {description && <p className="dashboard-card-description">{description}</p>}
      </div>
      <button 
        className="btn btn-primary dashboard-card-btn"
        onClick={() => navigate(path)}
      >
        {title}
      </button>
    </div>
  );
}
