import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/assets/logo.png" alt="Logo" className="logo" />
        <span className="platform-name">PAIE CODERS</span>
      </div>
      <div className="navbar-right">
        <div className="user-info">
          <span className="user-name">{user?.userData?.name || 'User'}</span>
          <span className="user-role">({user?.role})</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
        <img src="/assets/profile.png" alt="Profile" className="profile-icon" />
      </div>
    </nav>
  );
}
