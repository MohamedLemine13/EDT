import api from "./api";
import type { CreateMatiereDto, MatiereDto } from "../types";

const MATIERES_BASE = "/matieres";

export const matiereService = {
  // Créer une matière
  create: async (data: CreateMatiereDto): Promise<MatiereDto> => {
    const response = await api.post<MatiereDto>(MATIERES_BASE, data);
    return response.data;
  },

  // Liste des matières
  getAll: async (): Promise<MatiereDto[]> => {
    const response = await api.get<MatiereDto[]>(MATIERES_BASE);
    return response.data;
  },

  // ✅ Liste des matières par département
  getByDepartement: async (departementId: number): Promise<MatiereDto[]> => {
    const response = await api.get<MatiereDto[]>(MATIERES_BASE, {
      params: { departementId },
    });
    return response.data;
  },

  // Détails d'une matière
  getByCode: async (code: string): Promise<MatiereDto> => {
    const response = await api.get<MatiereDto>(`${MATIERES_BASE}/${code}`);
    return response.data;
  },

  // Modifier une matière
  update: async (code: string, data: CreateMatiereDto): Promise<MatiereDto> => {
    const response = await api.put<MatiereDto>(`${MATIERES_BASE}/${code}`, data);
    return response.data;
  },

  // Supprimer une matière
  delete: async (code: string): Promise<void> => {
    await api.delete(`${MATIERES_BASE}/${code}`);
  },
};

export default matiereService;
