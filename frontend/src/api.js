import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teams API
export const getTeams = () => api.get('/teams');
export const getTeam = (id) => api.get(`/teams/${id}`);
export const createTeam = (data) => api.post('/teams', data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);

// Hydrants API
export const getHydrants = () => api.get('/hydrants');
export const getHydrant = (id) => api.get(`/hydrants/${id}`);
export const createHydrant = (data) => api.post('/hydrants', data);
export const updateHydrant = (id, data) => api.put(`/hydrants/${id}`, data);
export const deleteHydrant = (id) => api.delete(`/hydrants/${id}`);

// Equipment Cabinets API
export const getEquipmentCabinets = () => api.get('/equipment-cabinets');
export const getEquipmentCabinet = (id) => api.get(`/equipment-cabinets/${id}`);
export const createEquipmentCabinet = (data) => api.post('/equipment-cabinets', data);
export const updateEquipmentCabinet = (id, data) => api.put(`/equipment-cabinets/${id}`, data);
export const deleteEquipmentCabinet = (id) => api.delete(`/equipment-cabinets/${id}`);

// Tasks API
export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Maintenance API
export const getMaintenanceRecords = (params) => api.get('/maintenance', { params });
export const getMaintenanceRecord = (id) => api.get(`/maintenance/${id}`);
export const createMaintenanceRecord = (data) => api.post('/maintenance', data);
export const updateMaintenanceRecord = (id, data) => api.put(`/maintenance/${id}`, data);
export const deleteMaintenanceRecord = (id) => api.delete(`/maintenance/${id}`);

// Volunteers API
export const getVolunteers = (params) => api.get('/volunteers', { params });
export const getVolunteer = (id) => api.get(`/volunteers/${id}`);
export const createVolunteer = (data) => api.post('/volunteers', data);
export const updateVolunteer = (id, data) => api.put(`/volunteers/${id}`, data);
export const deleteVolunteer = (id) => api.delete(`/volunteers/${id}`);

// Activities API
export const getActivities = (params) => api.get('/activities', { params });
export const getActivity = (id) => api.get(`/activities/${id}`);
export const createActivity = (data) => api.post('/activities', data);
export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Dashboard API
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
