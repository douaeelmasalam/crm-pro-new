import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientAPI } from '../services/api';
import '../styles/ClientsList.css';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientAPI.getClients();
        setClients(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching clients');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      try {
        await clientAPI.deleteClient(id);
        setClients(clients.filter(client => client._id !== id));
      } catch (err) {
        setError(err.message || 'Error deleting client');
      }
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="clients-list-container">
      <div className="clients-header">
        <h2>Liste des Clients</h2>
        <Link to="/clients/create" className="btn-add">
          Ajouter un Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p>Aucun client trouvé.</p>
      ) : (
        <div className="table-responsive">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>SIRET</th>
                <th>Statut Juridique</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.clientContactName || '—'}</td>
                  <td>{client.clientEmail}</td>
                  <td>{client.clientPhone || '—'}</td>
                  <td>{client.siretNumber}</td>
                  <td>{client.legalStatus}</td>
                  <td className="actions-cell">
                    <Link to={`/clients/view/${client._id}`} className="btn-view">
                      Voir
                    </Link>
                    <Link to={`/clients/edit/${client._id}`} className="btn-edit">
                      Modifier
                    </Link>
                    <button 
                      onClick={() => handleDelete(client._id)} 
                      className="btn-delete"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientsList;