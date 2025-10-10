import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'http://localhost:5000/api';

// Custom cabinet icon
const cabinetIcon = (status) => {
  const color = status === 'ready' ? '#22c55e' : status === 'needs_check' ? '#eab308' : '#ef4444';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🧰</div>`,
    className: '',
    iconSize: [30, 30]
  });
};

function EquipmentCabinets() {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [cabinetItems, setCabinetItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    cabinet_number: '',
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    cabinet_type: 'standard',
    status: 'ready',
    notes: ''
  });

  const [itemFormData, setItemFormData] = useState({
    item_type: 'hose',
    item_name: '',
    quantity: 1,
    length: '',
    expiry_date: '',
    status: 'good',
    notes: ''
  });

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async () => {
    try {
      const response = await axios.get(`${API_URL}/equipment-cabinets`);
      setCabinets(response.data);
    } catch (error) {
      console.error('Error loading cabinets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCabinetItems = async (cabinetId) => {
    try {
      const response = await axios.get(`${API_URL}/cabinets/${cabinetId}/items`);
      setCabinetItems(response.data);
    } catch (error) {
      console.error('Error loading cabinet items:', error);
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
        await axios.put(`${API_URL}/equipment-cabinets/${editingCabinet.id}`, data);
      } else {
        await axios.post(`${API_URL}/equipment-cabinets`, data);
      }
      setShowModal(false);
      resetForm();
      loadCabinets();
    } catch (error) {
      console.error('Error saving cabinet:', error);
      alert('שגיאה בשמירת ארון: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...itemFormData,
        quantity: parseInt(itemFormData.quantity),
        length: itemFormData.length ? parseFloat(itemFormData.length) : null
      };
      
      if (editingItem) {
        await axios.put(`${API_URL}/equipment-items/${editingItem.id}`, data);
      } else {
        await axios.post(`${API_URL}/cabinets/${selectedCabinet.id}/items`, data);
      }
      setShowItemModal(false);
      resetItemForm();
      loadCabinetItems(selectedCabinet.id);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('שגיאה בשמירת פריט: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      cabinet_number: cabinet.cabinet_number,
      name: cabinet.name,
      location: cabinet.location,
      latitude: cabinet.latitude || '',
      longitude: cabinet.longitude || '',
      cabinet_type: cabinet.cabinet_type || 'standard',
      status: cabinet.status,
      notes: cabinet.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק ארון זה?')) {
      try {
        await axios.delete(`${API_URL}/equipment-cabinets/${id}`);
        loadCabinets();
      } catch (error) {
        console.error('Error deleting cabinet:', error);
      }
    }
  };

  const handleViewItems = async (cabinet) => {
    setSelectedCabinet(cabinet);
    await loadCabinetItems(cabinet.id);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      item_type: item.item_type,
      item_name: item.item_name,
      quantity: item.quantity,
      length: item.length || '',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      status: item.status,
      notes: item.notes || ''
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) {
      try {
        await axios.delete(`${API_URL}/equipment-items/${id}`);
        loadCabinetItems(selectedCabinet.id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      cabinet_number: '',
      name: '',
      location: '',
      latitude: '',
      longitude: '',
      cabinet_type: 'standard',
      status: 'ready',
      notes: ''
    });
    setEditingCabinet(null);
  };

  const resetItemForm = () => {
    setItemFormData({
      item_type: 'hose',
      item_name: '',
      quantity: 1,
      length: '',
      expiry_date: '',
      status: 'good',
      notes: ''
    });
    setEditingItem(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      ready: <span className="badge badge-success">✅ תקין</span>,
      needs_check: <span className="badge badge-warning">⚠️ דורש בדיקה</span>,
      incomplete: <span className="badge badge-danger">❌ לא שלם</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const getItemStatusBadge = (status) => {
    const badges = {
      good: <span className="badge badge-success">✅ תקין</span>,
      needs_replacement: <span className="badge badge-warning">⚠️ דורש החלפה</span>,
      missing: <span className="badge badge-danger">❌ חסר</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const getItemTypeIcon = (type) => {
    const icons = {
      hose: '🚰',
      nozzle: '🔫',
      extinguisher: '🧯',
      valve: '🔧',
      ppe: '🦺'
    };
    return icons[type] || '📦';
  };

  const getItemTypeName = (type) => {
    const names = {
      hose: 'זרנוק',
      nozzle: 'מזנק',
      extinguisher: 'מטף',
      valve: 'ברז/מחבר',
      ppe: 'ציוד הגנה'
    };
    return names[type] || type;
  };

  const isExpiryWarning = (expiryDate) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
      {/* Cabinet Items View Modal */}
      {selectedCabinet && !showItemModal && (
        <div className="modal-overlay" onClick={() => setSelectedCabinet(null)}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                🧰 ארון #{selectedCabinet.cabinet_number} - {selectedCabinet.name}
              </h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetItemForm();
                  setShowItemModal(true);
                }}
              >
                + הוסף פריט
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <p><strong>מיקום:</strong> {selectedCabinet.location}</p>
                <p><strong>סטטוס:</strong> {getStatusBadge(selectedCabinet.status)}</p>
              </div>

              {cabinetItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3 className="empty-state-title">אין פריטים בארון</h3>
                  <p className="empty-state-description">התחל בהוספת פריט ראשון</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>סוג</th>
                        <th>שם הפריט</th>
                        <th>כמות</th>
                        <th>אורך</th>
                        <th>תאריך פג תוקף</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cabinetItems.map((item) => (
                        <tr key={item.id} style={{
                          backgroundColor: isExpired(item.expiry_date) ? '#fee2e2' : 
                                         isExpiryWarning(item.expiry_date) ? '#fef3c7' : 'white'
                        }}>
                          <td>
                            {getItemTypeIcon(item.item_type)} {getItemTypeName(item.item_type)}
                          </td>
                          <td><strong>{item.item_name}</strong></td>
                          <td>{item.quantity}</td>
                          <td>{item.length ? `${item.length} מ'` : '-'}</td>
                          <td>
                            {item.expiry_date ? (
                              <span style={{
                                color: isExpired(item.expiry_date) ? '#dc2626' : 
                                       isExpiryWarning(item.expiry_date) ? '#f59e0b' : '#1f2937'
                              }}>
                                {new Date(item.expiry_date).toLocaleDateString('he-IL')}
                                {isExpired(item.expiry_date) && ' (פג תוקף)'}
                                {isExpiryWarning(item.expiry_date) && !isExpired(item.expiry_date) && ' (מתקרב)'}
                              </span>
                            ) : '-'}
                          </td>
                          <td>{getItemStatusBadge(item.status)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => handleEditItem(item)}
                              >
                                ערוך
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => handleDeleteItem(item.id)}
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedCabinet(null)}
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Add/Edit Modal */}
      {showItemModal && selectedCabinet && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? 'עריכת פריט' : 'הוספת פריט חדש'}
              </h3>
            </div>
            <form onSubmit={handleItemSubmit}>
              <div className="modal-body">
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">סוג פריט *</label>
                    <select
                      className="form-select"
                      value={itemFormData.item_type}
                      onChange={(e) => setItemFormData({ ...itemFormData, item_type: e.target.value })}
                      required
                    >
                      <option value="hose">🚰 זרנוק</option>
                      <option value="nozzle">🔫 מזנק</option>
                      <option value="extinguisher">🧯 מטף</option>
                      <option value="valve">🔧 ברז/מחבר</option>
                      <option value="ppe">🦺 ציוד הגנה אישית</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">שם הפריט *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={itemFormData.item_name}
                      onChange={(e) => setItemFormData({ ...itemFormData, item_name: e.target.value })}
                      placeholder="לדוגמה: זרנוק 25 מטר"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3">
                  <div className="form-group">
                    <label className="form-label">כמות *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={itemFormData.quantity}
                      onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">אורך (מטרים)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={itemFormData.length}
                      onChange={(e) => setItemFormData({ ...itemFormData, length: e.target.value })}
                      placeholder="רק לזרנוקים"
                      disabled={itemFormData.item_type !== 'hose'}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">תאריך פג תוקף</label>
                    <input
                      type="date"
                      className="form-input"
                      value={itemFormData.expiry_date}
                      onChange={(e) => setItemFormData({ ...itemFormData, expiry_date: e.target.value })}
                      placeholder="רק למטפים"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">סטטוס</label>
                  <select
                    className="form-select"
                    value={itemFormData.status}
                    onChange={(e) => setItemFormData({ ...itemFormData, status: e.target.value })}
                  >
                    <option value="good">✅ תקין</option>
                    <option value="needs_replacement">⚠️ דורש החלפה</option>
                    <option value="missing">❌ חסר</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">הערות</label>
                  <textarea
                    className="form-textarea"
                    value={itemFormData.notes}
                    onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                    placeholder="הערות נוספות..."
                    rows="2"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowItemModal(false);
                    resetItemForm();
                  }}
                >
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ניהול ארונות ציוד</h2>
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
              + הוסף ארון
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
                  icon={cabinetIcon(cabinet.status)}
                >
                  <Popup>
                    <div style={{ textAlign: 'right', direction: 'rtl', minWidth: '200px' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>ארון #{cabinet.cabinet_number}</h3>
                      <p style={{ margin: '0.25rem 0' }}><strong>שם:</strong> {cabinet.name}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>מיקום:</strong> {cabinet.location}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>סטטוס:</strong> {getStatusBadge(cabinet.status)}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => handleViewItems(cabinet)}
                        >
                          צפה בתכולה
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => handleEdit(cabinet)}
                        >
                          ערוך
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : cabinets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧰</div>
            <h3 className="empty-state-title">אין ארונות רשומים</h3>
            <p className="empty-state-description">התחל בהוספת הארון הראשון</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>מס' ארון</th>
                  <th>שם</th>
                  <th>מיקום</th>
                  <th>סוג</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {cabinets.map((cabinet) => (
                  <tr key={cabinet.id}>
                    <td><strong>#{cabinet.cabinet_number}</strong></td>
                    <td>{cabinet.name}</td>
                    <td>{cabinet.location}</td>
                    <td>
                      {cabinet.cabinet_type === 'standard' ? 'סטנדרטי' : 
                       cabinet.cabinet_type === 'extended' ? 'מורחב' : 'חירום'}
                    </td>
                    <td>{getStatusBadge(cabinet.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleViewItems(cabinet)}
                        >
                          תכולה
                        </button>
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

      {/* Cabinet Add/Edit Modal */}
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
                    <label className="form-label">מספר ארון * (לדוגמה: C-001)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.cabinet_number}
                      onChange={(e) => setFormData({ ...formData, cabinet_number: e.target.value })}
                      placeholder="C-001"
                      required
                      disabled={editingCabinet}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">שם *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ארון ליד חדר אוכל"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">מיקום *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="תיאור מיקום מפורט"
                    required
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">סוג ארון</label>
                    <select
                      className="form-select"
                      value={formData.cabinet_type}
                      onChange={(e) => setFormData({ ...formData, cabinet_type: e.target.value })}
                    >
                      <option value="standard">סטנדרטי</option>
                      <option value="extended">מורחב</option>
                      <option value="emergency">חירום</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">סטטוס</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ready">✅ תקין</option>
                      <option value="needs_check">⚠️ דורש בדיקה</option>
                      <option value="incomplete">❌ לא שלם</option>
                    </select>
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

                <div className="form-group">
                  <label className="form-label">הערות</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="הערות נוספות..."
                    rows="3"
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
