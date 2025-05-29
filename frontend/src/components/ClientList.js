import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaSort, FaFilter, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClientForm from './ClientForm'; // Importez votre composant ClientForm
import '../styles/ClientList.css';
import '../styles/Modal.css'; // Créez ce fichier CSS pour les styles modaux

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'ascending' });
  const [filters, setFilters] = useState({
    formeJuridique: '',
    manager: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueFormeJuridique, setUniqueFormeJuridique] = useState([]);
  const [uniqueManagers, setUniqueManagers] = useState([]);
  
  // États pour les modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...clients];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(client => 
        (client.nom && client.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.siret && client.siret.includes(searchTerm)) ||
        (client.nomCommercial && client.nomCommercial.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply filters
    if (filters.formeJuridique) {
      result = result.filter(client => client.formeJuridique === filters.formeJuridique);
    }
    
    if (filters.manager) {
      result = result.filter(client => client.manager === filters.manager);
    }
    
    // Apply sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredClients(result);
  }, [clients, searchTerm, filters, sortConfig]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/clients');
      console.log('Clients récupérés:', response.data);
      
      setClients(response.data);
      setFilteredClients(response.data);
      
      // Extract unique values for filters
      const formeJuridiqueValues = [...new Set(
        response.data
          .map(client => client.formeJuridique)
          .filter(forme => forme && forme.trim() !== '')
      )];
      
      const managerValues = [...new Set(
        response.data
          .map(client => client.manager)
          .filter(manager => manager && manager.trim() !== '')
      )];
      
      setUniqueFormeJuridique(formeJuridiqueValues);
      setUniqueManagers(managerValues);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      setError('Impossible de charger la liste des clients');
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      try {
        await axios.delete(`http://localhost:5000/api/clients/${clientId}`);
        fetchClients(); // Refresh the list after deletion
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        setError('Impossible de supprimer le client');
      }
    }
  };

  const handleAddNew = () => {
    navigate('/clients/new');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      formeJuridique: '',
      manager: ''
    });
    setSearchTerm('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const handleClientUpdated = () => {
    fetchClients(); // Rafraîchir la liste après mise à jour
    handleCloseModal();
  };

  return (
    <div className="client-list-container">
      <div className="client-list-header">
        <h1>Liste des clients</h1>
        
        <div className="client-list-actions">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <button className="filter-button" onClick={toggleFilters}>
            <FaFilter /> Filtres {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          
          <button className="add-button" onClick={handleAddNew}>
            <FaPlus /> Ajouter un client
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label>Forme juridique</label>
            <select 
              name="formeJuridique" 
              value={filters.formeJuridique}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {uniqueFormeJuridique.map(forme => (
                <option key={forme} value={forme}>{forme}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Manager</label>
            <select 
              name="manager" 
              value={filters.manager}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {uniqueManagers.map(manager => (
                <option key={manager} value={manager}>{manager}</option>
              ))}
            </select>
          </div>
          
          <button className="reset-button" onClick={resetFilters}>
            Réinitialiser
          </button>
        </div>
      )}
      
      {error && <div className="alert alert-error">{error}</div>}
      
      {loading ? (
        <div className="loading">Chargement des clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="no-results">
          <p>Aucun client trouvé</p>
          <button className="add-button" onClick={handleAddNew}>
            <FaPlus /> Ajouter un client
          </button>
        </div>
      ) : (
        <div className="client-table-container">
          <table className="client-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('nom')}>
                  Nom 
                  {sortConfig.key === 'nom' && (
                    sortConfig.direction === 'ascending' ? <FaChevronUp className="sort-icon" /> : <FaChevronDown className="sort-icon" />
                  )}
                </th>
                <th onClick={() => handleSort('formeJuridique')}>
                  Forme juridique
                  {sortConfig.key === 'formeJuridique' && (
                    sortConfig.direction === 'ascending' ? <FaChevronUp className="sort-icon" /> : <FaChevronDown className="sort-icon" />
                  )}
                </th>
                <th onClick={() => handleSort('siret')}>
                  SIRET
                  {sortConfig.key === 'siret' && (
                    sortConfig.direction === 'ascending' ? <FaChevronUp className="sort-icon" /> : <FaChevronDown className="sort-icon" />
                  )}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email
                  {sortConfig.key === 'email' && (
                    sortConfig.direction === 'ascending' ? <FaChevronUp className="sort-icon" /> : <FaChevronDown className="sort-icon" />
                  )}
                </th>
                <th onClick={() => handleSort('manager')}>
                  Manager
                  {sortConfig.key === 'manager' && (
                    sortConfig.direction === 'ascending' ? <FaChevronUp className="sort-icon" /> : <FaChevronDown className="sort-icon" />
                  )}
                </th>
                <th onClick={() => handleSort('dateCreation')}>
                  Date de création
                  {sortConfig.key === 'dateCreation' && (
                    sortConfig.direction === 'ascending' ? <FaChevronUp className="sort-icon" /> : <FaChevronDown className="sort-icon" />
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client._id}>
                  <td>{client.nom || 'Non défini'}</td>
                  <td>{client.formeJuridique || 'Non défini'}</td>
                  <td>{client.siret || 'Non défini'}</td>
                  <td>{client.email || 'Non défini'}</td>
                  <td>{client.manager || 'Non défini'}</td>
                  <td>{formatDate(client.dateCreation)}</td>
                  <td className="actions-cell">
                    <button className="action-button view" onClick={() => handleView(client)} title="Voir les détails">
                      <FaEye />
                    </button>
                    <button className="action-button edit" onClick={() => handleEdit(client)} title="Modifier">
                      <FaEdit />
                    </button>
                    <button className="action-button delete" onClick={() => handleDelete(client._id)} title="Supprimer">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="client-list-footer">
        <p>Total: {filteredClients.length} clients</p>
      </div>

      {/* Modal pour visualiser un client */}
      {showViewModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Détails du client</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="client-details">
                <div className="detail-row">
                  <span className="detail-label">Nom:</span>
                  <span className="detail-value">{selectedClient.nom || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Forme juridique:</span>
                  <span className="detail-value">{selectedClient.formeJuridique || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">SIRET:</span>
                  <span className="detail-value">{selectedClient.siret || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedClient.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Manager:</span>
                  <span className="detail-value">{selectedClient.manager || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date de création:</span>
                  <span className="detail-value">{formatDate(selectedClient.dateCreation)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Adresse siège:</span>
                  <span className="detail-value">{selectedClient.adresseSiege || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Capitale social:</span>
                  <span className="detail-value">{selectedClient.capitaleSocial || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={handleCloseModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour éditer un client */}
      {showEditModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>Modifier le client</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <ClientForm 
                clientData={selectedClient} 
                onSave={handleClientUpdated}
                onCancel={handleCloseModal}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;