import api from "./api";
import type { EvenementCalendrierDto, CreateEvenementCalendrierDto } from "../types";

const CALENDRIER_BASE = "/calendrier";

export const calendrierService = {
  // Créer un événement
  create: async (data: CreateEvenementCalendrierDto): Promise<EvenementCalendrierDto> => {
    const response = await api.post<EvenementCalendrierDto>(CALENDRIER_BASE, data);
    return response.data;
  },

  // Liste des événements (filtrable par semestre et période)
  getAll: async (filters?: {
    semestreId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<EvenementCalendrierDto[]> => {
    const params = filters || {};
    const response = await api.get<EvenementCalendrierDto[]>(CALENDRIER_BASE, { params });
    return response.data;
  },

  // Détails d'un événement
  getById: async (id: number): Promise<EvenementCalendrierDto> => {
    const response = await api.get<EvenementCalendrierDto>(`${CALENDRIER_BASE}/${id}`);
    return response.data;
  },

  // Modifier un événement
  update: async (id: number, data: CreateEvenementCalendrierDto): Promise<EvenementCalendrierDto> => {
    const response = await api.put<EvenementCalendrierDto>(`${CALENDRIER_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer un événement
  delete: async (id: number): Promise<void> => {
    await api.delete(`${CALENDRIER_BASE}/${id}`);
  },
};

export default calendrierService;
