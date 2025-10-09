import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">שגיאה בטעינת נתונים</h3>
        <p className="empty-state-description">אנא נסה שוב מאוחר יותר</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>
          לוח בקרה - סקירה כללית
        </h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          {/* Teams Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
              👥
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.teams.total}</div>
              <div className="stat-label">סה"כ צוותים</div>
              <div className="stat-details">
                <span className="badge badge-success">{stats.teams.available} זמינים</span>
                <span className="badge badge-warning">{stats.teams.on_duty} בשירות</span>
              </div>
            </div>
          </div>

          {/* Hydrants Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
              🚰
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.hydrants.total}</div>
              <div className="stat-label">הידרנטים</div>
              <div className="stat-details">
                <span className="badge badge-success">{stats.hydrants.operational} תקינים</span>
                {stats.hydrants.needs_maintenance > 0 && (
                  <span className="badge badge-warning">{stats.hydrants.needs_maintenance} דורשים תחזוקה</span>
                )}
                {stats.hydrants.out_of_service > 0 && (
                  <span className="badge badge-danger">{stats.hydrants.out_of_service} לא פעילים</span>
                )}
              </div>
            </div>
          </div>

          {/* Equipment Cabinets Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
              🧰
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.equipment_cabinets.total}</div>
              <div className="stat-label">ארונות ציוד</div>
              <div className="stat-details">
                <span className="badge badge-success">{stats.equipment_cabinets.ready} מוכנים</span>
                {stats.equipment_cabinets.needs_check > 0 && (
                  <span className="badge badge-warning">{stats.equipment_cabinets.needs_check} לבדיקה</span>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
              ✓
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.tasks.total}</div>
              <div className="stat-label">משימות</div>
              <div className="stat-details">
                <span className="badge badge-warning">{stats.tasks.pending} ממתינות</span>
                <span className="badge badge-info">{stats.tasks.in_progress} בביצוע</span>
                {stats.tasks.urgent > 0 && (
                  <span className="badge badge-danger">{stats.tasks.urgent} דחופות</span>
                )}
              </div>
            </div>
          </div>

          {/* Volunteers Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ffe4e6' }}>
              🙋‍♂️
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.volunteers?.total || 0}</div>
              <div className="stat-label">מתנדבים</div>
              <div className="stat-details">
                <span className="badge badge-success">{stats.volunteers?.available || 0} זמינים</span>
                {stats.volunteers?.busy > 0 && (
                  <span className="badge badge-warning">{stats.volunteers.busy} עסוקים</span>
                )}
                {stats.volunteers?.unavailable > 0 && (
                  <span className="badge badge-danger">{stats.volunteers.unavailable} לא זמינים</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2">
          <div className="info-card">
            <h3 className="info-card-title">📋 משימות לביצוע</h3>
            <div className="info-card-content">
              <div className="info-item">
                <span>ממתינות:</span>
                <strong>{stats.tasks.pending}</strong>
              </div>
              <div className="info-item">
                <span>בביצוע:</span>
                <strong>{stats.tasks.in_progress}</strong>
              </div>
              <div className="info-item">
                <span>הושלמו:</span>
                <strong>{stats.tasks.completed}</strong>
              </div>
              <div className="info-item">
                <span>דחופות:</span>
                <strong className="text-danger">{stats.tasks.urgent}</strong>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">🔧 תחזוקה</h3>
            <div className="info-card-content">
              <div className="info-item">
                <span>סה"כ רשומות:</span>
                <strong>{stats.maintenance.total}</strong>
              </div>
              <div className="info-item">
                <span>החודש:</span>
                <strong>{stats.maintenance.this_month}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          display: flex;
          gap: 1rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }

        .stat-details {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .info-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .info-card-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f3f4f6;
        }

        .info-card-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-radius: 0.375rem;
          background-color: #f9fafb;
        }

        .info-item span {
          color: #6b7280;
        }

        .info-item strong {
          color: #1f2937;
          font-size: 1.125rem;
        }

        .text-danger {
          color: #dc2626 !important;
        }

        @media (max-width: 768px) {
          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .stat-icon {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
