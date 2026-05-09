import api from "./api";
import type { BilanDto } from "../types";

const BILAN_BASE = "/bilan";

export const bilanService = {
  getBilan: async (departementId: number, semestreId: number): Promise<BilanDto> => {
    const response = await api.get<BilanDto>(BILAN_BASE, {
      params: { departementId, semestreId },
    });
    return response.data;
  },
};

export default bilanService;
