import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const lastValidated = localStorage.getItem('token_validated_at');
    const now = Date.now();

    // OPTIMIZED: Only re-validate every 30 minutes if token hasn't changed
    if (token && lastValidated && now - parseInt(lastValidated) < 30 * 60 * 1000) {
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        localStorage.setItem('token_validated_at', now.toString());
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_validated_at');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (regdid, password) => {
    const res = await api.post('/auth/login', { regdid, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
