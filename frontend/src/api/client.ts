import axios from 'axios';

// Instance Axios unique — tous les appels API passent par ici
const client = axios.create({
  baseURL: 'http://localhost:3000',
  //       ^^^^^^^^^^^^^^^^^^^^^ l'adresse du backend NestJS
  //       On ne la répète plus nulle part dans l'app
});

// ── Intercepteur REQUEST ──────────────────────────────────────
// Avant chaque requête, on injecte le token JWT dans le header
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // → Le backend reçoit : Authorization: Bearer eyJ...
  }

  return config;
});

// ── Intercepteur RESPONSE ─────────────────────────────────────
// Si le backend renvoie 401 (token expiré/invalide), on déconnecte
client.interceptors.response.use(
  // Cas normal : la réponse est OK → on la laisse passer
  (response) => response,

  // Cas erreur : on intercepte les 401
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      //     ^^^^^^^^^^^^^^^^ redirection "dure" vers la page login
    }

    return Promise.reject(error);
    // → les autres erreurs (400, 500...) sont propagées normalement
  },
);

export default client;
