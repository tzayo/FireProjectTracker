import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterQuarter, setFilterQuarter] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'inspection',
    priority: 'medium',
    status: 'pending',
    assigned_to: '',
    due_date: '',
    quarter: '',
    year: new Date().getFullYear(),
    notes: ''
  });

  useEffect(() => {
    loadTasks();
  }, [filterQuarter, filterStatus]);

  const loadTasks = async () => {
    try {
      const params = {};
      if (filterQuarter) params.quarter = filterQuarter;
      if (filterStatus) params.status = filterStatus;
      
      const response = await getTasks(params);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }
      setShowModal(false);
      resetForm();
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      task_type: task.task_type || 'inspection',
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      quarter: task.quarter || '',
      year: task.year || new Date().getFullYear(),
      notes: task.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      try {
        await deleteTask(id);
        loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      task_type: 'inspection',
      priority: 'medium',
      status: 'pending',
      assigned_to: '',
      due_date: '',
      quarter: '',
      year: new Date().getFullYear(),
      notes: ''
    });
    setEditingTask(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-warning">ממתינה</span>,
      in_progress: <span className="badge badge-info">בביצוע</span>,
      completed: <span className="badge badge-success">הושלמה</span>,
      cancelled: <span className="badge badge-gray">בוטלה</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: <span className="badge badge-gray">נמוכה</span>,
      medium: <span className="badge badge-info">בינונית</span>,
      high: <span className="badge badge-warning">גבוהה</span>,
      urgent: <span className="badge badge-danger">דחופה</span>
    };
    return badges[priority] || <span className="badge badge-gray">{priority}</span>;
  };

  const getTaskTypeName = (type) => {
    const types = {
      maintenance: 'תחזוקה',
      inspection: 'בדיקה',
      training: 'אימון',
      quarterly: 'רבעונית'
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
          <h2 className="card-title">ניהול משימות</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + הוסף משימה
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }}>
              רבעון
            </label>
            <select
              className="form-select"
              value={filterQuarter}
              onChange={(e) => setFilterQuarter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="">הכל</option>
              <option value="Q1">רבעון 1</option>
              <option value="Q2">רבעון 2</option>
              <option value="Q3">רבעון 3</option>
              <option value="Q4">רבעון 4</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '600' }}>
              סטטוס
            </label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="">הכל</option>
              <option value="pending">ממתינה</option>
              <option value="in_progress">בביצוע</option>
              <option value="completed">הושלמה</option>
            </select>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <h3 className="empty-state-title">אין משימות</h3>
            <p className="empty-state-description">התחל בהוספת המשימה הראשונה</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>כותרת</th>
                  <th>סוג</th>
                  <th>עדיפות</th>
                  <th>סטטוס</th>
                  <th>מוקצה ל</th>
                  <th>תאריך יעד</th>
                  <th>רבעון</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      {task.description && (
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {task.description.substring(0, 50)}
                          {task.description.length > 50 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td>{getTaskTypeName(task.task_type)}</td>
                    <td>{getPriorityBadge(task.priority)}</td>
                    <td>{getStatusBadge(task.status)}</td>
                    <td>{task.assigned_to || '-'}</td>
                    <td>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}
                    </td>
                    <td>
                      {task.quarter ? (
                        <span className="badge badge-info">
                          {task.quarter} / {task.year}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(task)}
                        >
                          ערוך
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(task.id)}
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
                {editingTask ? 'עריכת משימה' : 'הוספת משימה חדשה'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                  <label className="form-label">תיאור</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="תיאור המשימה..."
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">סוג משימה</label>
                    <select
                      className="form-select"
                      value={formData.task_type}
                      onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                    >
                      <option value="inspection">בדיקה</option>
                      <option value="maintenance">תחזוקה</option>
                      <option value="training">אימון</option>
                      <option value="quarterly">רבעונית</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">עדיפות</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">נמוכה</option>
                      <option value="medium">בינונית</option>
                      <option value="high">גבוהה</option>
                      <option value="urgent">דחופה</option>
                    </select>
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
                      <option value="pending">ממתינה</option>
                      <option value="in_progress">בביצוע</option>
                      <option value="completed">הושלמה</option>
                      <option value="cancelled">בוטלה</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">מוקצה ל</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      placeholder="שם האחראי"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">תאריך יעד</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">רבעון</label>
                    <select
                      className="form-select"
                      value={formData.quarter}
                      onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    >
                      <option value="">לא משוייך</option>
                      <option value="Q1">רבעון 1</option>
                      <option value="Q2">רבעון 2</option>
                      <option value="Q3">רבעון 3</option>
                      <option value="Q4">רבעון 4</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">שנה</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
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
                  {editingTask ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
