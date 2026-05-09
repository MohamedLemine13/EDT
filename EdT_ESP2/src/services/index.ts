// ==========================================
// Services API - Exports
// ==========================================

// Configuration API et helpers JWT
export { default as api, API_BASE_URL, getToken, setToken, removeToken, isAuthenticated } from "./api";

// Services par domaine
export { default as authService } from "./authService";
export { default as ecoleService } from "./ecoleService";
export { default as departementService } from "./departementService";
export { default as professeurService } from "./professeurService";
export { default as salleService } from "./salleService";
export { default as matiereService } from "./matiereService";
export { default as semestreService } from "./semestreService";
export { default as semaineService } from "./semaineService";
export { default as creneauService } from "./creneauService";
export { default as affectationService } from "./affectationService";
export { default as seanceService } from "./seanceService";
export { default as edtService } from "./edtService";
export { default as calendrierService } from "./calendrierService";
export { default as bilanService } from "./bilanService";

// Service de setup (localStorage - pour démo/mock)
export * from "./setupService";
