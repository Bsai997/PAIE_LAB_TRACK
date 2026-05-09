export default function TestCard({ test, onJoin }) {
  const testDate = new Date(test.date);
  const isUpcoming = testDate > new Date();

  return (
    <div className="test-card">
      <div className="test-header">
        <h3>{test.name}</h3>
        <span className={`test-status ${isUpcoming ? 'upcoming' : 'ongoing'}`}>
          {isUpcoming ? 'Upcoming' : 'Ongoing'}
        </span>
      </div>
      <div className="test-details">
        <p><strong>Duration:</strong> {test.duration} minutes</p>
        <p><strong>Date:</strong> {testDate.toLocaleDateString()} at {testDate.toLocaleTimeString()}</p>
      </div>
      <button 
        className="btn btn-primary" 
        onClick={() => onJoin(test.id)}
        disabled={isUpcoming}
      >
        {isUpcoming ? 'Coming Soon' : 'Join Test'}
      </button>
    </div>
  );
}
