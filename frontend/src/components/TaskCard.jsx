export default function TaskCard({ task, onStart, onViewDetails }) {
  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className={`badge badge-${task.status}`}>{task.status}</span>
      </div>
      <div className="task-details">
        <p><strong>Type:</strong> {task.type}</p>
        <p><strong>Difficulty:</strong> <span className={`difficulty ${task.difficulty}`}>{task.difficulty}</span></p>
        <p><strong>Due Date:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
        <p><strong>Created by:</strong> {task.created_by_user?.name || 'Admin'}</p>
      </div>
      <div className="task-actions">
        {task.status === 'not_started' && <button className="btn btn-primary" onClick={() => onStart(task.id)}>Start</button>}
        <button className="btn btn-secondary" onClick={() => onViewDetails(task.id)}>View Details</button>
      </div>
    </div>
  );
}
