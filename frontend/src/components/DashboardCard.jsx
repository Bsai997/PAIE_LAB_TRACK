import '../styles/dashboard.css';

export default function DashboardCard({ image, text, onClick }) {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <div className="card-image">
        <img src={image} alt={text} />
      </div>
      <button className="card-button">{text}</button>
    </div>
  );
}
