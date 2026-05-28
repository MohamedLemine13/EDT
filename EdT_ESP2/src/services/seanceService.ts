import api from "./api";
import type { CreateSeanceRequestDto, UpdateSeanceRequestDto, SeanceDto } from "../types";

const SEANCES_BASE = "/seances";

export const seanceService = {
  // Créer une séance
  create: async (data: CreateSeanceRequestDto): Promise<SeanceDto> => {
    const response = await api.post<SeanceDto>(SEANCES_BASE, data);
    return response.data;
  },

  // Liste des séances
  getAll: async (): Promise<SeanceDto[]> => {
    const response = await api.get<SeanceDto[]>(SEANCES_BASE);
    return response.data;
  },

  // Détails d'une séance
  getById: async (id: number): Promise<SeanceDto> => {
    const response = await api.get<SeanceDto>(`${SEANCES_BASE}/${id}`);
    return response.data;
  },

  // Modifier une séance
  update: async (id: number, data: UpdateSeanceRequestDto): Promise<SeanceDto> => {
    const response = await api.put<SeanceDto>(`${SEANCES_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer une séance
  delete: async (id: number): Promise<void> => {
    await api.delete(`${SEANCES_BASE}/${id}`);
  },

  // ✅ PROFESSEUR: Liste de mes séances
  getMySeances: async (semestreId?: number, semaineId?: number): Promise<SeanceDto[]> => {
    const params: Record<string, number> = {};
    if (semestreId !== undefined) params.semestreId = semestreId;
    if (semaineId !== undefined) params.semaineId = semaineId;
    const response = await api.get<SeanceDto[]>(`${SEANCES_BASE}/me`, { params });
    return response.data;
  },

  // ✅ All seances for a department (full semester) — used by Plan page
  getByDepartement: async (departementId: number, semestreId?: number): Promise<SeanceDto[]> => {
    const params: Record<string, number> = {};
    if (semestreId !== undefined) params.semestreId = semestreId;
    const response = await api.get<SeanceDto[]>(`${SEANCES_BASE}/departement/${departementId}`, { params });
    return response.data;
  },
};

export default seanceService;
