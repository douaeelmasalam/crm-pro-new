
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa'; // Retirer FaPlus inutilisé
import { clientService } from '../services/api';
import '../styles/ClientList.css';

const ClientList = ({ onEditClient, onClientDeleted }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nomCommercial');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchClients();
  }, []);

 const fetchClients = async () => {
  setLoading(true); // Assure que loading est true au début
  try {
    const response = await clientService.getAllClients();
    console.log("Clients reçus:", response);
    
    // Extraction des données correctement
    const clientsArray = response && response.data ? response.data : [];
    setClients(clientsArray);
    setError(null); // Réinitialiser les erreurs précédentes
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    setError("Impossible de charger les clients. Veuillez réessayer.");
    setClients([]);
  } finally {
    setLoading(false); // Important : toujours mettre loading à false à la fin
  }
};
// Dans la fonction fetchClients
console.log("Token actuel:", localStorage.getItem('token'));
console.log("Tentative de récupération des clients...");


  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientService.deleteClient(id);
        fetchClients(); // Rafraîchir la liste
        onClientDeleted?.(); // Appel optionnel de la callback
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError(error.message || 'Impossible de supprimer le client');
      }
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (!a[sortField]) return 1;
    if (!b[sortField]) return -1;
    
    const valA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
    const valB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

const filteredClients = sortedClients.filter(client => 
  client.nomCommercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  client.nomPrenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  client.siret?.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className="client-list-container">
      <div className="client-list-header">
        <h3>Liste des clients</h3>
        <div className="client-list-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : (
        <div className="client-table-container">
          {filteredClients.length === 0 ? (
            <div className="no-clients">
              <p>Aucun client trouvé.</p>
            </div>
          ) : (
            <table className="client-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nomCommercial')}>
                    Nom commercial
                    {sortField === 'nomCommercial' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('formeJuridique')}>
                    Forme juridique
                    {sortField === 'formeJuridique' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('siret')}>
                    SIRET
                    {sortField === 'siret' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('nomPrenom')}>
                    Nom & Prénom
                    {sortField === 'nomPrenom' && (
                      <span className="sort-indicator">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.nomCommercial}</td>
                    <td>{client.formeJuridique}</td>
                    <td>{client.siret}</td>
                    <td>{client.nomPrenom || 'N/A'}</td>
                    <td className="client-actions">
                      <button className="btn-edit" onClick={() => onEditClient(client._id)}>
                        <FaEdit />
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(client._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientList;