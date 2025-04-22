import React, { useEffect, useState } from "react";
import "../styles/UserList.css";

const UserList = ({ onEditUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/users")
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
          fetchUsers(); // Rafraîchir la liste après suppression
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    }
  };

  return (
    <div className="user-list-container">
      <h2 className="header">Users</h2>
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-name-cell">
                    <div className="user-avatar"></div>
                    <div>{user.name}</div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => onEditUser(user._id)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;