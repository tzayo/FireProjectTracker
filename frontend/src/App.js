import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import Hydrants from './components/Hydrants';
import EquipmentCabinets from './components/EquipmentCabinets';
import Tasks from './components/Tasks';
import Maintenance from './components/Maintenance';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className="app" dir="rtl">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-title">
              <h1>🚒 מערכת ניהול כיבוי אש</h1>
              <p>קיבוץ גלאון</p>
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
