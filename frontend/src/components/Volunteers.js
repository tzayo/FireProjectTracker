import React, { useState, useEffect } from 'react';
import { getVolunteers, createVolunteer, updateVolunteer, deleteVolunteer } from '../api';

function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
    status: 'available',
    skills: '',
    availability_hours: '',
    notes: ''
  });

  useEffect(() => {
    loadVolunteers();
  }, [filterStatus]);

  const loadVolunteers = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await getVolunteers(params);
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error loading volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVolunteer) {
        await updateVolunteer(editingVolunteer.id, formData);
      } else {
        await createVolunteer(formData);
      }
      setShowModal(false);
      resetForm();
      loadVolunteers();
    } catch (error) {
      console.error('Error saving volunteer:', error);
    }
  };

  const handleEdit = (volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      name: volunteer.name,
      phone: volunteer.phone || '',
      email: volunteer.email || '',
      specialization: volunteer.specialization || '',
      status: volunteer.status,
      skills: volunteer.skills || '',
      availability_hours: volunteer.availability_hours || '',
      notes: volunteer.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מתנדב זה?')) {
      try {
        await deleteVolunteer(id);
        loadVolunteers();
      } catch (error) {
        console.error('Error deleting volunteer:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      specialization: '',
      status: 'available',
      skills: '',
      availability_hours: '',
      notes: ''
    });
    setEditingVolunteer(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: <span className="badge badge-success">זמין</span>,
      busy: <span className="badge badge-warning">עסוק</span>,
      unavailable: <span className="badge badge-danger">לא זמין</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const getSpecializationBadge = (specialization) => {
    const colors = {
      'כיבוי אש': 'badge-danger',
      'עזרה ראשונה': 'badge-info',
      'נהג': 'badge-warning',
      'טכנאי': 'badge-secondary'
    };
    const colorClass = colors[specialization] || 'badge-gray';
    return <span className={`badge ${colorClass}`}>{specialization || 'לא צוין'}</span>;
  };

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
          <h2 className="card-title">מתנדבים זמינים</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">כל הסטטוסים</option>
              <option value="available">זמין</option>
              <option value="busy">עסוק</option>
              <option value="unavailable">לא זמין</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              + הוסף מתנדב חדש
            </button>
          </div>
        </div>

        {volunteers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <h3 className="empty-state-title">אין מתנדבים רשומים</h3>
            <p className="empty-state-description">התחל בהוספת המתנדב הראשון</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>שם</th>
                  <th>טלפון</th>
                  <th>התמחות</th>
                  <th>כישורים</th>
                  <th>שעות זמינות</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td><strong>{volunteer.name}</strong></td>
                    <td>{volunteer.phone || '-'}</td>
                    <td>{getSpecializationBadge(volunteer.specialization)}</td>
                    <td>{volunteer.skills || '-'}</td>
                    <td>{volunteer.availability_hours || '-'}</td>
                    <td>{getStatusBadge(volunteer.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(volunteer)}
                        >
                          ערוך
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(volunteer.id)}
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

      {/* Statistics Card */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">סטטיסטיקות מתנדבים</h3>
        <div className="grid grid-cols-3">
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#10b981' }}>
              {volunteers.filter(v => v.status === 'available').length}
            </div>
            <div className="stat-label">זמינים</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {volunteers.filter(v => v.status === 'busy').length}
            </div>
            <div className="stat-label">עסוקים</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {volunteers.filter(v => v.status === 'unavailable').length}
            </div>
            <div className="stat-label">לא זמינים</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingVolunteer ? 'עריכת מתנדב' : 'הוספת מתנדב חדש'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">שם מלא *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">טלפון</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">אימייל</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">התמחות</label>
                  <select
                    className="form-select"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  >
                    <option value="">בחר התמחות...</option>
                    <option value="כיבוי אש">כיבוי אש</option>
                    <option value="עזרה ראשונה">עזרה ראשונה</option>
                    <option value="נהג">נהג</option>
                    <option value="טכנאי">טכנאי</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">כישורים</label>
                  <textarea
                    className="form-textarea"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="רשום כישורים נוספים..."
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">שעות זמינות</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.availability_hours}
                    onChange={(e) => setFormData({ ...formData, availability_hours: e.target.value })}
                    placeholder="לדוגמה: א'-ה' 17:00-22:00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">סטטוס</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">זמין</option>
                    <option value="busy">עסוק</option>
                    <option value="unavailable">לא זמין</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">הערות</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  ביטול
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVolunteer ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .stat-box {
          text-align: center;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

export default Volunteers;
