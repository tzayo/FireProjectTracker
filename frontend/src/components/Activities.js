import React, { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../api';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'training',
    participants: '',
    location: '',
    date: '',
    duration: '',
    outcome: '',
    improvements_needed: '',
    status: 'planned',
    created_by: ''
  });

  useEffect(() => {
    loadActivities();
  }, [filterType, filterStatus]);

  const loadActivities = async () => {
    try {
      const params = {};
      if (filterType) params.activity_type = filterType;
      if (filterStatus) params.status = filterStatus;
      const response = await getActivities(params);
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]); // Ensure activities is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, formData);
      } else {
        await createActivity(formData);
      }
      setShowModal(false);
      resetForm();
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description || '',
      activity_type: activity.activity_type || 'training',
      participants: activity.participants || '',
      location: activity.location || '',
      date: activity.date ? activity.date.split('T')[0] : '',
      duration: activity.duration || '',
      outcome: activity.outcome || '',
      improvements_needed: activity.improvements_needed || '',
      status: activity.status,
      created_by: activity.created_by || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק פעילות זו?')) {
      try {
        await deleteActivity(id);
        loadActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      activity_type: 'training',
      participants: '',
      location: '',
      date: '',
      duration: '',
      outcome: '',
      improvements_needed: '',
      status: 'planned',
      created_by: ''
    });
    setEditingActivity(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      planned: <span className="badge badge-info">מתוכנן</span>,
      ongoing: <span className="badge badge-warning">בביצוע</span>,
      completed: <span className="badge badge-success">הושלם</span>,
      cancelled: <span className="badge badge-danger">בוטל</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const getTypeBadge = (type) => {
    const types = {
      training: { label: 'אימון', color: 'badge-info' },
      drill: { label: 'תרגיל', color: 'badge-warning' },
      emergency: { label: 'חירום', color: 'badge-danger' },
      meeting: { label: 'פגישה', color: 'badge-secondary' },
      maintenance: { label: 'תחזוקה', color: 'badge-primary' }
    };
    const typeInfo = types[type] || { label: type, color: 'badge-gray' };
    return <span className={`badge ${typeInfo.color}`}>{typeInfo.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
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
          <h2 className="card-title">פעילויות ושיפורים</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">כל הסוגים</option>
              <option value="training">אימון</option>
              <option value="drill">תרגיל</option>
              <option value="emergency">חירום</option>
              <option value="meeting">פגישה</option>
              <option value="maintenance">תחזוקה</option>
            </select>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">כל הסטטוסים</option>
              <option value="planned">מתוכנן</option>
              <option value="ongoing">בביצוע</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
            </select>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              + הוסף פעילות חדשה
            </button>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">אין פעילויות רשומות</h3>
            <p className="empty-state-description">התחל בהוספת הפעילות הראשונה</p>
          </div>
        ) : (
          <div className="activities-grid">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-header">
                  <div>
                    <h3 className="activity-title">{activity.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {getTypeBadge(activity.activity_type)}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleEdit(activity)}
                    >
                      ערוך
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(activity.id)}
                    >
                      מחק
                    </button>
                  </div>
                </div>

                <div className="activity-body">
                  {activity.description && (
                    <p className="activity-description">{activity.description}</p>
                  )}
                  
                  <div className="activity-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 תאריך:</span>
                      <span>{formatDate(activity.date)}</span>
                    </div>
                    {activity.location && (
                      <div className="detail-item">
                        <span className="detail-label">📍 מיקום:</span>
                        <span>{activity.location}</span>
                      </div>
                    )}
                    {activity.duration && (
                      <div className="detail-item">
                        <span className="detail-label">⏱️ משך:</span>
                        <span>{activity.duration} דקות</span>
                      </div>
                    )}
                    {activity.participants && (
                      <div className="detail-item">
                        <span className="detail-label">👥 משתתפים:</span>
                        <span>{activity.participants}</span>
                      </div>
                    )}
                  </div>

                  {activity.outcome && (
                    <div className="activity-section">
                      <strong>תוצאות:</strong>
                      <p>{activity.outcome}</p>
                    </div>
                  )}

                  {activity.improvements_needed && (
                    <div className="activity-section improvement">
                      <strong>שיפורים נדרשים:</strong>
                      <p>{activity.improvements_needed}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Card */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">סטטיסטיקות פעילויות</h3>
        <div className="grid grid-cols-4">
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#3b82f6' }}>
              {activities.filter(a => a.status === 'planned').length}
            </div>
            <div className="stat-label">מתוכננות</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {activities.filter(a => a.status === 'ongoing').length}
            </div>
            <div className="stat-label">בביצוע</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#10b981' }}>
              {activities.filter(a => a.status === 'completed').length}
            </div>
            <div className="stat-label">הושלמו</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ color: '#6b7280' }}>
              {activities.length}
            </div>
            <div className="stat-label">סה"כ</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingActivity ? 'עריכת פעילות' : 'הוספת פעילות חדשה'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">כותרת *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">סוג פעילות *</label>
                    <select
                      className="form-select"
                      value={formData.activity_type}
                      onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                      required
                    >
                      <option value="training">אימון</option>
                      <option value="drill">תרגיל</option>
                      <option value="emergency">חירום</option>
                      <option value="meeting">פגישה</option>
                      <option value="maintenance">תחזוקה</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">תאריך</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">משך (בדקות)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">מיקום</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">סטטוס</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="planned">מתוכנן</option>
                      <option value="ongoing">בביצוע</option>
                      <option value="completed">הושלם</option>
                      <option value="cancelled">בוטל</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">תיאור</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">משתתפים</label>
                  <textarea
                    className="form-textarea"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    placeholder="רשום שמות המשתתפים..."
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">תוצאות הפעילות</label>
                  <textarea
                    className="form-textarea"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">שיפורים נדרשים</label>
                  <textarea
                    className="form-textarea"
                    value={formData.improvements_needed}
                    onChange={(e) => setFormData({ ...formData, improvements_needed: e.target.value })}
                    placeholder="מה ניתן לשפר לפעם הבאה?"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">נוצר על ידי</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.created_by}
                    onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                    autoComplete="name"
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
                  {editingActivity ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .activities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .activity-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }

        .activity-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .activity-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .activity-body {
          padding: 1.5rem;
        }

        .activity-description {
          color: #4b5563;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .activity-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .detail-label {
          font-weight: 500;
          min-width: 80px;
        }

        .activity-section {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f3f4f6;
          border-radius: 0.375rem;
        }

        .activity-section.improvement {
          background: #fef3c7;
          border-left: 3px solid #f59e0b;
        }

        .activity-section strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .activity-section p {
          margin: 0;
          color: #4b5563;
          font-size: 0.875rem;
          line-height: 1.5;
        }

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

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .modal-large {
          max-width: 800px;
        }

        @media (max-width: 768px) {
          .activities-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Activities;
