import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ExportDataForm.css';


const ExportDataForm = ({ exportType }) => {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [priority, setPriority] = useState('');

  const handleExport = async () => {
    setLoading(true);
    try {
      // Construction de l'URL avec les paramètres
      let url = `http://localhost:5000/api/export/${exportType}/${format}?`;
      const params = [];
      
      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
      if (status) params.push(`status=${encodeURIComponent(status)}`);
      if (role) params.push(`role=${encodeURIComponent(role)}`);
      if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
      
      url += params.join('&');
      
      console.log('URL de requête:', url); // Debug
      
      // Pour JSON, traitement spécial
      if (format === 'json') {
        const response = await axios({
          url,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Réponse JSON:', response.data); // Debug
        
        // Créer un fichier JSON téléchargeable
        const jsonData = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${exportType}_export.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        
        toast?.success(`Exportation JSON réussie`) || alert(`Exportation JSON réussie`);
        return;
      }
      
      // Téléchargement via Blob pour CSV et XLSX
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Vérifier le type de contenu de la réponse
      const contentType = response.headers['content-type'];
      console.log('Content-Type:', contentType); // Debug
      
      // Création du lien de téléchargement
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${exportType}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast?.success(`Exportation ${format.toUpperCase()} réussie`) || alert(`Exportation ${format.toUpperCase()} réussie`);
    } catch (error) {
      console.error(`Erreur lors de l'exportation:`, error);
      
      // Afficher plus de détails sur l'erreur
      let errorMessage = 'Erreur inconnue';
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
        console.log('Détails de l\'erreur:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      } else {
        errorMessage = error.message;
      }
      
      toast?.error(`Erreur lors de l'exportation: ${errorMessage}`) || alert(`Erreur lors de l'exportation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-form">
      <h3>Exporter les {exportType}</h3>
      
      <div className="export-form-grid">
        <div className="form-group">
          <label className="form-label">Format</label>
          <select
            className="form-select"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="json">JSON</option>
          </select>
        </div>
        
        {/* Dates - afficher pour tous les types d'export sauf si c'est dashboard */}
        {exportType !== 'dashboard' && (
          <>
            <div className="form-group">
              <label className="form-label">Date de début</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date de fin</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}
        
        {/* Pour Dashboard, n'afficher que les dates */}
        {exportType === 'dashboard' && (
          <>
            <div className="form-group">
              <label className="form-label">Date de début</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date de fin</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}
        
        {/* Pour clients */}
        {exportType === 'clients' && (
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        )}
        
        {/* Pour tickets */}
        {exportType === 'tickets' && (
          <>
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="ouvert">Ouvert</option>
                <option value="fermé">Fermé</option>
                <option value="en_cours">En cours</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Priorité</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">Toutes</option>
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </>
        )}
        
        {/* Pour users */}
        {exportType === 'users' && (
          <div className="form-group">
            <label className="form-label">Rôle</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="admin">Admin</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
        )}
      </div>

      {/* Pour prospects */}
{exportType === 'prospects' && (
  <div className="form-group">
    <label className="form-label">Statut</label>
    <select
      className="form-select"
      value={status}
      onChange={(e) => setStatus(e.target.value)}
    >
      <option value="">Tous</option>
      <option value="nouveau">Nouveau</option>
      <option value="contacté">Contacté</option>
      <option value="qualifié">Qualifié</option>
      <option value="non_qualifié">Non qualifié</option>
    </select>
  </div>
)}

      
      <button
        className="export-button"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? 'Exportation en cours...' : 'Exporter'}
      </button>
    </div>
  );
};

export default ExportDataForm;