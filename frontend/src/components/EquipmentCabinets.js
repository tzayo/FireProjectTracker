import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getEquipmentCabinets, createEquipmentCabinet, updateEquipmentCabinet, deleteEquipmentCabinet } from '../api';
import 'leaflet/dist/leaflet.css';

function EquipmentCabinets() {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    equipment_list: '',
    status: 'ready',
    notes: ''
  });

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async () => {
    try {
      const response = await getEquipmentCabinets();
      setCabinets(response.data);
    } catch (error) {
      console.error('Error loading cabinets:', error);
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
      
      if (editingCabinet) {
        await updateEquipmentCabinet(editingCabinet.id, data);
      } else {
        await createEquipmentCabinet(data);
      }
      setShowModal(false);
      resetForm();
      loadCabinets();
    } catch (error) {
      console.error('Error saving cabinet:', error);
    }
  };

  const handleEdit = (cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      name: cabinet.name,
      location: cabinet.location,
      latitude: cabinet.latitude || '',
      longitude: cabinet.longitude || '',
      equipment_list: cabinet.equipment_list || '',
      status: cabinet.status,
      notes: cabinet.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק ארון ציוד זה?')) {
      try {
        await deleteEquipmentCabinet(id);
        loadCabinets();
      } catch (error) {
        console.error('Error deleting cabinet:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      equipment_list: '',
      status: 'ready',
      notes: ''
    });
    setEditingCabinet(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      ready: <span className="badge badge-success">מוכן</span>,
      incomplete: <span className="badge badge-warning">לא שלם</span>,
      needs_check: <span className="badge badge-danger">דורש בדיקה</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

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
          <h2 className="card-title">ארונות ציוד חירום</h2>
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
              + הוסף ארון ציוד
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
              {cabinets.filter(c => c.latitude && c.longitude).map((cabinet) => (
                <Marker
                  key={cabinet.id}
                  position={[cabinet.latitude, cabinet.longitude]}
                >
                  <Popup>
                    <div style={{ textAlign: 'right', direction: 'rtl' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>{cabinet.name}</h3>
                      <p style={{ margin: '0.25rem 0' }}><strong>מיקום:</strong> {cabinet.location}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>סטטוס:</strong> {getStatusBadge(cabinet.status)}</p>
                      <button
                        className="btn btn-primary"
                        style={{ marginTop: '0.5rem', width: '100%' }}
                        onClick={() => handleEdit(cabinet)}
                      >
                        ערוך
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : cabinets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧰</div>
            <h3 className="empty-state-title">אין ארונות ציוד רשומים</h3>
            <p className="empty-state-description">התחל בהוספת ארון הציוד הראשון</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>מיקום</th>
                  <th>סטטוס</th>
                  <th>ציוד</th>
                  <th>הערות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {cabinets.map((cabinet) => (
                  <tr key={cabinet.id}>
                    <td><strong>{cabinet.name}</strong></td>
                    <td>{cabinet.location}</td>
                    <td>{getStatusBadge(cabinet.status)}</td>
                    <td>
                      {cabinet.equipment_list ? (
                        <div style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                          {cabinet.equipment_list.substring(0, 100)}
                          {cabinet.equipment_list.length > 100 ? '...' : ''}
                        </div>
                      ) : '-'}
                    </td>
                    <td>{cabinet.notes ? cabinet.notes.substring(0, 50) + (cabinet.notes.length > 50 ? '...' : '') : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(cabinet)}
                        >
                          ערוך
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(cabinet.id)}
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
                {editingCabinet ? 'עריכת ארון ציוד' : 'הוספת ארון ציוד חדש'}
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">סטטוס</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ready">מוכן</option>
                    <option value="incomplete">לא שלם</option>
                    <option value="needs_check">דורש בדיקה</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">רשימת ציוד</label>
                  <textarea
                    className="form-textarea"
                    value={formData.equipment_list}
                    onChange={(e) => setFormData({ ...formData, equipment_list: e.target.value })}
                    placeholder="רשום את פריטי הציוד הקיימים בארון..."
                    style={{ minHeight: '120px' }}
                  />
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
                  {editingCabinet ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EquipmentCabinets;
