import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { FaDownload } from 'react-icons/fa';
import '../styles/UserList.css';
import EditUserForm from './EditUserForm';
import ExportDataForm from '../components/ExportDataForm';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

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

  const toggleExportModal = () => {
    setShowExportModal(!showExportModal);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
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
      
      {/* Modal d'exportation */}
      {showExportModal && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            <div className="export-modal-header">
              <h3 className="export-modal-title">Exporter les utilisateurs</h3>
              <button 
                onClick={handleCloseExportModal} 
                className="export-modal-close"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="export-modal-content">
              <ExportDataForm exportType="users" />
            </div>
          </div>
        </div>
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
          
          {/* Bouton d'exportation */}
          <button 
            onClick={toggleExportModal} 
            className="export-button"
            title="Exporter les utilisateurs"
          >
            <FaDownload />  Exporter  users
          </button>
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
      
      {/* Styles CSS pour le bouton d'exportation et le modal */}
      <style jsx>{`
        .export-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          margin-left: 10px;
        }
        
        .export-button:hover {
          background-color: #388E3C;
        }
        
        /* Styles pour le modal d'exportation */
        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        
        .export-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          animation: modalAppear 0.2s ease-out;
        }
        
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .export-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 0;
        }
        
        .export-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        
        .export-modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          color: #6b7280;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .export-modal-close:hover {
          background-color: #f3f4f6;
          color: #374151;
        }
        
        .export-modal-content {
          padding: 24px;
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .export-modal {
            width: 95%;
            margin: 10px;
          }
          
          .export-modal-header {
            padding: 16px 20px 0 20px;
          }
          
          .export-modal-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserList;