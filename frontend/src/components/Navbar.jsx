import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <img src="https://ui-avatars.com/api/?name=PAIE&background=1f5c3a&color=fff&size=40" alt="Logo" />
        <span>PAIE Cell</span>
      </div>
      <div className="navbar-right">
        <div className="profile-menu" ref={menuRef}>
          <img
            src={user?.profile_photo || `https://ui-avatars.com/api/?name=${user?.name}&background=1f5c3a&color=fff`}
            alt="Profile"
            className="profile-icon"
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: 'pointer' }}
          />
          {showMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <div className="dropdown-label">Email</div>
                <div className="dropdown-value">{user?.clubmail || user?.originalmail}</div>
              </div>
              <div className="dropdown-item">
                <div className="dropdown-label">Role</div>
                <div className="dropdown-value capitalize">{user?.role?.replace('_', ' ')}</div>
              </div>
              <button className="btn btn-primary btn-sm dropdown-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
