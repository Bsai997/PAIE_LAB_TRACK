export default function StatCard({ label, value, color = '#4CAF50' }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
