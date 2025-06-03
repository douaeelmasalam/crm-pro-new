import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash , FaPlus, FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaTimes, FaSave, FaDownload, FaFileExcel, FaFileCsv, FaFileCode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ClientList.css';
import '../styles/Modal.css';

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

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // États pour l'exportation
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: '',
    startDate: '',
    endDate: ''
  });

  const initialClientData = {
    // Informations de base
    nom: '',
    email: '',
    formeJuridique: '',
    nomCommercial: '',
    numeroRCS: '',
    siret: '',
    codeAPE: '',
    nomPrenom: '',
    dateCreation: '',
    manager: '',
    adresseSiege: '',
    capitaleSocial: '',
    dateCloture: '',
    inscriptionRM: '',
    
    // Fiche client
    paie: false,
    datePremierBilan: '',
    dateDebutMission: '',
    dateCulture: '',
    regimeTVA: 'Réel normal',
    regimeIS: 'Réel normal',
    jourTVA: '',
    typeTVA: 'Débit',
    dateContrat: '',
    dateContratCN2C: '',
    compteFiscale: false,
    
    // Bilan
    regimeTVABilan: 'Réel normal',
    regimeISBilan: 'Réel normal',
    dateDebut: '',
    dateFin: '',
    dateEcheance: '',
    totalieBilan: '',
    chiffreAffaire: '',
    resultat: '',
    
    // Organismes
    nomOrganisme: 'Impôt',
    siteWeb: '',
    login: '',
    motDePasse: '',
    commentaire: ''
  };

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

  // Fonctions d'exportation
  const handleExport = (format) => {
    setShowExportModal(false);
    setExportLoading(true);
    
    const queryParams = new URLSearchParams();
    
    // Ajouter les filtres d'exportation
    if (exportFilters.status) queryParams.append('status', exportFilters.status);
    if (exportFilters.startDate) queryParams.append('startDate', exportFilters.startDate);
    if (exportFilters.endDate) queryParams.append('endDate', exportFilters.endDate);
    
    const url = `http://localhost:5000/api/export/clients/${format}?${queryParams.toString()}`;
    
    // Créer un lien temporaire pour télécharger le fichier
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients_export_${new Date().toISOString().split('T')[0]}.${format}`;
    
    // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Simuler un délai pour l'UX
    setTimeout(() => {
      setExportLoading(false);
    }, 2000);
  };

  const handleExportFilterChange = (e) => {
    const { name, value } = e.target;
    setExportFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

  const handleEdit = (client) => {
    console.log('Client data received:', client);
  setSelectedClient(client);
  
  // Préparer les données avec des valeurs par défaut pour tous les champs
  const fullClientData = {
    // Informations de base
    nom: client.nom || '',
    email: client.email || '',
    formeJuridique: client.formeJuridique || '',
    nomCommercial: client.nomCommercial || '',
    numeroRCS: client.numeroRCS || '',
    siret: client.siret || '',
    codeAPE: client.codeAPE || '',
    nomPrenom: client.nomPrenom || '',
    dateCreation: client.dateCreation || '',
    manager: client.manager || '',
    adresseSiege: client.adresseSiege || '',
    capitaleSocial: client.capitaleSocial || '',
    dateCloture: client.dateCloture || '',
    inscriptionRM: client.inscriptionRM || '',
    
    // Fiche client
    paie: client.paie || false,
    datePremierBilan: client.datePremierBilan || '',
    dateDebutMission: client.dateDebutMission || '',
    dateCulture: client.dateCulture || '',
    regimeTVA: client.regimeTVA || 'Réel normal',
    regimeIS: client.regimeIS || 'Réel normal',
    jourTVA: client.jourTVA || '',
    typeTVA: client.typeTVA || 'Débit',
    dateContrat: client.dateContrat || '',
    dateContratCN2C: client.dateContratCN2C || '',
    compteFiscale: client.compteFiscale || false,
    
    // Bilan
    regimeTVABilan: client.regimeTVABilan || 'Réel normal',
    regimeISBilan: client.regimeISBilan || 'Réel normal',
    dateDebut: client.dateDebut || '',
    dateFin: client.dateFin || '',
    dateEcheance: client.dateEcheance || '',
    totalieBilan: client.totalieBilan || '',
    chiffreAffaire: client.chiffreAffaire || '',
    resultat: client.resultat || '',
    
    // Organismes
    nomOrganisme: client.nomOrganisme || 'Impôt',
    siteWeb: client.siteWeb || '',
    login: client.login || '',
    motDePasse: client.motDePasse || '',
    commentaire: client.commentaire || ''
  };
  
  setEditFormData(fullClientData);
  setShowEditModal(true);
};

  

  const handleDelete = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      try {
        await axios.delete(`http://localhost:5000/api/clients/${clientId}`);
        fetchClients();
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowExportModal(false);
    setSelectedClient(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveClient = async () => {
    try {
      await axios.put(`http://localhost:5000/api/clients/${selectedClient._id}`, editFormData);
      fetchClients();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      setError('Impossible de mettre à jour le client');
    }
  };

  const renderFormField = (label, name, type = 'text', options = null) => {
    const value = editFormData[name] || '';
    
    return (
      <div className="form-group">
        <label>{label}</label>
        {type === 'select' && options ? (
          <select name={name} value={value} onChange={handleInputChange}>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : type === 'checkbox' ? (
          <input
            type="checkbox"
            name={name}
            checked={value}
            onChange={handleInputChange}
          />
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={handleInputChange}
            rows="4"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={type === 'date' ? formatDate(value) : value}
            onChange={handleInputChange}
          />
        )}
      </div>
    );
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

          <button className="export-button" onClick={() => setShowExportModal(true)}>
            <FaDownload /> Exporter
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
      
      {exportLoading && (
        <div className="export-loading">
          <p>Exportation en cours...</p>
        </div>
      )}
      
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
                  <td>{formatDisplayDate(client.dateCreation)}</td>
                  <td className="actions-cell">
        
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

      {/* Modal d'exportation */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Exporter les clients</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="export-options">
                <h3>Options d'exportation</h3>
                
                <div className="export-filters">
                  <div className="filter-group">
                    <label>Statut</label>
                    <select 
                      name="status" 
                      value={exportFilters.status}
                      onChange={handleExportFilterChange}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                      <option value="prospect">Prospect</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Date de début</label>
                    <input
                      type="date"
                      name="startDate"
                      value={exportFilters.startDate}
                      onChange={handleExportFilterChange}
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label>Date de fin</label>
                    <input
                      type="date"
                      name="endDate"
                      value={exportFilters.endDate}
                      onChange={handleExportFilterChange}
                    />
                  </div>
                </div>

                <div className="export-formats">
                  <h4>Choisir le format d'export :</h4>
                  
                  <div className="format-buttons">
                    <button 
                      className="format-button csv" 
                      onClick={() => handleExport('csv')}
                      title="Exporter en CSV"
                    >
                      <FaFileCsv /> CSV
                    </button>
                    
                    <button 
                      className="format-button excel" 
                      onClick={() => handleExport('xlsx')}
                      title="Exporter en Excel"
                    >
                      <FaFileExcel /> Excel
                    </button>
                    
                    <button 
                      className="format-button json" 
                      onClick={() => handleExport('json')}
                      title="Exporter en JSON"
                    >
                      <FaFileCode /> JSON
                    </button>
                  </div>
                </div>


              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={handleCloseModal}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Modal pour éditer un client */}
      {showEditModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal extra-large-modal">
            <div className="modal-header">
              <h2>Modifier le client - {selectedClient.nom}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="edit-form">
                <div className="section">
                  <h3>Informations de base</h3>
                  <div className="form-grid">
                    {renderFormField('Nom du client *', 'nom')}
                    {renderFormField('Email *', 'email', 'email')}
                    {renderFormField('Forme juridique', 'formeJuridique')}
                    {renderFormField('Nom commercial', 'nomCommercial')}
                    {renderFormField('Numéro RCS', 'numeroRCS')}
                    {renderFormField('SIRET', 'siret')}
                    {renderFormField('Code APE', 'codeAPE')}
                    {renderFormField('Nom & Prénom', 'nomPrenom')}
                    {renderFormField('Date de création', 'dateCreation', 'date')}
                    {renderFormField('Manager', 'manager')}
                    {renderFormField('Adresse siège', 'adresseSiege', 'textarea')}
                    {renderFormField('Capitale social', 'capitaleSocial')}
                    {renderFormField('Date de clôture', 'dateCloture', 'date')}
                    {renderFormField('Inscription RM', 'inscriptionRM', 'date')}
                  </div>
                </div>

                <div className="section">
                  <h3>Fiche client</h3>
                  <div className="form-grid">
                    {renderFormField('Paie', 'paie', 'checkbox')}
                    {renderFormField('Date premier bilan', 'datePremierBilan', 'date')}
                    {renderFormField('Date début mission', 'dateDebutMission', 'date')}
                    {renderFormField('Date culture', 'dateCulture', 'date')}
                    {renderFormField('Régime TVA', 'regimeTVA', 'select', ['Réel normal', 'Réel simplifié', 'Franchise'])}
                    {renderFormField('Régime IS', 'regimeIS', 'select', ['Réel normal', 'Réel simplifié'])}
                    {renderFormField('Jour TVA', 'jourTVA', 'date')}
                    {renderFormField('Type TVA', 'typeTVA', 'select', ['Débit', 'Encaissement'])}
                    {renderFormField('Date contrat', 'dateContrat', 'date')}
                    {renderFormField('Date contrat CN2C', 'dateContratCN2C', 'date')}
                    {renderFormField('Compte fiscale', 'compteFiscale', 'checkbox')}
                  </div>
                </div>

                <div className="section">
                  <h3>Bilan</h3>
                  <div className="form-grid">
                    {renderFormField('Régime TVA', 'regimeTVABilan', 'select', ['Réel normal', 'Réel simplifié', 'Franchise'])}
                    {renderFormField('Régime IS', 'regimeISBilan', 'select', ['Réel normal', 'Réel simplifié'])}
                    {renderFormField('Date de début', 'dateDebut', 'date')}
                    {renderFormField('Date de fin', 'dateFin','date')}
                    {renderFormField('Date d\'échéance', 'dateEcheance', 'date')}
                    {renderFormField('Totale bilan', 'totalieBilan')}
                    {renderFormField('Chiffre d\'affaire', 'chiffreAffaire')}
                    {renderFormField('Résultat', 'resultat')}
                  </div>
                </div>

                <div className="section">
                  <h3>Organismes</h3>
                  <div className="form-grid">
                    {renderFormField('Nom', 'nomOrganisme', 'select', ['Impôt', 'URSSAF', 'Caisse de retraite', 'Mutuelle'])}
                    {renderFormField('Site web', 'siteWeb', 'url')}
                    {renderFormField('Login', 'login')}
                    {renderFormField('Mot de passe', 'motDePasse', 'password')}
                    {renderFormField('Commentaire', 'commentaire', 'textarea')}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Annuler
              </button>
              <button className="btn-save" onClick={handleSaveClient}>
                <FaSave /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;