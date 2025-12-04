import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { getDashboardStats, getHydrants, getEquipmentCabinets, getDashboardAlerts } from '../api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons for hydrants and cabinets
const hydrantIcon = (status) => {
  const color = status === 'operational' ? '#22c55e' : status === 'needs_maintenance' ? '#eab308' : '#ef4444';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚰</div>`,
    className: '',
    iconSize: [30, 30]
  });
};

const cabinetIcon = (status) => {
  const color = status === 'ready' ? '#22c55e' : status === 'needs_check' ? '#eab308' : '#ef4444';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🧰</div>`,
    className: '',
    iconSize: [30, 30]
  });
};

const DEFAULT_STATS = {
  teams: { total: 0, available: 0, on_duty: 0 },
  hydrants: { total: 0, operational: 0, needs_maintenance: 0, out_of_service: 0 },
  equipment_cabinets: { total: 0, ready: 0, needs_check: 0 },
  tasks: { total: 0, pending: 0, in_progress: 0, completed: 0, urgent: 0 },
  volunteers: { total: 0, available: 0, busy: 0, unavailable: 0 },
  activities: { total: 0, planned: 0, ongoing: 0, completed: 0, this_month: 0 },
  maintenance: { total: 0, this_month: 0 }
};

function Dashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [hydrants, setHydrants] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Create a safe stats object with guaranteed default values
  const safeStats = useMemo(() => {
    if (!stats || typeof stats !== 'object') {
      return DEFAULT_STATS;
    }

    return {
      teams: stats.teams && typeof stats.teams === 'object' ? stats.teams : DEFAULT_STATS.teams,
      hydrants: stats.hydrants && typeof stats.hydrants === 'object' ? stats.hydrants : DEFAULT_STATS.hydrants,
      equipment_cabinets: stats.equipment_cabinets && typeof stats.equipment_cabinets === 'object' ? stats.equipment_cabinets : DEFAULT_STATS.equipment_cabinets,
      tasks: stats.tasks && typeof stats.tasks === 'object' ? stats.tasks : DEFAULT_STATS.tasks,
      volunteers: stats.volunteers && typeof stats.volunteers === 'object' ? stats.volunteers : DEFAULT_STATS.volunteers,
      activities: stats.activities && typeof stats.activities === 'object' ? stats.activities : DEFAULT_STATS.activities,
      maintenance: stats.maintenance && typeof stats.maintenance === 'object' ? stats.maintenance : DEFAULT_STATS.maintenance
    };
  }, [stats]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, hydrantsRes, cabinetsRes, alertsRes] = await Promise.all([
        getDashboardStats(),
        axios.get('http://localhost:5000/api/hydrants'),
        axios.get('http://localhost:5000/api/equipment-cabinets'),
        axios.get('http://localhost:5000/api/dashboard/alerts')
      ]);

      // Safely set stats with fallback for each nested object
      const responseData = statsRes?.data || {};
      setStats({
        teams: (responseData.teams && typeof responseData.teams === 'object') ? responseData.teams : DEFAULT_STATS.teams,
        hydrants: (responseData.hydrants && typeof responseData.hydrants === 'object') ? responseData.hydrants : DEFAULT_STATS.hydrants,
        equipment_cabinets: (responseData.equipment_cabinets && typeof responseData.equipment_cabinets === 'object') ? responseData.equipment_cabinets : DEFAULT_STATS.equipment_cabinets,
        tasks: (responseData.tasks && typeof responseData.tasks === 'object') ? responseData.tasks : DEFAULT_STATS.tasks,
        volunteers: (responseData.volunteers && typeof responseData.volunteers === 'object') ? responseData.volunteers : DEFAULT_STATS.volunteers,
        activities: (responseData.activities && typeof responseData.activities === 'object') ? responseData.activities : DEFAULT_STATS.activities,
        maintenance: (responseData.maintenance && typeof responseData.maintenance === 'object') ? responseData.maintenance : DEFAULT_STATS.maintenance
      });
      setHydrants(Array.isArray(hydrantsRes.data) ? hydrantsRes.data.filter(h => h.latitude && h.longitude) : []);
      setCabinets(Array.isArray(cabinetsRes.data) ? cabinetsRes.data.filter(c => c.latitude && c.longitude) : []);
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Keep default stats structure on error (already initialized in state)
      setStats(DEFAULT_STATS);
      setHydrants([]);
      setCabinets([]);
      setAlerts([]);
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

  // safeStats is always defined via useMemo, so this check is now redundant
  // but kept for extra safety
  if (!safeStats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">שגיאה בטעינת נתונים</h3>
        <p className="empty-state-description">אנא נסה שוב מאוחר יותר</p>
      </div>
    );
  }

  const defaultCenter = [31.4117, 34.6667]; // קיבוץ גלאון (מיקום משוער)

  return (
    <div>
      {/* Alerts Panel - if any */}
      {alerts.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#991b1b', margin: 0 }}>
              התראות ({alerts.length})
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`alert-item ${alert.severity}`} style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: alert.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                borderRight: `4px solid ${alert.severity === 'critical' ? '#dc2626' : '#f59e0b'}`
              }}>
                <strong>{alert.type === 'hydrant_inspection' ? '🚰' : alert.type === 'equipment_expiry' ? '🧯' : '✓'}</strong>
                {' '}{alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>
          לוח בקרה - סקירה כללית
        </h2>
        
        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-4" style={{ marginBottom: '1rem' }}>
          {/* Teams Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
              👥
            </div>
            <div className="stat-content">
              <div className="stat-value">{safeStats.teams?.total ?? 0}</div>
              <div className="stat-label">סה"כ צוותים</div>
              <div className="stat-details">
                <span className="badge badge-success">{safeStats.teams?.available ?? 0} זמינים</span>
                <span className="badge badge-warning">{safeStats.teams?.on_duty ?? 0} בשירות</span>
              </div>
            </div>
          </div>

          {/* Hydrants Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
              🚰
            </div>
            <div className="stat-content">
              <div className="stat-value">{safeStats.hydrants?.total ?? 0}</div>
              <div className="stat-label">הידרנטים</div>
              <div className="stat-details">
                <span className="badge badge-success">{safeStats.hydrants?.operational ?? 0} תקינים</span>
                {(safeStats.hydrants?.needs_maintenance ?? 0) > 0 && (
                  <span className="badge badge-warning">{safeStats.hydrants?.needs_maintenance ?? 0} דורשים תחזוקה</span>
                )}
                {(safeStats.hydrants?.out_of_service ?? 0) > 0 && (
                  <span className="badge badge-danger">{safeStats.hydrants?.out_of_service ?? 0} לא פעילים</span>
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
              <div className="stat-value">{safeStats.equipment_cabinets?.total ?? 0}</div>
              <div className="stat-label">ארונות ציוד</div>
              <div className="stat-details">
                <span className="badge badge-success">{safeStats.equipment_cabinets?.ready ?? 0} מוכנים</span>
                {(safeStats.equipment_cabinets?.needs_check ?? 0) > 0 && (
                  <span className="badge badge-warning">{safeStats.equipment_cabinets?.needs_check ?? 0} לבדיקה</span>
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
              <div className="stat-value">{safeStats.tasks?.total ?? 0}</div>
              <div className="stat-label">משימות</div>
              <div className="stat-details">
                <span className="badge badge-warning">{safeStats.tasks?.pending ?? 0} ממתינות</span>
                <span className="badge badge-info">{safeStats.tasks?.in_progress ?? 0} בביצוע</span>
                {(safeStats.tasks?.urgent ?? 0) > 0 && (
                  <span className="badge badge-danger">{safeStats.tasks?.urgent ?? 0} דחופות</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 2 (New) */}
        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
          {/* Volunteers Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
              👤
            </div>
            <div className="stat-content">
              <div className="stat-value">{safeStats.volunteers?.total ?? 0}</div>
              <div className="stat-label">מתנדבים</div>
              <div className="stat-details">
                <span className="badge badge-success">{safeStats.volunteers?.available ?? 0} זמינים</span>
                <span className="badge badge-warning">{safeStats.volunteers?.busy ?? 0} עסוקים</span>
                <span className="badge badge-danger">{safeStats.volunteers?.unavailable ?? 0} לא זמינים</span>
              </div>
            </div>
          </div>

          {/* Activities Stats */}
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fce7f3' }}>
              📋
            </div>
            <div className="stat-content">
              <div className="stat-value">{safeStats.activities?.total ?? 0}</div>
              <div className="stat-label">פעילויות</div>
              <div className="stat-details">
                <span className="badge badge-info">{safeStats.activities?.planned ?? 0} מתוכננות</span>
                <span className="badge badge-warning">{safeStats.activities?.ongoing ?? 0} בביצוע</span>
                <span className="badge badge-success">{safeStats.activities?.completed ?? 0} הושלמו</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3">
          <div className="info-card">
            <h3 className="info-card-title">📋 משימות לביצוע</h3>
            <div className="info-card-content">
              <div className="info-item">
                <span>ממתינות:</span>
                <strong>{safeStats.tasks?.pending ?? 0}</strong>
              </div>
              <div className="info-item">
                <span>בביצוע:</span>
                <strong>{safeStats.tasks?.in_progress ?? 0}</strong>
              </div>
              <div className="info-item">
                <span>הושלמו:</span>
                <strong>{safeStats.tasks?.completed ?? 0}</strong>
              </div>
              <div className="info-item">
                <span>דחופות:</span>
                <strong className="text-danger">{safeStats.tasks?.urgent ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">🔧 תחזוקה</h3>
            <div className="info-card-content">
              <div className="info-item">
                <span>סה"כ רשומות:</span>
                <strong>{safeStats.maintenance?.total ?? 0}</strong>
              </div>
              <div className="info-item">
                <span>החודש:</span>
                <strong>{safeStats.maintenance?.this_month ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">📊 פעילויות החודש</h3>
            <div className="info-card-content">
              <div className="info-item">
                <span>החודש:</span>
                <strong>{safeStats.activities?.this_month ?? 0}</strong>
              </div>
              <div className="info-item">
                <span>סה"כ:</span>
                <strong>{safeStats.activities?.total ?? 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div style={{ marginTop: '2rem' }}>
          <h3 className="info-card-title">🗺️ מפת סקירה - כל הנכסים</h3>
          <div style={{ height: '500px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <MapContainer
              center={defaultCenter}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Hydrants */}
              {hydrants.map((hydrant) => (
                <Marker
                  key={`hydrant-${hydrant.id}`}
                  position={[hydrant.latitude, hydrant.longitude]}
                  icon={hydrantIcon(hydrant.status)}
                >
                  <Popup>
                    <div style={{ textAlign: 'right', direction: 'rtl', minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
                        🚰 {hydrant.name}
                      </h3>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>מס' סידורי:</strong> {hydrant.serial_number}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>מיקום:</strong> {hydrant.location}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>סוג:</strong> {hydrant.hydrant_type === 'ground' ? 'קרקעי' : hydrant.hydrant_type === 'wall' ? 'קיר' : 'בור'}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>סטטוס:</strong>{' '}
                        <span className={`badge badge-${hydrant.status === 'operational' ? 'success' : hydrant.status === 'needs_maintenance' ? 'warning' : 'danger'}`}>
                          {hydrant.status === 'operational' ? 'תקין' : hydrant.status === 'needs_maintenance' ? 'דורש תחזוקה' : 'לא תקין'}
                        </span>
                      </p>
                      {hydrant.water_pressure && (
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                          <strong>לחץ מים:</strong> {hydrant.water_pressure} בר
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Equipment Cabinets */}
              {cabinets.map((cabinet) => (
                <Marker
                  key={`cabinet-${cabinet.id}`}
                  position={[cabinet.latitude, cabinet.longitude]}
                  icon={cabinetIcon(cabinet.status)}
                >
                  <Popup>
                    <div style={{ textAlign: 'right', direction: 'rtl', minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
                        🧰 ארון #{cabinet.cabinet_number}
                      </h3>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>שם:</strong> {cabinet.name}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>מיקום:</strong> {cabinet.location}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                        <strong>סטטוס:</strong>{' '}
                        <span className={`badge badge-${cabinet.status === 'ready' ? 'success' : cabinet.status === 'needs_check' ? 'warning' : 'danger'}`}>
                          {cabinet.status === 'ready' ? 'תקין' : cabinet.status === 'needs_check' ? 'דורש בדיקה' : 'לא שלם'}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {/* Map Legend */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }}></div>
              <span style={{ fontSize: '0.875rem' }}>🚰 הידרנט תקין</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#eab308', border: '2px solid white' }}></div>
              <span style={{ fontSize: '0.875rem' }}>🚰 דורש תחזוקה</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid white' }}></div>
              <span style={{ fontSize: '0.875rem' }}>🚰 לא תקין</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white' }}></div>
              <span style={{ fontSize: '0.875rem' }}>🧰 ארון מוכן</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#eab308', border: '2px solid white' }}></div>
              <span style={{ fontSize: '0.875rem' }}>🧰 דורש בדיקה</span>
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
