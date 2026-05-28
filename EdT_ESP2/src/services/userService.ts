import api from "./api";
import type { UserDto } from "../types";

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  departementId?: number;
  professeurId?: number;
}

const ADMIN_BASE = "/admin/users";

export const userService = {
  // List all users (admin only)
  list: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>(ADMIN_BASE);
    return response.data;
  },

  // Create a user (admin only)
  create: async (data: CreateUserRequest): Promise<UserDto> => {
    const response = await api.post<UserDto>(ADMIN_BASE, data);
    return response.data;
  },

  // Delete a user (admin only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ADMIN_BASE}/${id}`);
  },
};

export default userService;
