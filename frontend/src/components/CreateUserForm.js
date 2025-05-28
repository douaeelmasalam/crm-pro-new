import React, { useState } from 'react';
import '../styles/Userform.css';

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'Actif',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role, status } = formData;

    const userData = { name, email, password, role, status };

    try {
      const response = await fetch('http://localhost:5000/api/users/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Utilisateur créé avec succès');
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user',
          status: 'Actif',
        });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur', error);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Create New User</h2>
      <div className="form-fields">
        <div className="form-group">
          <label className="form-label">Name:</label>
          <input 
            type="text" 
            name="name" 
            placeholder="User name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Email address" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password:</label>
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role:</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="form-select"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Status:</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="form-select"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En attente de validation">En attente de validation</option>
              <option value="Suspendu">Suspendu</option>
              <option value="Supprimé">Supprimé</option>


            </select>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="form-button"
        >
          Create User
        </button>
      </div>
    </div>
  );
};

export default CreateUserForm;
