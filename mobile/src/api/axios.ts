import axios from 'axios';
import { Platform } from 'react-native';

// Use your machine's IP address for physical devices
const baseURL = 'http://172.20.10.2:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
