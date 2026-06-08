import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <img src="https://ui-avatars.com/api/?name=PAIE&background=6366f1&color=fff&size=40" alt="Logo" />
        <span>PAIE Cell</span>
      </div>
      <div className="navbar-right">
        <div className="profile-menu">
          <img
            src={user?.profile_photo || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
            alt="Profile"
            className="profile-icon"
          />
          <span className="profile-name">{user?.name}</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
