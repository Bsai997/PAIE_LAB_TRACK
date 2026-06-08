import Layout from '../components/Layout';

export default function DashboardCards({ cards }) {
  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Select a section to get started</p>
      </div>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div key={card.title} className="dashboard-card" onClick={() => (window.location.href = card.path)}>
            <img src={card.image} alt={card.title} className="dashboard-card-img" />
            <button className="btn btn-primary dashboard-card-btn">{card.title}</button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
