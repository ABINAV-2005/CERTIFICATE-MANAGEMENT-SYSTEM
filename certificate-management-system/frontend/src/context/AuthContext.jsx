import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const getReadableAuthError = (err, fallbackMessage) => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.code === 'ECONNABORTED') return 'Server timeout. Please try again.';
    if (err?.message === 'Network Error') {
      return 'Cannot reach backend. Check server status and API URL.';
    }
    return fallbackMessage;
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setAuthError('');
      return userData;
    } catch (err) {
      setAuthError(getReadableAuthError(err, 'Invalid credentials'));
      throw err;
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setAuthError('');
      return userData;
    } catch (err) {
      setAuthError(getReadableAuthError(err, 'Registration failed'));
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const clearError = () => setAuthError('');

  const value = {
    user,
    token,
    loading,
    authError,
    clearError,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVerifier: user?.role === 'verifier',
    isUser: user?.role === 'user',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

