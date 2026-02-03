import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Matches your Flask backend
  withCredentials: true, // Important for session cookies (if used) or just good practice
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
