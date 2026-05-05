import axios from 'axios';
import { Platform } from 'react-native';

// Uses EXPO_PUBLIC_API_URL environment variable in production, falls back to local IP for dev
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.16:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
