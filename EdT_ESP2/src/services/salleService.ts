import api from "./api";
import type { CreateSalleDto, SalleDto } from "../types";

const SALLES_BASE = "/salles";

export const salleService = {
  // Créer une salle
  create: async (data: CreateSalleDto): Promise<SalleDto> => {
    const response = await api.post<SalleDto>(SALLES_BASE, data);
    return response.data;
  },

  // Liste des salles (filtrable par département ou école)
  getAll: async (filters?: { departementId?: number; ecoleId?: string }): Promise<SalleDto[]> => {
    const params = filters || {};
    const response = await api.get<SalleDto[]>(SALLES_BASE, { params });
    return response.data;
  },

  // Détails d'une salle
  getById: async (id: number): Promise<SalleDto> => {
    const response = await api.get<SalleDto>(`${SALLES_BASE}/${id}`);
    return response.data;
  },

  // Modifier une salle
  update: async (id: number, data: CreateSalleDto): Promise<SalleDto> => {
    const response = await api.put<SalleDto>(`${SALLES_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer une salle
  delete: async (id: number): Promise<void> => {
    await api.delete(`${SALLES_BASE}/${id}`);
  },
};

export default salleService;
