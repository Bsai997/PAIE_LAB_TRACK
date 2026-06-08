import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const dash =
      user.role === 'student'
        ? '/student'
        : user.role === 'admin'
          ? '/admin'
          : '/superadmin';
    return <Navigate to={dash} replace />;
  }

  return children;
}
