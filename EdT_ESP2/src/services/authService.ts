import api, { setToken, removeToken } from "./api";
import type {
  LoginRequest,
  AuthResponse,
  UserDto,
} from "../types";

const AUTH_BASE = "/auth";

export const authService = {
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

  // Changement de mot de passe (premier login)
  changePassword: async (currentPassword: string, newPassword: string): Promise<UserDto> => {
    const response = await api.post<UserDto>(`${AUTH_BASE}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Logout
  logout: (): void => {
    removeToken();
  },
};

export default authService;
