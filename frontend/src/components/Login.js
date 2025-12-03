import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAPI(username, password);
      
      if (response.data.success && response.data.user) {
        // Normalize user data
        const userData = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          name: response.data.user.full_name || response.data.user.name || response.data.user.username,
          role: response.data.user.role,
          permissions: response.data.user.permissions || []
        };
        
        // Call auth context login with user data
        login(userData);
        
        // Navigate to dashboard
        navigate('/');
      } else {
        setError(response.data?.message || 'שגיאה בהתחברות');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" dir="rtl">
      <div className="login-box">
        <div className="login-header">
          <h1>🚒 מערכת ניהול כיבוי אש</h1>
          <h2>קיבוץ גלאון</h2>
          <p>התחברות למערכת</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">שם משתמש</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-info">
            <strong>תפקידים במערכת:</strong>
            <br />
            מנהל (Manager) - גישה מלאה לכל הפעולות
            <br />
            מפקד (Commander) - יכולת ניהול וצפייה
            <br />
            חבר צוות (Member) - יכולת הוספה ועריכה
            <br />
            צופה (Observer) - צפייה בלבד
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
