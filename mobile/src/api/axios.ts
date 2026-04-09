import axios from 'axios';
import { Platform } from 'react-native';

// Use your machine's IP address for physical devices
const baseURL = 'http://192.168.29.173:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
