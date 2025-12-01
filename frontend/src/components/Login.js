import React, { useState } from 'react';
import '../App.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'שגיאה בהתחברות');
      }
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
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
