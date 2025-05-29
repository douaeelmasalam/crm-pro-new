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
      // DEBUG: Vérification des valeurs de filtre
      console.log('Filtres sélectionnés:', {
        startDate, endDate, status, role, priority, format, exportType
      });

      let url = `http://localhost:5000/api/export/${exportType}/${format}`;
      const params = [];

      // Ajouter les paramètres selon le type d'export
      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
      
      // Pour les utilisateurs, utiliser 'role' au lieu de 'status'
      if (exportType === 'users') {
        if (role) params.push(`role=${encodeURIComponent(role)}`);
      } else {
        if (status) params.push(`status=${encodeURIComponent(status)}`);
      }
      
      if (priority && exportType === 'tickets') {
        params.push(`priority=${encodeURIComponent(priority)}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      console.log('[DEBUG] URL construite:', url);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      if (format === 'json') {
        const response = await axios({
          url,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        console.log('[DEBUG] Réponse JSON reçue:', response.data);

        // Vérifier si la réponse contient des données
        let dataToExport = response.data;
        if (response.data && response.data.data) {
          dataToExport = response.data.data;
        }

        if (!dataToExport || (Array.isArray(dataToExport) && dataToExport.length === 0)) {
          toast.warning('Aucune donnée trouvée');
          return;
        }

        const jsonData = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `${exportType}_export_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        toast.success(`Exportation JSON réussie`);
        return;
      }

      // DEBUG : Début de la requête CSV/XLSX
      console.log('[DEBUG] Envoi requête axios pour format:', format);

      const response = await axios({
        url,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        timeout: 30000
      });

      // DEBUG : Affichage de la taille du blob
      console.log('[DEBUG] Taille du fichier blob reçu:', response.data?.size);
      console.log('[DEBUG] Headers:', response.headers);

      if (!response.data || response.data.size === 0) {
        toast.warning('Aucune donnée trouvée dans le fichier exporté');
        return;
      }

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${exportType}_export_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Exportation ${format.toUpperCase()} réussie`);

    } catch (error) {
      console.error('[ERREUR]', error);

      let errorMessage = 'Erreur inconnue';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        console.error('[ERREUR RÉPONSE SERVEUR]', status, data);

        if (status === 404) {
          errorMessage = data?.message || 'Aucune donnée trouvée';
        } else if (status === 401) {
          errorMessage = 'Non autorisé - veuillez vous reconnecter';
        } else if (status === 500) {
          errorMessage = data?.message || 'Erreur interne du serveur';
        } else {
          errorMessage = `Erreur ${status}: ${data?.message || error.response.statusText}`;
        }

      } else if (error.request) {
        console.error('[ERREUR AUCUNE RÉPONSE]', error.request);
        errorMessage = 'Aucune réponse du serveur';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'La requête a expiré (timeout)';
      } else {
        errorMessage = error.message;
      }

      toast.error(`Erreur: ${errorMessage}`);
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
        
        {/* Dates - afficher pour tous les types d'export sauf users et dashboard */}
        {exportType !== 'users' && exportType !== 'dashboard' && (
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
        
        {/* Pour dashboard seulement */}
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
        
        {/* Pour clients et prospects */}
        {(exportType === 'clients' || exportType === 'prospects') && (
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tous</option>
              {exportType === 'clients' ? (
                <>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </>
              ) : (
                <>
                  <option value="nouveau">Nouveau</option>
                  <option value="contacté">Contacté</option>
                  <option value="qualifié">Qualifié</option>
                  <option value="non_qualifié">Non qualifié</option>
                </>
              )}
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
        
        {/* Pour users - utiliser le filtre role */}
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