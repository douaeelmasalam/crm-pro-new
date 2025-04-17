import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EditUserForm.css';

const EditUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => setUserData({ ...data, password: '' }))
      .catch((err) => {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        setMessage({ 
          text: "Erreur lors de la récupération de l'utilisateur", 
          type: 'error' 
        });
      });
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage({ text: 'Utilisateur mis à jour avec succès', type: 'success' });
        setTimeout(() => {
          navigate('/admin/dashboard', { state: { activeSection: 'users' } });
        }, 1500);
      } else {
        setMessage({ 
          text: result.message || 'Erreur lors de la mise à jour', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      setMessage({ 
        text: 'Erreur lors de la mise à jour de l\'utilisateur', 
        type: 'error' 
      });
    }
  };
  
  return (
    <div className="user-form">
      <h2 className="edit-user-title">Modifier l'utilisateur</h2>
      
      {message.text && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom :</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={userData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email :</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Rôle :</label>
          <select 
            name="role" 
            className="form-control"
            value={userData.role} 
            onChange={handleChange}
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Mot de passe :</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={userData.password}
            onChange={handleChange}
            placeholder="Laissez vide pour conserver le mot de passe actuel"
          />
        </div>
        
        <button type="submit" className="btn-update">Mettre à jour</button>
      </form>
    </div>
  );
};

export default EditUserForm;