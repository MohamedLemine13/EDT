import api from "./api";
import type { CreateCreneauDto, CreneauDto } from "../types";

const CRENEAUX_BASE = "/creneaux";

export const creneauService = {
  // Créer un créneau
  create: async (data: CreateCreneauDto): Promise<CreneauDto> => {
    const response = await api.post<CreneauDto>(CRENEAUX_BASE, data);
    return response.data;
  },

  // Liste des créneaux (filtrable par semestre)
  getAll: async (semestreId?: number): Promise<CreneauDto[]> => {
    const params = semestreId !== undefined ? { params: { semestreId } } : {};
    const response = await api.get<CreneauDto[]>(CRENEAUX_BASE, params);
    return response.data;
  },

  // Détails d'un créneau
  getById: async (id: number): Promise<CreneauDto> => {
    const response = await api.get<CreneauDto>(`${CRENEAUX_BASE}/${id}`);
    return response.data;
  },

  // Modifier un créneau
  update: async (id: number, data: CreateCreneauDto): Promise<CreneauDto> => {
    const response = await api.put<CreneauDto>(`${CRENEAUX_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer un créneau
  delete: async (id: number): Promise<void> => {
    await api.delete(`${CRENEAUX_BASE}/${id}`);
  },

  // Bulk update créneau types (for Excel-like drag-select)
  bulkUpdateType: async (creneauIds: number[], typeCreneau: string): Promise<CreneauDto[]> => {
    const response = await api.put<CreneauDto[]>(`${CRENEAUX_BASE}/bulk-type`, { creneauIds, typeCreneau });
    return response.data;
  },
};

export default creneauService;
