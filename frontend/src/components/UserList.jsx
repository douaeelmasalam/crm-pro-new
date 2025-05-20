import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import '../styles/UserList.css';
import EditUserForm from './EditUserForm';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => {
        const enhancedData = data.map(user => ({
          ...user,
          status: user.status || "Actif",
        }));
        setUsers(enhancedData);
      })
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
          fetchUsers();
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    }
  };

  const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setShowEditModal(true);
  };

  const handleCloseModal = (wasUpdated) => {
    setShowEditModal(false);
    setSelectedUserId(null);
    
    if (wasUpdated) {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Actif": return "status-Actif";
      case "Inactif": return "status-Inactif";
      case "En attente de validation": return "status-En attente de validation";
      case "Suspendu": return "status-Suspendu";
      case "Supprimé": return "status-Supprimé";

      default: return "status-default";
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const getAvatarClass = (name) => {
    const initial = getInitial(name);
    const colors = ["avatar-blue", "avatar-pink", "avatar-purple", "avatar-gray"];
    const index = initial.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="user-list-container">
      {showEditModal && (
        <EditUserForm 
          userId={selectedUserId} 
          onClose={handleCloseModal} 
        />
      )}
      
      <div className="user-list-header">
        <h2 className="user-list-title">Users</h2>
        
        <div className="user-list-controls">
          <div className="search-container">
            <div className="search-icon">
              <Search size={18} className="search-icon-svg" />
            </div>
            <input
              type="text"
              placeholder="Search users"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-container">
            <span className="filter-label">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="En attente de validation">En attente de validation</option>
              <option value="Suspendu">Suspendu</option>
              <option value="Supprimé">Supprimé</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="user-table">
          <thead className="table-header">
            <tr>
              <th><input type="checkbox" className="checkbox" /></th>
              <th>Full Name</th>
              <th>Status</th>
              <th>Role</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td><input type="checkbox" className="checkbox" /></td>
                <td>
                  <div className="user-info">
                    {user.photoUrl ? (
                      <img className="user-avatar" src={user.photoUrl} alt="" />
                    ) : (
                      <div className={`user-avatar-placeholder ${getAvatarClass(user.name)}`}>
                        <span className="avatar-initial">{getInitial(user.name)}</span>
                      </div>
                    )}
                    <div className="user-name-container">
                      <div className="user-name">{user.name}</div>
                      {user.verified && (
                        <span className="verified-badge">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="status-container">
                    <div className={`status-indicator ${getStatusClass(user.status)}`}></div>
                    <span className="status-text">{user.status}</span>
                  </div>
                </td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td className="table-actions">
                  <button onClick={() => handleEditUser(user._id)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(user._id)} className="delete-button">Delete</button>
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
