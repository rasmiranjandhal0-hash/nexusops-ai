import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexusops_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('nexusops_token'));
  const [loading, setLoading] = useState(true);

  // Verify current session on mount if token exists
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosClient.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('nexusops_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        // Clear invalid token
        localStorage.removeItem('nexusops_token');
        localStorage.removeItem('nexusops_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('nexusops_token', res.data.token);
      localStorage.setItem('nexusops_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await axiosClient.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('nexusops_token', res.data.token);
      localStorage.setItem('nexusops_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const loginDemo = async () => {
    const res = await axiosClient.post('/auth/demo');
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('nexusops_token', res.data.token);
      localStorage.setItem('nexusops_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.error || 'Demo login failed');
  };

  const logout = () => {
    localStorage.removeItem('nexusops_token');
    localStorage.removeItem('nexusops_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
