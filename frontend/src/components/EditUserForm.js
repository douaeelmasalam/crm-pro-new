import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EditUserForm = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState({ name: '', email: '', role: 'user' });

  useEffect(() => {
    fetch(`http://localhost:5000/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) =>
        console.error("Erreur lors de la récupération de l'utilisateur :", err)
      );
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
        alert('Utilisateur mis à jour avec succès');
      } else {
        alert(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
    }
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
        <select name="role" value={userData.role} onChange={handleChange}>
          <option value="user">Utilisateur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit">Mettre à jour</button>
    </form>
  );
};

export default EditUserForm;
