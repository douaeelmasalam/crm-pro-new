import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ExportDataForm.css';

const ExportDataForm = ({ exportType, onExportComplete }) => {
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
      console.log('Filtres sélectionnés:', {
        startDate, endDate, status, role, priority, format, exportType
      });

      // Gestion spéciale pour le dashboard
      if (exportType === 'dashboard') {
        await handleDashboardExport();
        return;
      }

      // Pour les autres types d'export (users, clients, prospects, tickets)
      await handleStandardExport();

    } catch (error) {
      handleExportError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardExport = async () => {
    try {
      // Construction de l'URL avec vérification
      let url = `http://localhost:5000/api/export/${exportType}/${format}`;
      const params = [];

      // Pour les utilisateurs, on utilise des filtres spécifiques
      if (exportType === 'users') {
        if (role && role.trim() !== '') {
          params.push(`role=${encodeURIComponent(role)}`);
        }
        if (status && status.trim() !== '') {
          params.push(`status=${encodeURIComponent(status)}`);
        }
      } else {
        // Filtres par date pour les autres types
        if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
        if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
        
        // Filtres spécifiques par type
        if (exportType === 'tickets') {
          if (status) params.push(`status=${encodeURIComponent(status)}`);
          if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
        } else if (exportType === 'clients' || exportType === 'prospects') {
          if (status) params.push(`status=${encodeURIComponent(status)}`);
        }
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      console.log('[DEBUG] URL construite pour export:', url);

      // Test de connexion avant export
      await testServerConnection();
      
      await executeExport(url);

      // Fermer le modal après export réussi
      if (onExportComplete) {
        onExportComplete();
      }

    } catch (error) {
      console.error('[ERREUR EXPORT STANDARD]', error);
      throw error;
    }
  };

  // Nouvelle fonction pour tester la connexion serveur
 const testServerConnection = async () => {
  try {
    const testUrl = 'http://localhost:5000/api/users';
    const token = localStorage.getItem('token');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(testUrl, { 
      headers,
      timeout: 5000 
    });
    
    console.log('[TEST CONNEXION] Serveur accessible, nombre d\'utilisateurs:', response.data?.length || 0);
    
    // Ne pas lancer d'erreur si aucun utilisateur - c'est normal
    return true;
    
  } catch (error) {
    console.error('[TEST CONNEXION ÉCHOUÉ]', error);
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 5000.');
    }
    if (error.response?.status === 404) {
      throw new Error('L\'endpoint /api/users n\'existe pas sur le serveur.');
    }
    throw error;
  }
};

const executeExport = async (url) => {
  const token = localStorage.getItem('token');
  
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    if (format === 'json') {
      // Export JSON
      const response = await axios({
        url,
        method: 'GET',
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('[DEBUG] Réponse JSON reçue:', response.data);

      let dataToExport = response.data;
      
      // Gestion des différents formats de réponse
      if (response.data && response.data.data) {
        dataToExport = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        dataToExport = response.data;
      }

      if (!dataToExport || (Array.isArray(dataToExport) && dataToExport.length === 0)) {
        toast.warning('Aucune donnée trouvée pour les critères sélectionnés');
        return;
      }

      const jsonData = JSON.stringify(dataToExport, null, 2);
      downloadFile(jsonData, 'application/json', `${exportType}_export_${Date.now()}.json`);

    } else {
      // Export CSV/Excel
      console.log('[DEBUG] Tentative d\'export en format:', format);
      
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'blob',
        headers: {
          ...headers,
          'Accept': format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel'
        },
        timeout: 30000
      });

      console.log('[DEBUG] Réponse blob reçue, taille:', response.data?.size);

      if (!response.data || response.data.size === 0) {
        toast.warning('Aucune donnée trouvée dans le fichier exporté');
        return;
      }

      // Vérifier si on a reçu une erreur JSON au lieu d'un fichier
      const contentType = response.headers['content-type'];
      console.log('[DEBUG] Content-Type reçu:', contentType);

      if (contentType && contentType.includes('application/json')) {
        // Convertir le blob en texte pour lire l'erreur
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Erreur du serveur');
        } catch (parseError) {
          throw new Error('Erreur de format de réponse du serveur');
        }
      }

      // Télécharger le fichier
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${exportType}_export_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    }

    toast.success(`Exportation ${format.toUpperCase()} réussie !`);
    
  } catch (error) {
    console.error('[ERREUR EXECUTE EXPORT]', error);
    
    // Gestion spéciale des erreurs de réponse
    if (error.response) {
      const status = error.response.status;
      console.log('[DEBUG] Status de l\'erreur:', status);
      
      if (status === 404) {
        throw new Error(`L'endpoint d'export /api/export/${exportType}/${format} n'existe pas sur le serveur.`);
      } else if (status === 500) {
        // Pour les erreurs 500, essayer de lire le message
        let errorMessage = 'Erreur interne du serveur lors de l\'export';
        if (error.response.data) {
          try {
            if (error.response.data instanceof Blob) {
              const text = await error.response.data.text();
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorMessage;
            } else if (typeof error.response.data === 'object') {
              errorMessage = error.response.data.message || errorMessage;
            }
          } catch {
            // Ignore parsing errors, use default message
          }
        }
        throw new Error(errorMessage);
      } else if (status === 401) {
        throw new Error('Non autorisé - veuillez vous reconnecter');
      } else if (status === 403) {
        throw new Error('Accès refusé - permissions insuffisantes');
      }
    }
    
    throw error;
  }
};
  const handleDashboardExport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Récupérer toutes les données nécessaires pour le dashboard
      console.log('[DEBUG] Récupération des données pour le dashboard...');
      
      const [prospectsRes, clientsRes, usersRes, ticketsRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/prospects', { headers }),
        axios.get('http://localhost:5000/api/clients', { headers }),
        axios.get('http://localhost:5000/api/users', { headers }),
        axios.get('http://localhost:5000/api/tickets', { headers })
      ]);

      // Traiter les résultats
      const prospects = prospectsRes.status === 'fulfilled' ? prospectsRes.value.data : [];
      const clients = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];
      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const tickets = ticketsRes.status === 'fulfilled' ? ticketsRes.value.data : [];

      // Filtrer par date si nécessaire
      let filteredTickets = tickets;
      if (startDate || endDate) {
        filteredTickets = tickets.filter(ticket => {
          const ticketDate = new Date(ticket.created_at || ticket.createdAt);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if (start && ticketDate < start) return false;
          if (end && ticketDate > end) return false;
          return true;
        });
      }

      // Calculer les statistiques
      const dashboardData = {
        summary: {
          totalUsers: users.length,
          totalClients: clients.length,
          totalProspects: prospects.length,
          totalTickets: filteredTickets.length,
          ticketsOuverts: filteredTickets.filter(t => t.status?.toLowerCase() === 'ouvert').length,
          ticketsEnCours: filteredTickets.filter(t => t.status?.toLowerCase() === 'en cours').length,
          ticketsResolus: filteredTickets.filter(t => t.status?.toLowerCase() === 'résolu').length,
          ticketsFermes: filteredTickets.filter(t => t.status?.toLowerCase() === 'fermé').length,
        },
        exportDate: new Date().toISOString(),
        dateRange: {
          startDate: startDate || 'Toutes les dates',
          endDate: endDate || 'Toutes les dates'
        }
      };

      if (format === 'json') {
        // Export JSON avec toutes les données
        const fullData = {
          dashboardSummary: dashboardData,
          detailedData: {
            users: users,
            clients: clients,
            prospects: prospects,
            tickets: filteredTickets
          }
        };
        
        const jsonData = JSON.stringify(fullData, null, 2);
        downloadFile(jsonData, 'application/json', `dashboard_export_${Date.now()}.json`);
      } else {
        // Export CSV/Excel avec résumé
        const csvData = convertDashboardToCSV(dashboardData, users, clients, prospects, filteredTickets);
        const mimeType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        downloadFile(csvData, mimeType, `dashboard_export_${Date.now()}.${format}`);
      }

      toast.success(`Export du dashboard ${format.toUpperCase()} réussi`);

      // Fermer le modal après export réussi
      if (onExportComplete) {
        onExportComplete();
      }

    } catch (error) {
      console.error('[ERREUR DASHBOARD EXPORT]', error);
      throw error;
    }
  };

  const convertDashboardToCSV = (dashboardData, users, clients, prospects, tickets) => {
    const lines = [];
    
    // En-tête du rapport
    lines.push('RAPPORT DASHBOARD CRM');
    lines.push(`Date d'export,${new Date().toLocaleDateString()}`);
    lines.push(`Période,${dashboardData.dateRange.startDate} - ${dashboardData.dateRange.endDate}`);
    lines.push('');
    
    // Statistiques générales
    lines.push('STATISTIQUES GÉNÉRALES');
    lines.push('Métrique,Valeur');
    lines.push(`Nombre d'utilisateurs,${dashboardData.summary.totalUsers}`);
    lines.push(`Nombre de clients,${dashboardData.summary.totalClients}`);
    lines.push(`Nombre de prospects,${dashboardData.summary.totalProspects}`);
    lines.push(`Total tickets,${dashboardData.summary.totalTickets}`);
    lines.push(`Tickets ouverts,${dashboardData.summary.ticketsOuverts}`);
    lines.push(`Tickets en cours,${dashboardData.summary.ticketsEnCours}`);
    lines.push(`Tickets résolus,${dashboardData.summary.ticketsResolus}`);
    lines.push(`Tickets fermés,${dashboardData.summary.ticketsFermes}`);
    lines.push('');

    // Détail des tickets si filtré par date
    if (tickets.length > 0) {
      lines.push('DÉTAIL DES TICKETS');
      lines.push('ID,Titre,Statut,Priorité,Client,Date de création');
      tickets.forEach(ticket => {
        const row = [
          ticket.id || ticket._id || '',
          `"${(ticket.title || ticket.titre || '').replace(/"/g, '""')}"`,
          ticket.status || '',
          ticket.priority || ticket.priorite || '',
          ticket.client_name || ticket.clientName || '',
          ticket.created_at || ticket.createdAt || ''
        ];
        lines.push(row.join(','));
      });
    }

    return lines.join('\n');
  };

  const downloadFile = (data, mimeType, filename) => {
    const blob = new Blob([data], { type: mimeType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleExportError = (error) => {
    console.error('[ERREUR EXPORT]', error);

    let errorMessage = 'Erreur inconnue';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      console.error('[ERREUR RÉPONSE SERVEUR]', status, data);

      if (status === 404) {
        errorMessage = data?.message || `L'endpoint d'export pour ${exportType} n'existe pas. Vérifiez que la route API /api/export/${exportType}/${format} est définie sur votre serveur.`;
      } else if (status === 401) {
        errorMessage = 'Non autorisé - veuillez vous reconnecter';
      } else if (status === 403) {
        errorMessage = 'Accès refusé - permissions insuffisantes';
      } else if (status === 500) {
        errorMessage = data?.message || 'Erreur interne du serveur lors de l\'export';
      } else {
        errorMessage = `Erreur ${status}: ${data?.message || error.response.statusText}`;
      }

    } else if (error.request) {
      console.error('[ERREUR AUCUNE RÉPONSE]', error.request);
      errorMessage = 'Aucune réponse du serveur - vérifiez que votre serveur backend est démarré et accessible';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'La requête a expiré (timeout) - le serveur met trop de temps à répondre';
    } else {
      errorMessage = error.message;
    }

    toast.error(`Erreur d'exportation: ${errorMessage}`);
  };

  const getExportTypeLabel = () => {
    switch (exportType) {
      case 'users': return 'utilisateurs';
      case 'clients': return 'clients';
      case 'prospects': return 'prospects';
      case 'tickets': return 'tickets';
      case 'dashboard': return 'données du dashboard';
      default: return exportType;
    }
  };

  return (
    <div className="export-form">
      <h3>Exporter les {getExportTypeLabel()}</h3>
      
      <div className="export-form-grid">
        <div className="form-group">
          <label className="form-label">Format d'exportation</label>
          <select
            className="form-select"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="csv">CSV (Comma Separated Values)</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="json">JSON (JavaScript Object Notation)</option>
          </select>
        </div>
        
        {/* Filtres de date - afficher pour tous sauf users */}
        {exportType !== 'users' && (
          <>
            <div className="form-group">
              <label className="form-label">Date de début</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Filtrer à partir de cette date"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date de fin</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Filtrer jusqu'à cette date"
              />
            </div>
          </>
        )}
        
        {/* Filtres pour les utilisateurs */}
        {exportType === 'users' && (
          <>
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En attente de validation">En attente de validation</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Supprimé">Supprimé</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Rôle</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Tous les rôles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </>
        )}
        
        {/* Filtres pour clients et prospects */}
        {(exportType === 'clients' || exportType === 'prospects') && (
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {exportType === 'clients' ? (
                <>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </>
              ) : (
                <>
                  <option value="nouveau">Nouveau</option>
                  <option value="contacté">Contacté</option>
                  <option value="qualifié">Qualifié</option>
                  <option value="non_qualifié">Non qualifié</option>
                  <option value="converti">Converti</option>
                </>
              )}
            </select>
          </div>
        )}
        
        {/* Filtres pour tickets */}
        {exportType === 'tickets' && (
          <>
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="ouvert">Ouvert</option>
                <option value="en_cours">En cours</option>
                <option value="résolu">Résolu</option>
                <option value="fermé">Fermé</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Priorité</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">Toutes les priorités</option>
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </>
        )}
      </div>
      
      <div className="export-form-actions">
        <button
          className="export-button primary"
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Exportation en cours...
            </>
          ) : (
            `Exporter ${getExportTypeLabel()}`
          )}
        </button>
        
        {onExportComplete && (
          <button
            className="export-button secondary"
            onClick={onExportComplete}
            disabled={loading}
          >
            Annuler
          </button>
        )}
      </div>
      
      {/* Informations sur l'export */}
      <div className="export-info">
        <p className="export-info-text">
          <strong>Format sélectionné:</strong> {format.toUpperCase()}
        </p>
        {(startDate || endDate) && exportType !== 'users' && (
          <p className="export-info-text">
            <strong>Période:</strong> {startDate || 'Début'} → {endDate || 'Fin'}
          </p>
        )}
        {status && (
          <p className="export-info-text">
            <strong>Statut filtré:</strong> {status}
          </p>
        )}
        {role && exportType === 'users' && (
          <p className="export-info-text">
            <strong>Rôle filtré:</strong> {role}
          </p>
        )}
        {priority && exportType === 'tickets' && (
          <p className="export-info-text">
            <strong>Priorité filtrée:</strong> {priority}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExportDataForm;