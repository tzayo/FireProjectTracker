import React, { useState, useEffect } from 'react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../api';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    leader: '',
    members: '',
    status: 'available',
    phone: ''
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await getTeams();
      setTeams(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]); // Ensure teams is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, formData);
      } else {
        await createTeam(formData);
      }
      setShowModal(false);
      resetForm();
      loadTeams();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      leader: team.leader,
      members: team.members || '',
      status: team.status,
      phone: team.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק צוות זה?')) {
      try {
        await deleteTeam(id);
        loadTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      leader: '',
      members: '',
      status: 'available',
      phone: ''
    });
    setEditingTeam(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: <span className="badge badge-success">זמין</span>,
      on_duty: <span className="badge badge-warning">בשירות</span>,
      unavailable: <span className="badge badge-danger">לא זמין</span>
    };
    return badges[status] || <span className="badge badge-gray">{status}</span>;
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
          <h2 className="card-title">ניהול צוותים</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + הוסף צוות חדש
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">אין צוותים רשומים</h3>
            <p className="empty-state-description">התחל בהוספת הצוות הראשון</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>שם הצוות</th>
                  <th>מפקד</th>
                  <th>חברי צוות</th>
                  <th>סטטוס</th>
                  <th>טלפון</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td><strong>{team.name}</strong></td>
                    <td>{team.leader}</td>
                    <td>{team.members || '-'}</td>
                    <td>{getStatusBadge(team.status)}</td>
                    <td>{team.phone || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(team)}
                        >
                          ערוך
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(team.id)}
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
                {editingTeam ? 'עריכת צוות' : 'הוספת צוות חדש'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">שם הצוות *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">מפקד *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.leader}
                    onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">חברי צוות</label>
                  <textarea
                    className="form-textarea"
                    value={formData.members}
                    onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                    placeholder="רשום שמות חברי הצוות..."
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
                    <option value="on_duty">בשירות</option>
                    <option value="unavailable">לא זמין</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">טלפון</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    autoComplete="tel"
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
                  {editingTeam ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
