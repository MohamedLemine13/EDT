import api from "./api";
import type { CreateSemestreDto, SemestreDto } from "../types";

const SEMESTRES_BASE = "/semestres";

export const semestreService = {
  // Créer un semestre
  create: async (data: CreateSemestreDto): Promise<SemestreDto> => {
    const response = await api.post<SemestreDto>(SEMESTRES_BASE, data);
    return response.data;
  },

  // Liste des semestres
  getAll: async (): Promise<SemestreDto[]> => {
    const response = await api.get<SemestreDto[]>(SEMESTRES_BASE);
    return response.data;
  },

  // Détails d'un semestre
  getById: async (id: number): Promise<SemestreDto> => {
    const response = await api.get<SemestreDto>(`${SEMESTRES_BASE}/${id}`);
    return response.data;
  },

  // Modifier un semestre
  update: async (id: number, data: CreateSemestreDto): Promise<SemestreDto> => {
    const response = await api.put<SemestreDto>(`${SEMESTRES_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer un semestre
  delete: async (id: number): Promise<void> => {
    await api.delete(`${SEMESTRES_BASE}/${id}`);
  },
};

export default semestreService;
