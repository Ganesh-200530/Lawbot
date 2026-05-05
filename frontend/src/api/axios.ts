import axios from 'axios';

const api = axios.create({
  // Use VITE_API_URL or nothing (browser will append the path to the current origin e.g. http://98.93.111.34)
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, // Important for session cookies (if used) or just good practice
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
