import React, { useState, useEffect } from 'react';
import '../styles/EditUserForm.css';

const EditUserForm = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'Actif',
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          password: '',
          role: userData.role || 'user',
          status: userData.status || 'Actif',
        });
      } else {
        setMessage({
          text: "Erreur lors de la récupération de l'utilisateur",
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      setMessage({
        text: "Erreur lors de la récupération de l'utilisateur",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = { ...formData };
      if (!userData.password) {
        delete userData.password;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: 'Utilisateur mis à jour avec succès', type: 'success' });
        setTimeout(() => {
          onClose(true);
        }, 1500);
      } else {
        setMessage({
          text: result.message || 'Erreur lors de la mise à jour',
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur", error);
      setMessage({
        text: "Erreur lors de la mise à jour de l'utilisateur",
        type: 'error'
      });
    }
  };

  return (
    <div className="edit-user-modal-overlay">
      <div className="edit-user-modal">
        <div className="edit-user-modal-header">
          <h2 className="edit-user-title">Edit User</h2>
          <button className="close-button" onClick={() => onClose(false)}>×</button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="edit-user-modal-content">
            {message.text && (
              <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="edit-user-form">
              <div className="form-group">
                <label className="form-label">Name:</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current password"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role:</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status:</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En attente de validation">En attente de validation</option>
              <option value="Suspendu">Suspendu</option>
              <option value="Supprimé">Supprimé</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => onClose(false)}>
                  Cancel
                </button>
                <button type="submit" className="form-button">
                  Update User
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUserForm;
