
import axios from 'axios';

// Création de l'instance axios
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : ajoute le token à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Do this *inside* the interceptor
  console.log('[AXIOS] Token ajouté dans l’en-tête :', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services pour les clients
export const clientService = {
  getAllClients: async () => {
    const response = await API.get('/clients');
    return response.data;
  },
  getClientById: async (id) => {
    const response = await API.get(`/clients/${id}`);
    return response.data;
  },
  createClient: async (clientData) => {
    const response = await API.post('/clients', clientData);
    return response.data;
  },
  updateClient: async (id, clientData) => {
    const response = await API.put(`/clients/${id}`, clientData);
    return response.data;
  },
  deleteClient: async (id) => {
    const response = await API.delete(`/clients/${id}`);
    return response.data;
  },
  addBilan: async (id, bilanData) => {
    const response = await API.post(`/clients/${id}/bilans`, bilanData);
    return response.data;
  },
  addOrganisme: async (id, organismeData) => {
    const response = await API.post(`/clients/${id}/organismes`, organismeData);
    return response.data;
  },
  updateFicheClient: async (id, ficheClientData) => {
  // Formatage des dates avant envoi
  const formattedData = {
    ...ficheClientData,
    datePremierBilan: ficheClientData.datePremierBilan?.toISOString(),
    dateDebutMission: ficheClientData.dateDebutMission?.toISOString(),
    dateCulture: ficheClientData.dateCulture?.toISOString(),
    jourTVA: ficheClientData.jourTVA?.toISOString(),
    dateContrat: ficheClientData.dateContrat?.toISOString(),
    dateContratCN2C: ficheClientData.dateContratCN2C?.toISOString()
  };
  
  const response = await API.put(`/clients/${id}/ficheClient`, formattedData);
  return response.data;
},
};

export default API;
