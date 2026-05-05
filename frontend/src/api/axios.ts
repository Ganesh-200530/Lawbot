import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', // Uses environment variable in production
  withCredentials: true, // Important for session cookies (if used) or just good practice
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
