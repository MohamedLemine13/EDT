import api from "./api";
import type { CreateEcoleDto, EcoleDto } from "../types";

const ECOLES_BASE = "/ecoles";

export const ecoleService = {
  // Créer une école
  create: async (data: CreateEcoleDto): Promise<EcoleDto> => {
    const response = await api.post<EcoleDto>(ECOLES_BASE, data);
    return response.data;
  },

  // Liste des écoles
  getAll: async (): Promise<EcoleDto[]> => {
    const response = await api.get<EcoleDto[]>(ECOLES_BASE);
    return response.data;
  },

  // Détails d'une école
  getById: async (id: string): Promise<EcoleDto> => {
    const response = await api.get<EcoleDto>(`${ECOLES_BASE}/${id}`);
    return response.data;
  },

  // Modifier une école
  update: async (id: string, data: CreateEcoleDto): Promise<EcoleDto> => {
    const response = await api.put<EcoleDto>(`${ECOLES_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer une école
  delete: async (id: string): Promise<void> => {
    await api.delete(`${ECOLES_BASE}/${id}`);
  },
};

export default ecoleService;
