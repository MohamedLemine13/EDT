import axios from "axios";

// Configuration Spring Boot Backend
const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Clés localStorage
const TOKEN_KEY = "jwt_token";
const USER_KEY = "user_data";

// Helper pour récupérer le token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Helper pour définir le token
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Helper pour supprimer le token (logout)
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Helper pour vérifier si authentifié
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Intercepteur de requêtes - ajoute le JWT header
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("[API] Token from localStorage:", token ? `${token.substring(0, 20)}...` : "null");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Header Authorization set:", config.headers.Authorization.substring(0, 30) + "...");
    }
    console.log("[API] Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("[API] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponses - gestion globale des erreurs
api.interceptors.response.use(
  (response) => {
    console.log("[API] Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("[API] Response error:", error.message);
    if (error.response) {
      const { status, data } = error.response;
      console.error("[API] Error status:", status, "data:", data);
      
      switch (status) {
        case 401:
          // Non authentifié - supprimer token mais ne pas rediriger automatiquement
          removeToken();
          console.error("[API] 401 - Token supprimé");
          break;
        case 403:
          console.error("[API] 403 - Accès interdit:", data?.message);
          break;
        case 400:
          console.error("[API] 400 - Erreur de validation:", data?.message);
          break;
        default:
          console.error("[API] Error:", data?.message || error.message);
      }
    } else if (error.request) {
      console.error("[API] No response received - request:", error.request);
    } else {
      console.error("[API] Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
