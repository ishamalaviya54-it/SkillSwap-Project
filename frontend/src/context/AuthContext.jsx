import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('skillswap_token');
      const storedUser = localStorage.getItem('skillswap_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const res = await API.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('skillswap_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data.data;
    
    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('skillswap_token', receivedToken);
    localStorage.setItem('skillswap_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    const { token: receivedToken, ...userData } = res.data.data;

    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('skillswap_token', receivedToken);
    localStorage.setItem('skillswap_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

