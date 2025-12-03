import React, { useState, useEffect } from 'react';
import { getMaintenanceRecords, createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } from '../api';

function Maintenance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    item_type: 'hydrant',
    item_id: '',
    item_name: '',
    maintenance_type: 'routine',
    description: '',
    performed_by: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, [filterType]);

  const loadRecords = async () => {
    try {
      const params = {};
      if (filterType) params.item_type = filterType;

      const response = await getMaintenanceRecords(params);
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading records:', error);
      setRecords([]); // Ensure records is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null
      };
      
      if (editingRecord) {
        await updateMaintenanceRecord(editingRecord.id, data);
      } else {
        await createMaintenanceRecord(data);
      }
      setShowModal(false);
      resetForm();
      loadRecords();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      item_type: record.item_type,
      item_id: record.item_id || '',
      item_name: record.item_name,
      maintenance_type: record.maintenance_type || 'routine',
      description: record.description || '',
      performed_by: record.performed_by || '',
      date: record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0],
      cost: record.cost || '',
      notes: record.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      try {
        await deleteMaintenanceRecord(id);
        loadRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      item_type: 'hydrant',
      item_id: '',
      item_name: '',
      maintenance_type: 'routine',
      description: '',
      performed_by: '',
      date: new Date().toISOString().split('T')[0],
      cost: '',
      notes: ''
    });
    setEditingRecord(null);
  };

  const getItemTypeName = (type) => {
    const types = {
      hydrant: 'הידרנט',
      equipment_cabinet: 'ארון ציוד',
      vehicle: 'רכב',
      equipment: 'ציוד'
    };
    return types[type] || type;
  };

  const getMaintenanceTypeName = (type) => {
    const types = {
      routine: 'שגרתית',
      repair: 'תיקון',
      inspection: 'בדיקה',
      emergency: 'חירום'
    };
    return types[type] || type;
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
          <h2 className="card-title">רשומות תחזוקה</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + הוסף רשומה
          </button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }}>
            סנן לפי סוג פריט
          </label>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">הכל</option>
            <option value="hydrant">הידרנטים</option>
            <option value="equipment_cabinet">ארונות ציוד</option>
            <option value="vehicle">רכבים</option>
            <option value="equipment">ציוד</option>
          </select>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔧</div>
            <h3 className="empty-state-title">אין רשומות תחזוקה</h3>
            <p className="empty-state-description">התחל בהוספת הרשומה הראשונה</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>תאריך</th>
                  <th>סוג פריט</th>
                  <th>שם הפריט</th>
                  <th>סוג תחזוקה</th>
                  <th>תיאור</th>
                  <th>בוצע על ידי</th>
                  <th>עלות</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString('he-IL')}</td>
                    <td>
                      <span className="badge badge-info">
                        {getItemTypeName(record.item_type)}
                      </span>
                    </td>
                    <td><strong>{record.item_name}</strong></td>
                    <td>{getMaintenanceTypeName(record.maintenance_type)}</td>
                    <td>
                      {record.description ? (
                        <div style={{ maxWidth: '250px' }}>
                          {record.description.substring(0, 60)}
                          {record.description.length > 60 ? '...' : ''}
                        </div>
                      ) : '-'}
                    </td>
                    <td>{record.performed_by || '-'}</td>
                    <td>
                      {record.cost ? (
                        <span>₪{record.cost.toFixed(2)}</span>
                      ) : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(record)}
                        >
                          ערוך
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(record.id)}
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
                {editingRecord ? 'עריכת רשומת תחזוקה' : 'הוספת רשומת תחזוקה חדשה'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">סוג פריט *</label>
                    <select
                      className="form-select"
                      value={formData.item_type}
                      onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                      required
                    >
                      <option value="hydrant">הידרנט</option>
                      <option value="equipment_cabinet">ארון ציוד</option>
                      <option value="vehicle">רכב</option>
                      <option value="equipment">ציוד</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">שם הפריט *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                      required
                      placeholder="לדוגמה: הידרנט 1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">סוג תחזוקה</label>
                    <select
                      className="form-select"
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                    >
                      <option value="routine">שגרתית</option>
                      <option value="repair">תיקון</option>
                      <option value="inspection">בדיקה</option>
                      <option value="emergency">חירום</option>
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
                </div>

                <div className="form-group">
                  <label className="form-label">תיאור</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="תיאור העבודה שבוצעה..."
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">בוצע על ידי</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.performed_by}
                      onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                      placeholder="שם המבצע"
                      autoComplete="name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">עלות (₪)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0.00"
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
                  {editingRecord ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Maintenance;
