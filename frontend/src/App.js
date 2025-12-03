import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import Hydrants from './components/Hydrants';
import EquipmentCabinets from './components/EquipmentCabinets';
import Tasks from './components/Tasks';
import Maintenance from './components/Maintenance';
import Volunteers from './components/Volunteers';
import Activities from './components/Activities';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-container" dir="rtl">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app" dir="rtl">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>🚒 מערכת ניהול כיבוי אש</h1>
            <p>קיבוץ גלאון</p>
          </div>
          <div className="header-user">
            <span className="user-name">{user.name}</span>
            <span className="user-role">
              {user.role === 'manager' && 'מנהל'}
              {user.role === 'commander' && 'מפקד'}
              {user.role === 'team_member' && 'חבר צוות'}
              {user.role === 'observer' && 'צופה'}
            </span>
            <button onClick={logout} className="logout-button">
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <Link
            to="/"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>לוח בקרה</span>
          </Link>
          <Link
            to="/teams"
            className={`nav-item ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <span className="nav-icon">👥</span>
            <span>צוותים</span>
          </Link>
          <Link
            to="/hydrants"
            className={`nav-item ${activeTab === 'hydrants' ? 'active' : ''}`}
            onClick={() => setActiveTab('hydrants')}
          >
            <span className="nav-icon">🚰</span>
            <span>הידרנטים</span>
          </Link>
          <Link
            to="/equipment"
            className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipment')}
          >
            <span className="nav-icon">🧰</span>
            <span>ארונות ציוד</span>
          </Link>
          <Link
            to="/tasks"
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <span className="nav-icon">✓</span>
            <span>משימות</span>
          </Link>
          <Link
            to="/maintenance"
            className={`nav-item ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <span className="nav-icon">🔧</span>
            <span>תחזוקה</span>
          </Link>
          <Link
            to="/volunteers"
            className={`nav-item ${activeTab === 'volunteers' ? 'active' : ''}`}
            onClick={() => setActiveTab('volunteers')}
          >
            <span className="nav-icon">👤</span>
            <span>מתנדבים</span>
          </Link>
          <Link
            to="/activities"
            className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            <span className="nav-icon">📋</span>
            <span>פעילויות</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/hydrants" element={<Hydrants />} />
          <Route path="/equipment" element={<EquipmentCabinets />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/activities" element={<Activities />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
