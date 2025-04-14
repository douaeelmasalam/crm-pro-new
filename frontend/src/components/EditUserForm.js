import React, { useState, useEffect } from 'react';

const EditUserForm = ({ match }) => {
  const { id } = match.params;  // Récupère l'ID de l'utilisateur depuis les paramètres de l'URL
  const [userData, setUserData] = useState({ name: '', email: '', role: 'user' });

  // Utilise useEffect pour récupérer les données de l'utilisateur
  useEffect(() => {
    fetch(`http://localhost:5000/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) => console.error('Erreur lors de la récupération de l\'utilisateur :', err));
  }, [id]);  // Récupère les données de l'utilisateur à chaque fois que l'ID change

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedUser = { ...userData }; // Crée une copie de l'utilisateur pour la mise à jour

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });

      const result = await res.json();
      if (res.ok) {
        alert('Utilisateur mis à jour avec succès');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
    }
  };

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nom :</label>
        <input
          type="text"
          name="name"
          value={userData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Rôle :</label>
        <select
          name="role"
          value={userData.role}
          onChange={handleChange}
        >
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit">Mettre à jour</button>
    </form>
  );
};

export default EditUserForm;
