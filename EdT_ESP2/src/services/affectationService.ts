import api from "./api";
import type { CreateAffectationEnseignementDto, AffectationEnseignementDto } from "../types";

const AFFECTATIONS_BASE = "/affectations";

export const affectationService = {
  // Créer/Modifier une affectation (upsert)
  upsert: async (data: CreateAffectationEnseignementDto): Promise<AffectationEnseignementDto> => {
    const response = await api.post<AffectationEnseignementDto>(AFFECTATIONS_BASE, data);
    return response.data;
  },

  // Liste des affectations par semestre et département
  getAll: async (semestreId: number, departementId?: number): Promise<AffectationEnseignementDto[]> => {
    const params: any = { semestreId };
    if (departementId && departementId !== -1) {
      params.departementId = departementId;
    }
    const response = await api.get<AffectationEnseignementDto[]>(AFFECTATIONS_BASE, {
      params
    });
    return response.data;
  },

  // ✅ PROFESSEUR: Liste de mes affectations
  getMyAffectations: async (semestreId?: number): Promise<AffectationEnseignementDto[]> => {
    const params = semestreId !== undefined ? { params: { semestreId } } : {};
    const response = await api.get<AffectationEnseignementDto[]>(`${AFFECTATIONS_BASE}/me`, params);
    return response.data;
  },

  // Supprimer une affectation
  delete: async (id: number): Promise<void> => {
    await api.delete(`${AFFECTATIONS_BASE}/${id}`);
  },
};

export default affectationService;
