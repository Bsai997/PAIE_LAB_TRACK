import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [regdid, setRegdid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(regdid, password);
      // console.log(user)
      if (user.role === 'student') navigate('/student');
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'super_admin') navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <span className="login-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
            <path d="M20 21C20 17.6863 16.4183 15 12 15C7.58172 15 4 17.6863 4 21" />
          </svg>
        </span>
        <div className="login-header">
          <h1 className="login-title">PAIE Cell</h1>
          <p>Sign in with your registration ID to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="regdid">Registration ID</label>
            <input
              id="regdid"
              type="text"
              value={regdid}
              onChange={(e) => setRegdid(e.target.value)}
              placeholder="e.g. 22BCE7421"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn login-submit btn-block" disabled={loading}>
            {loading ? 'Signing in' : 'Sign in'}
          </button>
        </form>
        <p className="login-footer">Don't have credentials? Contact your program admin.</p>
      </div>
    </div>
  );
}
