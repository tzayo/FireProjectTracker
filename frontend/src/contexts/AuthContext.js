import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check localStorage for token and user
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }
      
      // Fall back to session-based auth check
      const response = await fetch('http://localhost:5000/api/auth/check', {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;

    const roleHierarchy = {
      'observer': 1,
      'member': 2,
      'commander': 3,
      'manager': 4
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const canCreate = () => hasPermission('member');
  const canUpdate = () => hasPermission('member');
  const canDelete = () => hasPermission('commander');
  const isManager = () => user && user.role === 'manager';

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    hasPermission,
    canCreate,
    canUpdate,
    canDelete,
    isManager,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
