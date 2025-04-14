import React, { useState } from 'react';

const CreateUserForm = () => {
  // Déclaration des états
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });

  // Gestion des changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création');
      }

      alert('Utilisateur créé avec succès!');
      setFormData({ email: '', password: '', role: 'user' });
      
    } catch (error) {
      alert(error.message);
      console.error('Erreur:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <br />
      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <br />
      <select 
        name="role" 
        value={formData.role} 
        onChange={handleChange}
      >
        <option value="user">Utilisateur</option>
        <option value="admin">Admin</option>
      </select>
      <br />
      <button type="submit">Créer Utilisateur</button>
    </form>
  );
};

export default CreateUserForm;