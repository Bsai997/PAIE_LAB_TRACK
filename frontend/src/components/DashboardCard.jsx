import { useNavigate } from 'react-router-dom';

export default function DashboardCard({ title, image, path }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card" onClick={() => navigate(path)}>
      <img src={image} alt={title} className="dashboard-card-img" />
      <button className="btn btn-primary dashboard-card-btn">{title}</button>
    </div>
  );
}
