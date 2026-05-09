import api from "./api";
import type { CreateSemaineAcademiqueDto, SemaineAcademiqueDto } from "../types";

const SEMAINES_BASE = "/semaines";

export const semaineService = {
  // Créer une semaine académique
  create: async (data: CreateSemaineAcademiqueDto): Promise<SemaineAcademiqueDto> => {
    const response = await api.post<SemaineAcademiqueDto>(SEMAINES_BASE, data);
    return response.data;
  },

  // Liste des semaines (filtrable par semestre)
  getAll: async (semestreId?: number): Promise<SemaineAcademiqueDto[]> => {
    const params = semestreId !== undefined ? { params: { semestreId } } : {};
    const response = await api.get<SemaineAcademiqueDto[]>(SEMAINES_BASE, params);
    return response.data;
  },

  // Détails d'une semaine
  getById: async (id: number): Promise<SemaineAcademiqueDto> => {
    const response = await api.get<SemaineAcademiqueDto>(`${SEMAINES_BASE}/${id}`);
    return response.data;
  },

  // Modifier une semaine
  update: async (id: number, data: CreateSemaineAcademiqueDto): Promise<SemaineAcademiqueDto> => {
    const response = await api.put<SemaineAcademiqueDto>(`${SEMAINES_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer une semaine
  delete: async (id: number): Promise<void> => {
    await api.delete(`${SEMAINES_BASE}/${id}`);
  },
};

export default semaineService;
