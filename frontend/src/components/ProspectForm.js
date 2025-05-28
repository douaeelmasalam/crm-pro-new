import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import '../styles/ProspectForm.css';
import axios from 'axios';
import ExportDataForm from './ExportDataForm';

const API_URL = 'http://localhost:5000/api';

const ProspectForm = ({ onProspectUpdated }) => {
  // Liste de prospects
  const [prospects, setProspects] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    societe: '',
    email: '',
    telephone: '',
    origine: 'Cold Call',
    gestionnaire: '',
    statut: 'Nouveau'
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal component pour l'export
  const ExportModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Exporter les prospects</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <ExportDataForm exportType="prospects" />
          </div>
        </div>
      </div>
    );
  };

  // Charger les prospects au chargement du composant
  useEffect(() => {
    fetchProspects();
  }, []);

  // Fonction pour récupérer les prospects depuis l'API
  const fetchProspects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await axios.get(`${API_URL}/prospects`, { headers });
      setProspects(res.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des prospects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      if (editingId) {
        // Mise à jour d'un prospect existant
        await axios.put(`${API_URL}/prospects/${editingId}`, formData, { headers });
      } else {
        // Ajout d'un nouveau prospect
        await axios.post(`${API_URL}/prospects`, formData, { headers });
      }
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        societe: '',
        email: '',
        telephone: '',
        origine: 'Cold Call',
        gestionnaire: '',
        statut: 'Nouveau'
      });
      
      setEditingId(null);
      setShowForm(false);
      
      // Recharger les prospects
      fetchProspects();
      
      if (onProspectUpdated) onProspectUpdated();
      
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du prospect');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prospect) => {
    setFormData({
      nom: prospect.nom,
      societe: prospect.societe,
      email: prospect.email,
      telephone: prospect.telephone,
      origine: prospect.origine,
      gestionnaire: prospect.gestionnaire,
      statut: prospect.statut
    });
    setEditingId(prospect._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        console.log('Attempting to delete:', `${API_URL}/prospects/${id}`);
        await axios.delete(`${API_URL}/prospects/${id}`, { headers });
        
        fetchProspects();
        setError(null);
      } catch (err) {
        console.error('Delete error details:', err.response?.data || err.message);
        setError('Erreur lors de la suppression du prospect');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  return (
    <div className="prospect-container">
      <div className="prospect-header">
        <h2>Liste des Prospects</h2>
        <div className="prospect-header-actions">
          <button 
            className="export-prospects-btn"
            onClick={handleExportClick}
            style={{
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '10px',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
          >
            <FaDownload /> Exporter Prospects
          </button>
          <button className="add-prospect-btn" onClick={() => setShowForm(true)}>
            Ajouter un Prospect
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="prospect-form-container">
          <form onSubmit={handleSubmit} className="prospect-form">
            <h3>{editingId ? 'Modifier le Prospect' : 'Nouveau Prospect'}</h3>
            
            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="societe">Société</label>
              <input
                type="text"
                id="societe"
                name="societe"
                value={formData.societe}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="origine">Origine</label>
              <select
                id="origine"
                name="origine"
                value={formData.origine}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner une origine --</option>
                <option value="Site web Miacorp">Site web Miacorp</option>
                <option value="Campagne e-mailing">Campagne e-mailing</option>
                <option value="Réseaux sociaux">Réseaux sociaux</option>
                <option value="Salon professionnel">Salon professionnel</option>
                <option value="Prospection directe">Prospection directe</option>
                <option value="Publicité en ligne">Publicité en ligne</option>
                <option value="Client existant">Client existant</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="gestionnaire">Gestionnaire</label>
              <select
                id="gestionnaire"
                name="gestionnaire"
                value={formData.gestionnaire}
                onChange={handleChange}
              >
                <option value="">Sélectionnez un gestionnaire</option>
                <option value="adm douae">adm douae</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="statut">Statut du Prospect</label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
              >
                <option value="Nouveau">Nouveau</option>
                <option value="En cours">En cours</option>
                <option value="Qualifié">Qualifié</option>
                <option value="Proposition">Proposition</option>
                <option value="Négociation">Négociation</option>
                <option value="Gagné">Gagné</option>
                <option value="Perdu">Perdu</option>
              </select>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Chargement...' : (editingId ? 'Mettre à jour' : 'Enregistrer')}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    nom: '',
                    societe: '',
                    email: '',
                    telephone: '',
                    origine: 'Cold Call',
                    gestionnaire: '',
                    statut: 'Nouveau'
                  });
                }}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : prospects.length === 0 ? (
        <div className="no-prospects">
          <p>Aucun prospect n'est disponible. Cliquez sur "Ajouter un Prospect" pour commencer.</p>
        </div>
      ) : (
        <div className="prospect-table-container">
          <table className="prospect-table">
            <thead>
              <tr>
                <th>Nom Prospect</th>
                <th>Société</th>
                <th>E-mail</th>
                <th>Téléphone</th>
                <th>Origine du Prospect</th>
                <th>Gestionnaire</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((prospect) => (
                <tr key={prospect._id}>
                  <td>{prospect.nom}</td>
                  <td>{prospect.societe}</td>
                  <td>{prospect.email}</td>
                  <td>{prospect.telephone}</td>
                  <td>{prospect.origine}</td>
                  <td>{prospect.gestionnaire}</td>
                  <td>
                    <span className={`status-badge status-${prospect.statut.toLowerCase().replace(' ', '-')}`}>
                      {prospect.statut}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(prospect)}
                    >
                      Éditer
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(prospect._id)}
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

      {/* Modal d'export */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={handleCloseExportModal} 
      />
    </div>
  );
};

export default ProspectForm;