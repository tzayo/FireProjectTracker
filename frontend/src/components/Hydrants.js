import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { getHydrants, createHydrant, updateHydrant, deleteHydrant, getNearbyCabinetsForHydrant } from '../api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Hydrants() {
  const [hydrants, setHydrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [editingHydrant, setEditingHydrant] = useState(null);
  const [nearbyByHydrant, setNearbyByHydrant] = useState({}); // { [hydrantId]: [{id,name,distance,...}] }
  const [nearbyLoading, setNearbyLoading] = useState({}); // { [hydrantId]: boolean }
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    status: 'operational',
    pressure: '',
    notes: ''
  });

  useEffect(() => {
    loadHydrants();
  }, []);

  useEffect(() => {
    // Preload nearby cabinets for mapped hydrants
    hydrants
      .filter((h) => h.latitude && h.longitude)
      .forEach((h) => {
        if (!nearbyByHydrant[h.id] && !nearbyLoading[h.id]) {
          loadNearbyCabinets(h.id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrants]);

  const loadHydrants = async () => {
    try {
      const response = await getHydrants();
      setHydrants(response.data);
    } catch (error) {
      console.error('Error loading hydrants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };
      
      if (editingHydrant) {
        await updateHydrant(editingHydrant.id, data);
      } else {
        await createHydrant(data);
      }
      setShowModal(false);
      resetForm();
      loadHydrants();
    } catch (error) {
      console.error('Error saving hydrant:', error);
    }
  };

  const loadNearbyCabinets = async (hydrantId) => {
    try {
      setNearbyLoading((s) => ({ ...s, [hydrantId]: true }));
      const { data } = await getNearbyCabinetsForHydrant(hydrantId, { radius: 100 });
      setNearbyByHydrant((s) => ({ ...s, [hydrantId]: data }));
    } catch (error) {
      console.error('Error loading nearby cabinets:', error);
      setNearbyByHydrant((s) => ({ ...s, [hydrantId]: [] }));
    } finally {
      setNearbyLoading((s) => ({ ...s, [hydrantId]: false }));
    }
  };

  const handleEdit = (hydrant) => {
    setEditingHydrant(hydrant);
    setFormData({
      name: hydrant.name,
      location: hydrant.location,
      latitude: hydrant.latitude || '',
      longitude: hydrant.longitude || '',
      status: hydrant.status,
      pressure: hydrant.pressure || '',
      notes: hydrant.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק הידרנט זה?')) {
      try {
        await deleteHydrant(id);
        loadHydrants();
      } catch (error) {
        console.error('Error deleting hydrant:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      status: 'operational',
      pressure: '',
      notes: ''
    });
    setEditingHydrant(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      operational: <span className="badge badge-success">תקין</span>,
      needs_maintenance: <span className="badge badge-warning">דורש תחזוקה</span>,
      out_of_service: <span className="badge badge-danger">לא פעיל</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  // Default center for Kibbutz Galon (approximate coordinates)
  const defaultCenter = [31.4117, 34.6667];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ניהול הידרנטים</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              📋 רשימה
            </button>
            <button
              className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('map')}
            >
              🗺️ מפה
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              + הוסף הידרנט
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div style={{ height: '600px', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hydrants.filter(h => h.latitude && h.longitude).map((hydrant) => {
                const statusColor =
                  hydrant.status === 'operational' ? '#10b981' :
                  hydrant.status === 'needs_maintenance' ? '#f59e0b' : '#ef4444';
                return (
                  <React.Fragment key={hydrant.id}>
                    <Circle
                      center={[hydrant.latitude, hydrant.longitude]}
                      radius={50}
                      pathOptions={{ color: statusColor, fillColor: statusColor, opacity: 0.8, fillOpacity: 0.1 }}
                    />
                    <Marker position={[hydrant.latitude, hydrant.longitude]}>
                      <Popup>
                        <div style={{ textAlign: 'right', direction: 'rtl', minWidth: '240px' }}>
                          <h3 style={{ margin: '0 0 0.5rem 0' }}>{hydrant.name}</h3>
                          <p style={{ margin: '0.25rem 0' }}><strong>מיקום:</strong> {hydrant.location}</p>
                          <p style={{ margin: '0.25rem 0' }}><strong>סטטוס:</strong> {getStatusBadge(hydrant.status)}</p>
                          {hydrant.pressure && (
                            <p style={{ margin: '0.25rem 0' }}><strong>לחץ:</strong> {hydrant.pressure}</p>
                          )}

                          <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>ארונות קרובים (≤100מ')</div>
                            {nearbyLoading[hydrant.id] && <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>טוען...</div>}
                            {!nearbyLoading[hydrant.id] && (nearbyByHydrant[hydrant.id]?.length ? (
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {nearbyByHydrant[hydrant.id].slice(0, 5).map((c) => (
                                  <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>{c.name}</span>
                                    <span style={{ color: '#6b7280' }}>{c.distance} מ'</span>
                                  </li>
                                ))}
                                {nearbyByHydrant[hydrant.id].length > 5 && (
                                  <li style={{ fontSize: '0.85rem', color: '#6b7280' }}>ועוד {nearbyByHydrant[hydrant.id].length - 5}...</li>
                                )}
                              </ul>
                            ) : (
                              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>אין ארונות קרובים</div>
                            ))}
                          </div>

                          <button
                            className="btn btn-primary"
                            style={{ marginTop: '0.5rem', width: '100%' }}
                            onClick={() => handleEdit(hydrant)}
                          >
                            ערוך
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        ) : hydrants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚰</div>
            <h3 className="empty-state-title">אין הידרנטים רשומים</h3>
            <p className="empty-state-description">התחל בהוספת ההידרנט הראשון</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>מיקום</th>
                  <th>סטטוס</th>
                  <th>לחץ</th>
                  <th>קואורדינטות</th>
                  <th>הערות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {hydrants.map((hydrant) => (
                  <tr key={hydrant.id}>
                    <td><strong>{hydrant.name}</strong></td>
                    <td>{hydrant.location}</td>
                    <td>{getStatusBadge(hydrant.status)}</td>
                    <td>{hydrant.pressure || '-'}</td>
                    <td>
                      {hydrant.latitude && hydrant.longitude ? (
                        <span style={{ fontSize: '0.8rem' }}>
                          {hydrant.latitude.toFixed(4)}, {hydrant.longitude.toFixed(4)}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{hydrant.notes ? hydrant.notes.substring(0, 50) + (hydrant.notes.length > 50 ? '...' : '') : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(hydrant)}
                        >
                          ערוך
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(hydrant.id)}
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingHydrant ? 'עריכת הידרנט' : 'הוספת הידרנט חדש'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">שם *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">מיקום *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">קו רוחב (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="31.4117"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">קו אורך (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="34.6667"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">סטטוס</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="operational">תקין</option>
                      <option value="needs_maintenance">דורש תחזוקה</option>
                      <option value="out_of_service">לא פעיל</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">לחץ</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.pressure}
                      onChange={(e) => setFormData({ ...formData, pressure: e.target.value })}
                      placeholder="לדוגמה: 5 בר"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">הערות</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="הערות נוספות..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingHydrant ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hydrants;
