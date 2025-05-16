// import axios from 'axios';

// // Création d'une instance axios avec l'URL de base de l'API
// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// const token = localStorage.getItem('token'); // or however you store it


// // Intercepteur pour ajouter le token d'authentification à chaque requête
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Services pour les clients
// export const clientService = {
//   // Récupérer tous les clients
//   getAllClients: async () => {
//     try {
//       const response = await API.get('/clients');
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Récupérer un client par ID
//   getClientById: async (clientId) => {
//     try {
//       const response = await API.get(`/clients/${clientId}`);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Créer un nouveau client
//   createClient: async (clientData) => {
//     try {
//       const response = await API.post('/clients', clientData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Mettre à jour un client
//   updateClient: async (clientId, clientData) => {
//     try {
//       const response = await API.put(`/clients/${clientId}`, clientData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Supprimer un client
//   deleteClient: async (clientId) => {
//     try {
//       const response = await API.delete(`/clients/${clientId}`);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Ajouter un bilan à un client
//   addBilan: async (clientId, bilanData) => {
//     try {
//       const response = await API.post(`/clients/${clientId}/bilans`, bilanData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Ajouter un organisme à un client
//   addOrganisme: async (clientId, organismeData) => {
//     try {
//       const response = await API.post(`/clients/${clientId}/organismes`, organismeData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // Mettre à jour la fiche client
//   updateFicheClient: async (clientId, ficheClientData) => {
//     try {
//       const response = await API.put(`/clients/${clientId}/fiche-client`, ficheClientData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },
// };

// export default API;
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
    const response = await API.put(`/clients/${id}/fiche-client`, ficheClientData);
    return response.data;
  },
};

export default API;
