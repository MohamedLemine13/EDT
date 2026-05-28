import api from "./api";
import type { CreateDepartementDto, DepartementDto } from "../types";

const DEPARTEMENTS_BASE = "/departements";

export const departementService = {
  // Créer un département
  create: async (data: CreateDepartementDto): Promise<DepartementDto> => {
    const response = await api.post<DepartementDto>(DEPARTEMENTS_BASE, data);
    return response.data;
  },

  // Liste des départements (filtrable par école)
  getAll: async (ecoleId?: string): Promise<DepartementDto[]> => {
    const params = ecoleId ? { params: { ecoleId } } : {};
    const response = await api.get<DepartementDto[]>(DEPARTEMENTS_BASE, params);
    return response.data;
  },

  // Détails d'un département
  getById: async (id: number): Promise<DepartementDto> => {
    const response = await api.get<DepartementDto>(`${DEPARTEMENTS_BASE}/${id}`);
    return response.data;
  },

  // Modifier un département
  update: async (id: number, data: CreateDepartementDto): Promise<DepartementDto> => {
    const response = await api.put<DepartementDto>(`${DEPARTEMENTS_BASE}/${id}`, data);
    return response.data;
  },

  // Supprimer un département
  delete: async (id: number): Promise<void> => {
    await api.delete(`${DEPARTEMENTS_BASE}/${id}`);
  },
};

export default departementService;
