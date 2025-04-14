import React, { useState } from 'react';

const CreateUserForm = () => {
  // Déclaration des états pour chaque champ
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Fonction pour gérer les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    const userData = {
      name,
      email,
      password,
      role,
    };

    try {
      const response = await fetch('http://localhost:5000/api/users/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Utilisateur créé avec succès');
        // Réinitialisation du formulaire après soumission
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user',
        });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nom :</label>
        <input
          type="text"
          name="name"
          placeholder="Nom de l'utilisateur"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email :</label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Mot de passe :</label>
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Rôle :</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="user">user</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit">Créer l'utilisateur</button>
    </form>
  );
};

export default CreateUserForm;
