import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper pour formater les dates
const formatDatesForAPI = (data) => {
  if (!data || typeof data !== 'object') return data;

  const formatDateFields = (obj, fields) => {
    fields.forEach(field => {
      if (obj[field] instanceof Date) {
        obj[field] = obj[field].toISOString();
      }
    });
  };

  const formattedData = { ...data };
  
  // Champs de date principaux
  formatDateFields(formattedData, ['dateCreation', 'dateCloture', 'inscriptionRM']);

  // Fiche client
  if (formattedData.ficheClient) {
    formatDateFields(formattedData.ficheClient, [
      'datePremierBilan', 'dateDebutMission', 'dateCulture',
      'jourTVA', 'dateContrat', 'dateContratCN2C'
    ]);
  }

  // Bilans
  if (Array.isArray(formattedData.bilans)) {
    formattedData.bilans = formattedData.bilans.map(bilan => {
      const formattedBilan = { ...bilan };
      formatDateFields(formattedBilan, ['dateDebut', 'dateFin', 'dateEcheance']);
      return formattedBilan;
    });
  }

  return formattedData;
};

// Configuration Axios
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Gestion des erreurs
api.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response || {};
    
    if (status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('unauthorized'));
    }

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Erreur inconnue';
    
    const apiError = new Error(errorMessage);
    apiError.status = status;
    apiError.data = error.response?.data;
    throw apiError;
  }
);

// Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('logout'));
  },
  isAuthenticated: () => !!localStorage.getItem('token')
};

export const clientService = {
  getAllClients: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  getClientById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  createClient: async (clientData) => {
    const formattedData = formatDatesForAPI(clientData);
    const response = await api.post('/clients', formattedData);
    return response.data;
  },
  updateClient: async (id, clientData) => {
    const formattedData = formatDatesForAPI(clientData);
    const response = await api.put(`/clients/${id}`, formattedData);
    return response.data;
  },
  deleteClient: async (id) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
  addBilan: async (clientId, bilanData) => {
    const formattedBilan = formatDatesForAPI({ bilan: bilanData }).bilan;
    const response = await api.post(`/clients/${clientId}/bilans`, formattedBilan);
    return response.data;
  }
  
};

export const apiService = {
  addOrganisme: async (clientId, organismeData) => {
    const response = await api.post(`/clients/${clientId}/organismes`, organismeData);
    return response.data;
  },
  updateFicheClient: async (clientId, ficheClientData) => {
    const formattedFiche = formatDatesForAPI({ ficheClient: ficheClientData }).ficheClient;
    const response = await api.put(`/clients/${clientId}/ficheClient`, formattedFiche);
    return response.data;
  }
};

const apiServices = {
  authService,
  clientService,
  apiService
};

export default apiServices;