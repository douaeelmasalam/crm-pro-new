import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Client API calls
export const clientAPI = {
  // Get all clients
  getClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get client by ID
  getClient: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new client
  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update client
  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete client
  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;