import React, { useEffect, useState } from "react";
import "./UserList.css"; // Import du style CSS pour personnaliser

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/users") // Remplacer par l'URL complète
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) =>
        console.error("Erreur lors du fetch des utilisateurs :", err)
      );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Es-tu sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          fetchUsers(); // Mise à jour de la liste après suppression
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    }
  };

  const handleEdit = (id) => {
    console.log("Redirection vers /admin/edit-user/" + id);
    window.location.href = `/admin/edit-user/${id}`;
  };

  return (
    <div className="user-list-container">
      <h2 className="header">Liste des utilisateurs</h2>
      <div className="user-grid">
        {users.map((user) => (
          <div className="user-card" key={user._id}>
            <h3 className="user-name">{user.name}</h3>
            <p className="user-email">Email: {user.email}</p>
            <p className="user-role">Rôle: {user.role}</p>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(user._id)}>
                Éditer
              </button>
              <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
