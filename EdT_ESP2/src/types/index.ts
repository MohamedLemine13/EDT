// ==========================================
// EduManager Type Definitions
// ==========================================

// Teacher Type
export interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
  courses: string[];
}

// Room Type
export interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  equipment: string[];
  building: string;
  departmentId?: string;
}

// Course Types
export interface Course {
  code: string;
  title: string;
  credits: number;
  typeMatiere?: "DEP" | "HE" | "ST";
  hours: {
    cm: number;
    td: number;
    tp: number;
    total: number;
  };
  teachers: {
    cm: string;
    td: string;
    tp: string;
  };
  rooms: {
    cm: string;
    td: string;
    tp: string;
  };
  color: string;
}

export interface CoursesData {
  department: string;
  departmentName: string;
  semester: string;
  courses: Course[];
}

// Schedule Types
export type SessionType =
  | "CM"
  | "TD"
  | "TP"
  | "Exam"
  | "Special";
export type SessionStatus =
  | "scheduled"
  | "done"
  | "cancelled"
  | "exam"
  | "online";
export type DayName =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"
  | "samedi";

export interface TimeSlot {
  id: number;
  label: string;
  start: string;
  end: string;
}

export interface Session {
  id: string;
  courseCode: string;
  type: SessionType;
  day: DayName;
  timeSlot: number;
  room: string;
  teacher: string;
  group?: string;
  status: SessionStatus;
  tags?: string[];
}

export interface WeekSchedule {
  semester: string;
  week: number;
  dateRange: {
    start: string;
    end: string;
  };
  timeSlots: TimeSlot[];
  days: DayName[];
  sessions: Session[];
}

// Calendar Types
export type EventType =
  | "course_start"
  | "holiday"
  | "vacation"
  | "exam"
  | "soutenance"
  | "religious";

export interface CalendarEvent {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  type: EventType;
  description?: string;
}

export interface AcademicCalendar {
  academicYear: string;
  events: CalendarEvent[];
  weekNumbers: {
    S1_S3_start: number;
    S1_S3_end: number;
    S2_S4_start: number;
    S2_S4_end: number;
  };
}

// Progress/Bilan Types
export interface CourseProgress {
  courseCode: string;
  courseName: string;
  teacher: string;
  planned: { cm: number; td: number; tp: number };
  completed: { cm: number; td: number; tp: number };
  evaluations: { devoir: number; examen: number; rattrapage: number };
}

export interface ProgressSummary {
  planned: { cm: number; td: number; tp: number };
  completed: { cm: number; td: number; tp: number };
  percentage: { cm: number; td: number; tp: number };
  overall: number;
}

export interface SemesterProgress {
  semester: string;
  period: {
    start: string;
    end: string;
  };
  courses: CourseProgress[];
  summary: ProgressSummary;
}

// UI State Types
export interface AppState {
  selectedDepartment: string;
  selectedSemester: string;
  selectedWeek: number;
  activeTab: "emploi" | "plan" | "bilan" | "calendrier" | "bdd";
}

// Color Palette Type
export interface ColorPalette {
  primary: {
    dark: string;
    main: string;
    light: string;
    pale: string;
  };
  secondary: {
    gold: string;
    goldLight: string;
  };
  cells: {
    cm: string;
    td: string;
    tp: string;
    exam: string;
    online: string;
    devoir: string;
    military: string;
    club: string;
    empty: string;
  };
}

// Constants
export const ESP_COLORS: ColorPalette = {
  primary: {
    dark: "#1B5E20",
    main: "#2E7D32",
    light: "#4CAF50",
    pale: "#E8F5E9",
  },
  secondary: {
    gold: "#FFB300",
    goldLight: "#FFE082",
  },
  cells: {
    cm: "#1565C0",
    td: "#2E7D32",
    tp: "#00838F",
    exam: "#C62828",
    online: "#7CB342",
    devoir: "#F9A825",
    military: "#5D4037",
    club: "#7B1FA2",
    empty: "#37474F",
  },
};

export const TIME_SLOTS: TimeSlot[] = [
  { id: 0, label: "8h00-9h30", start: "08:00", end: "09:30" },
  { id: 1, label: "09h45-11h15", start: "09:45", end: "11:15" },
  { id: 2, label: "11h30-13h00", start: "11:30", end: "13:00" },
  { id: 3, label: "15h10-16h40", start: "15:10", end: "16:40" },
  { id: 4, label: "17h00-18h30", start: "17:00", end: "18:30" },
];

export const DAYS: DayName[] = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

export const DAY_LABELS: Record<DayName, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
};
// Types basés sur le backend Spring Boot
export interface Ecole {
  id: string;
  nom: string;
  domaine: string;
  slug: string;
}

export interface Departement {
  id: number;
  code: string;
  nom: string;
  ecoleId: string;
}

export interface Professeur {
  id: number;
  nom: string;
  prenom: string;
  statut: "VACATAIRE" | "PERMANENT";
}

export interface Salle {
  id: number;
  nom: string;
  typeSalle: "SALLE" | "AMPHI" | "LABO";
  departementId: number;
}

export interface Semestre {
  id: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

export interface Matiere {
  code: string;
  intitule: string;
}

export interface Semaine {
  id: number;
  numeroSemaine: number;
  dateDebut: string;
  dateFin: string;
  semestreId: number;
}

export interface Creneau {
  id: number;
  jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI";
  heureDebut: string;
  heureFin: string;
  typeCreneau: "DEP" | "HE" | "ST" | "AUTRE";
  semestreId: number;
}

export interface Affectation {
  id: number;
  semestreId: number;
  departementId: number;
  matiereCode: string;
  type: "CM" | "TD" | "TP";
  professeurId: number;
  salleId: number;
}

export interface Seance {
  id: number;
  type: "CM" | "TD" | "TP";
  statut: "PLANIFIEE" | "REALISEE" | "ANNULEE";
  creneauId: number;
  matiereCode: string;
  salleId: number;
  semaineId: number;
  departementIds: number[];
  // Relations enrichies (peuvent être ajoutées par le backend)
  creneau?: Creneau;
  matiere?: Matiere;
  salle?: Salle;
  semaine?: Semaine;
}

export interface EdtParams {
  departementId: number;
  semestreId: number;
  numeroSemaine: number;
}

export interface EdtResponse {
  semaine: Semaine;
  seances: Seance[];
}

// ==========================================
// Auth Types (Spring Boot DTOs)
// ==========================================

export type UserRole = "ADMIN" | "ETUDIANT" | "PROFESSEUR" | "CHEF_DEP" | "CHEF_HE" | "CHEF_ST";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
}

export interface UserDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  departementId?: number;
  mustChangePassword: boolean;
}

// ==========================================
// DTOs Spring Boot Complets
// ==========================================

export interface CreateEcoleDto {
  id: string;
  nom: string;
  domaine: string;
  slug: string;
}

export interface EcoleDto {
  id: string;
  nom: string;
  domaine: string;
  slug: string;
}

export interface CreateDepartementDto {
  code: string;
  nom: string;
  ecoleId: string;
}

export interface DepartementDto {
  id: number;
  code: string;
  nom: string;
  ecoleId: string;
}

export interface CreateProfesseurDto {
  nom: string;
  prenom: string;
  statut: "PERMANENT" | "VACATAIRE";
  email?: string;
}

export interface ProfesseurDto {
  id: number;
  nom: string;
  prenom: string;
  statut: "PERMANENT" | "VACATAIRE";
  email?: string;
}

export interface CreateSalleDto {
  nom: string;
  typeSalle: "AMPHI" | "SALLE" | "LABO";
  ecoleId: string;
  departementId?: number;
}

export interface SalleDto {
  id: number;
  nom: string;
  typeSalle: "AMPHI" | "SALLE" | "LABO";
  ecoleId: string;
  departementId?: number;
  capacite?: number;
  equipements?: string;
}

export interface CreateMatiereDto {
  code: string;
  intitule: string;
  credits: number;
  hCm: number;
  hTd: number;
  hTp: number;
  typeMatiere?: "DEP" | "HE" | "ST";
}

export interface MatiereDto {
  code: string;
  intitule: string;
  credits: number;
  hCm: number;
  hTd: number;
  hTp: number;
  typeMatiere?: "DEP" | "HE" | "ST";
}

export interface CreateSemestreDto {
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

export interface SemestreDto {
  id: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

export interface CreateEvenementCalendrierDto {
  titre: string;
  description?: string;
  type: "RENTREE" | "VACANCES" | "EXAMEN" | "FERIE" | "SOUTENANCE" | "EVENEMENT" | "AUTRE";
  dateDebut: string;
  dateFin?: string;
  semestreId?: number;
  couleur?: string;
}

export interface EvenementCalendrierDto {
  id: number;
  titre: string;
  description?: string;
  type: "RENTREE" | "VACANCES" | "EXAMEN" | "FERIE" | "SOUTENANCE" | "EVENEMENT" | "AUTRE";
  dateDebut: string;
  dateFin?: string;
  semestreId?: number;
  semestreLibelle?: string;
  couleur?: string;
}

export interface CreateSemaineAcademiqueDto {
  numeroSemaine: number;
  dateDebut: string;
  dateFin: string;
  semestreId: number;
}

export interface SemaineAcademiqueDto {
  id: number;
  numeroSemaine: number;
  dateDebut: string;
  dateFin: string;
  semestreId: number;
}

export interface CreateCreneauDto {
  jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI";
  heureDebut: string;
  heureFin: string;
  typeCreneau: "DEP" | "HE" | "ST" | "AUTRE";
  semestreId: number;
}

export interface CreneauDto {
  id: number;
  jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI";
  heureDebut: string;
  heureFin: string;
  typeCreneau: "DEP" | "HE" | "ST" | "AUTRE";
  semestreId: number;
}

export interface CreateAffectationEnseignementDto {
  semestreId: number;
  departementIds: number[];
  matiereCode: string;
  type: "CM" | "TD" | "TP" | "DEVOIR" | "EXAMEN" | "MEETING" | "AUTRE";
  professeurIds?: number[];
  salleIds?: number[];
}

export interface AffectationEnseignementDto {
  id: number;
  semestreId: number;
  semestreLibelle: string;
  departementIds: number[];
  departementCodes: string[];
  matiereCode: string;
  type: "CM" | "TD" | "TP" | "DEVOIR" | "EXAMEN" | "MEETING" | "AUTRE";
  professeurIds?: number[];
  professeurNoms?: string[];
  salleIds?: number[];
  salleNoms?: string[];
}

export interface CreateSeanceRequestDto {
  type: "CM" | "TD" | "TP" | "DEVOIR" | "EXAMEN" | "MEETING" | "AUTRE";
  statut?: "PLANIFIEE" | "ANNULEE" | "REALISEE";
  creneauId: number;
  matiereCode: string;
  salleIds?: number[];
  semaineId: number;
  professeurIds?: number[];
  isCommun?: boolean;
  tag?: string;
  departementIds: number[];
}

export interface UpdateSeanceRequestDto {
  type?: "CM" | "TD" | "TP" | "DEVOIR" | "EXAMEN" | "MEETING" | "AUTRE";
  statut?: "PLANIFIEE" | "ANNULEE" | "REALISEE";
  creneauId?: number;
  matiereCode?: string;
  salleIds?: number[];
  semaineId?: number;
  professeurIds?: number[];
  isCommun?: boolean;
  tag?: string;
  departementIds?: number[];
}

export interface SeanceDto {
  id: number;
  type: "CM" | "TD" | "TP" | "DEVOIR" | "EXAMEN" | "MEETING" | "AUTRE";
  statut: "PLANIFIEE" | "ANNULEE" | "REALISEE";
  jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI";
  heureDebut: string;
  heureFin: string;
  typeCreneau: "HE" | "ST" | "DEP" | "AUTRE";
  matiereCode: string;
  matiereIntitule: string;
  professeurIds: number[];
  professeurNoms: string[];
  salleIds: number[];
  salleNoms: string[];
  semaineId: number;
  numeroSemaine: number;
  tag?: string;
  departementIds: number[];
}

export interface EdtJourDto {
  jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI";
  seances: SeanceDto[];
}

export interface EdtSemaineDto {
  semestreId: number;
  semestreLibelle: string;
  semaineId: number;
  numeroSemaine: number;
  dateDebut: string;
  dateFin: string;
  departementId: number;
  departementCode: string;
  departementNom: string;
  jours: EdtJourDto[];
}

// ==========================================
// Bilan DTOs
// ==========================================

export interface BilanHoursDto {
  cm: number;
  td: number;
  tp: number;
}

export interface BilanMatiereDto {
  matiereCode: string;
  matiereIntitule: string;
  professeurNom: string;
  professeurPrenom: string;
  planned: BilanHoursDto;
  completed: BilanHoursDto;
}

export interface BilanSummaryDto {
  planned: BilanHoursDto;
  completed: BilanHoursDto;
  overallPercentage: number;
}

export interface BilanDto {
  semestreLibelle: string;
  departementId: number;
  departementCode: string;
  courses: BilanMatiereDto[];
  summary: BilanSummaryDto;
}
