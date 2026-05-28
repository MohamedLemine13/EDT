import api from "./api";
import type { CreateProfesseurDto, ProfesseurDto } from "../types";

const PROFESSEURS_BASE = "/professeurs";

export const professeurService = {
  // Créer un professeur
  create: async (data: CreateProfesseurDto): Promise<ProfesseurDto> => {
    const response = await api.post<ProfesseurDto>(PROFESSEURS_BASE, data);
    return response.data;
  },

  // Liste des professeurs
  getAll: async (): Promise<ProfesseurDto[]> => {
    const response = await api.get<ProfesseurDto[]>(PROFESSEURS_BASE);
    return response.data;
  },

  // Détails d'un professeur
  getById: async (id: number): Promise<ProfesseurDto> => {
    const response = await api.get<ProfesseurDto>(`${PROFESSEURS_BASE}/${id}`);
    return response.data;
  },

  // Modifier un professeur
  update: async (id: number, data: CreateProfesseurDto): Promise<ProfesseurDto> => {
    const response = await api.put<ProfesseurDto>(`${PROFESSEURS_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer un professeur
  delete: async (id: number): Promise<void> => {
    await api.delete(`${PROFESSEURS_BASE}/${id}`);
  },
};

export default professeurService;
