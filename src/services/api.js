import axios from 'axios';

// Choix de l'URL en fonction de l'environnement
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const baseURL = isLocalhost
  ? import.meta.env.VITE_API_URL
  : import.meta.env.VITE_API_URL_PROD;

const API = axios.create({ baseURL });

// Ajout automatique du token
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

// Gestion des erreurs
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
