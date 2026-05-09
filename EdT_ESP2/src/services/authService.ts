import api, { setToken, removeToken } from "./api";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UserDto,
} from "../types";

const AUTH_BASE = "/auth";

export const authService = {
  // Inscription
  register: async (data: RegisterRequest): Promise<UserDto> => {
    const response = await api.post<UserDto>(`${AUTH_BASE}/register`, data);
    return response.data;
  },

  // Connexion
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(`${AUTH_BASE}/login`, data);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },

  // Profil connecté
  me: async (): Promise<UserDto> => {
    const response = await api.get<UserDto>(`${AUTH_BASE}/me`);
    return response.data;
  },

  // Logout
  logout: (): void => {
    removeToken();
  },
};

export default authService;
