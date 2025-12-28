import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status >= 500) {
        alert("Ups! Ocurrió un error en el servidor. Intenta más tarde.");
      }
      if (status === 401) {
        alert("Tu sesión ha expirado. Por favor inicia sesión de nuevo.");
      }
      
      if (status === 404 && !error.response.data.message) {
         console.error("Endpoint no encontrado");
      }
    } else if (error.request) {
      alert("No se pudo conectar con el servidor. Revisa tu conexión.");
    }

    return Promise.reject(error);
  }
);

export default api;