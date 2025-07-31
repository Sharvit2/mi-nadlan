import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Properties API
export const propertiesAPI = {
  // Get all properties with filters
  getProperties: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return api.get(`/api/properties?${params.toString()}`);
  },

  // Get properties for sale
  getSaleProperties: () => api.get('/api/properties/sale'),

  // Get properties for rent
  getRentProperties: () => api.get('/api/properties/rent'),

  // Get single property
  getProperty: (id) => api.get(`/api/properties/${id}`),

  // Create new property
  createProperty: (propertyData) => api.post('/api/properties', propertyData),

  // Update property
  updateProperty: (id, propertyData) => api.put(`/api/properties/${id}`, propertyData),

  // Delete property
  deleteProperty: (id) => api.delete(`/api/properties/${id}`),
};

// Agents API
export const agentsAPI = {
  // Get all agents
  getAgents: () => api.get('/api/agents'),

  // Login agent
  login: (agentName) => {
    const formData = new FormData();
    formData.append('agent_name', agentName);
    return api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Office info API
export const officeAPI = {
  getOfficeInfo: () => api.get('/api/office-info'),
};

// File upload API
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;