/**
 * Demo users data for Professeur and Étudiant interfaces
 * Mock data for testing without backend
 */

import type { Session, DayName, SessionStatus, SessionType } from "@/types";

// Demo Professeur
export interface DemoProfesseur {
  id: string;
  nom: string;
  prenom: string;
  statut: "VACATAIRE" | "PERMANENT";
  email: string;
  departement: string;
  matieres: string[];
}

export const demoProfesseur: DemoProfesseur = {
  id: "P001",
  nom: "Hafedh",
  prenom: "Mohamed",
  statut: "PERMANENT",
  email: "hafedh.mohamed@univ.edu",
  departement: "IRT",
  matieres: ["IRT32", "IRT33"],
};

// Demo Étudiant
export interface DemoEtudiant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  departement: string;
  semestre: string;
  groupe: string;
}

export const demoEtudiant: DemoEtudiant = {
  id: "E001",
  nom: "Doe",
  prenom: "John",
  email: "john.doe@univ.edu",
  departement: "IRT",
  semestre: "S3",
  groupe: "G1",
};

// Séances du professeur mock
export interface ProfesseurSeance extends Session {
  matiereTitle?: string;
  departements?: string[];
}

export const demoProfesseurSeances: ProfesseurSeance[] = [
  {
    id: "ps1",
    courseCode: "IRT33",
    matiereTitle: "Théorie des langages et compilation",
    type: "TP" as SessionType,
    day: "lundi" as DayName,
    timeSlot: 0,
    room: "104",
    teacher: "Hafedh",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "ps2",
    courseCode: "IRT32",
    matiereTitle: "Intelligence artificielle",
    type: "CM" as SessionType,
    day: "lundi" as DayName,
    timeSlot: 1,
    room: "Amphi",
    teacher: "Hafedh",
    status: "done" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "ps3",
    courseCode: "IRT33",
    matiereTitle: "Théorie des langages et compilation",
    type: "TD" as SessionType,
    day: "mardi" as DayName,
    timeSlot: 2,
    room: "104",
    teacher: "Hafedh",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "ps4",
    courseCode: "IRT32",
    matiereTitle: "Intelligence artificielle",
    type: "TP" as SessionType,
    day: "mercredi" as DayName,
    timeSlot: 3,
    room: "Labo IRT",
    teacher: "Hafedh",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "ps5",
    courseCode: "IRT32",
    matiereTitle: "Intelligence artificielle",
    type: "CM" as SessionType,
    day: "jeudi" as DayName,
    timeSlot: 0,
    room: "Amphi",
    teacher: "Hafedh",
    status: "cancelled" as SessionStatus,
    departements: ["IRT"],
    tags: ["Annulé - Maladie"],
  },
  {
    id: "ps6",
    courseCode: "IRT33",
    matiereTitle: "Théorie des langages et compilation",
    type: "TD" as SessionType,
    day: "vendredi" as DayName,
    timeSlot: 4,
    room: "104",
    teacher: "Hafedh",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
];

// Séances pour l'étudiant (lecture seule)
export const demoEtudiantSeances: ProfesseurSeance[] = [
  {
    id: "es1",
    courseCode: "IRT31",
    matiereTitle: "Développement JEE",
    type: "CM" as SessionType,
    day: "lundi" as DayName,
    timeSlot: 2,
    room: "Amphi",
    teacher: "Abderrahmane",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "es2",
    courseCode: "IRT33",
    matiereTitle: "Théorie des langages",
    type: "TP" as SessionType,
    day: "lundi" as DayName,
    timeSlot: 0,
    room: "104",
    teacher: "Hafedh",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "es3",
    courseCode: "IRT32",
    matiereTitle: "Intelligence artificielle",
    type: "CM" as SessionType,
    day: "mardi" as DayName,
    timeSlot: 1,
    room: "Amphi",
    teacher: "Hafedh",
    status: "done" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "es4",
    courseCode: "HE31",
    matiereTitle: "Langues",
    type: "TD" as SessionType,
    day: "mardi" as DayName,
    timeSlot: 0,
    room: "101-106",
    teacher: "Blake",
    status: "scheduled" as SessionStatus,
    departements: ["IRT"],
  },
  {
    id: "es5",
    courseCode: "IRT36",
    matiereTitle: "Projet intégré",
    type: "Exam" as SessionType,
    day: "mercredi" as DayName,
    timeSlot: 3,
    room: "104",
    teacher: "Moktar",
    status: "exam" as SessionStatus,
    departements: ["IRT"],
    tags: ["Exam"],
  },
];

// Matières pour référentiel étudiant
export interface MatiereReferentiel {
  code: string;
  intitule: string;
  categorie: "ST" | "HE" | "SPECIALTY";
  credits?: number;
  coefficient?: number;
  professeur?: string;
  volumeHoraire?: {
    cm: number;
    td: number;
    tp: number;
  };
}

export const demoMatieres: MatiereReferentiel[] = [
  {
    code: "IRT31",
    intitule: "Développement JEE",
    categorie: "SPECIALTY",
    credits: 3,
    coefficient: 3,
    professeur: "Abderrahmane",
    volumeHoraire: { cm: 6, td: 6, tp: 12 },
  },
  {
    code: "IRT32",
    intitule: "Intelligence artificielle",
    categorie: "SPECIALTY",
    credits: 2,
    coefficient: 2,
    professeur: "Hafedh",
    volumeHoraire: { cm: 5, td: 5, tp: 6 },
  },
  {
    code: "IRT33",
    intitule: "Théorie des langages et compilation",
    categorie: "SPECIALTY",
    credits: 2,
    coefficient: 2,
    professeur: "Hafedh",
    volumeHoraire: { cm: 5, td: 5, tp: 6 },
  },
  {
    code: "IRT34",
    intitule: "Communications numériques",
    categorie: "SPECIALTY",
    credits: 2,
    coefficient: 2,
    professeur: "El Aoun",
    volumeHoraire: { cm: 5, td: 5, tp: 6 },
  },
  {
    code: "HE31",
    intitule: "Langues et communication",
    categorie: "HE",
    credits: 2,
    coefficient: 2,
    professeur: "Blake",
    volumeHoraire: { cm: 0, td: 24, tp: 0 },
  },
  {
    code: "HE32",
    intitule: "Développement personnel",
    categorie: "HE",
    credits: 1,
    coefficient: 1,
    professeur: "LAM",
    volumeHoraire: { cm: 6, td: 0, tp: 0 },
  },
];

// Helper functions
export const getSeancesByProfesseur = (professeurId: string): ProfesseurSeance[] => {
  return demoProfesseurSeances.filter((s) => s.teacher === professeurId);
};

export const getSeanceById = (id: string): ProfesseurSeance | undefined => {
  return demoProfesseurSeances.find((s) => s.id === id);
};

export const updateSeanceStatus = (
  id: string,
  status: SessionStatus
): ProfesseurSeance | undefined => {
  const seance = demoProfesseurSeances.find((s) => s.id === id);
  if (seance) {
    seance.status = status;
  }
  return seance;
};

// Calcul volume horaire professeur
export interface VolumeHoraire {
  matiere: string;
  type: string;
  prevu: number;
  realise: number;
  annule: number;
  restant: number;
}

export const calculerVolumeHoraire = (professeurId: string): VolumeHoraire[] => {
  const matieresMap = new Map<string, VolumeHoraire>();

  demoProfesseurSeances.filter((s) => s.teacher === professeurId).forEach((seance) => {
    const key = `${seance.courseCode}-${seance.type}`;
    const existing = matieresMap.get(key);

    if (existing) {
      existing.prevu += 1.5; // 1h30 par séance
      if (seance.status === "done") existing.realise += 1.5;
      if (seance.status === "cancelled") existing.annule += 1.5;
      existing.restant = existing.prevu - existing.realise - existing.annule;
    } else {
      const realise = seance.status === "done" ? 1.5 : 0;
      const annule = seance.status === "cancelled" ? 1.5 : 0;
      matieresMap.set(key, {
        matiere: seance.matiereTitle || seance.courseCode,
        type: seance.type,
        prevu: 1.5,
        realise,
        annule,
        restant: 1.5 - realise - annule,
      });
    }
  });

  return Array.from(matieresMap.values());
};

// Totaux volume horaire
export const calculerTotaux = (volumes: VolumeHoraire[]) => {
  return volumes.reduce(
    (acc, v) => ({
      prevu: acc.prevu + v.prevu,
      realise: acc.realise + v.realise,
      annule: acc.annule + v.annule,
      restant: acc.restant + v.restant,
    }),
    { prevu: 0, realise: 0, annule: 0, restant: 0 }
  );
};
