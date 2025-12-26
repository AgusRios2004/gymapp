import axios from 'axios';

// Creamos una instancia con la configuración base
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Tu URL base
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
