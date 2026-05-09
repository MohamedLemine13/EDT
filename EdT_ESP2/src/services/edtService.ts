import api from "./api";
import type { EdtSemaineDto, SeanceDto } from "../types";

const EDT_BASE = "/edt";

export const edtService = {
  // Emploi du temps par département
  getByDepartement: async (
    departementId: number,
    semestreId: number,
    numeroSemaine: number
  ): Promise<EdtSemaineDto> => {
    const response = await api.get<EdtSemaineDto>(EDT_BASE, {
      params: { departementId, semestreId, numeroSemaine },
    });
    return response.data;
  },

  // EDT de l'étudiant connecté
  getMyEdt: async (semestreId: number, numeroSemaine: number): Promise<EdtSemaineDto> => {
    const response = await api.get<EdtSemaineDto>(`${EDT_BASE}/me`, {
      params: { semestreId, numeroSemaine },
    });
    return response.data;
  },

  // ✅ PROFESSEUR: Liste de mes séances (EDT professeur)
  getMyProfessorEdt: async (semestreId: number, semaineId: number): Promise<SeanceDto[]> => {
    const response = await api.get<SeanceDto[]>(`${EDT_BASE}/professeur/me`, {
      params: { semestreId, semaineId },
    });
    return response.data;
  },
};

export default edtService;
