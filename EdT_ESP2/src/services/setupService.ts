import type { Ecole, Departement, Professeur, Salle } from "../types";

// Clés localStorage
const STORAGE_KEYS = {
  ecoles: "esp_ecoles",
  departements: "esp_departements",
  professeurs: "esp_professeurs",
  salles: "esp_salles",
};

// Helper pour générer des IDs
const generateId = (_prefix: string, existingItems: any[]) => {
  const maxId =
    existingItems.length > 0
      ? Math.max(
          ...existingItems.map((item) => {
            const id =
              typeof item.id === "string"
                ? parseInt(item.id.replace(/\D/g, "") || "0")
                : item.id;
            return id;
          }),
        )
      : 0;
  return maxId + 1;
};

// Ecoles
export const createEcole = async (
  data: Omit<Ecole, "id"> & { id: string },
): Promise<Ecole> => {
  const ecoles = await getEcoles();
  const newEcole: Ecole = {
    ...data,
    id: data.id,
  };
  ecoles.push(newEcole);
  localStorage.setItem(STORAGE_KEYS.ecoles, JSON.stringify(ecoles));
  return newEcole;
};

export const getEcoles = async (): Promise<Ecole[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.ecoles);
  return stored ? JSON.parse(stored) : [];
};

// Départements
export const createDepartement = async (
  data: Omit<Departement, "id">,
): Promise<Departement> => {
  const departements = await getDepartements();
  const newDept: Departement = {
    ...data,
    id: generateId("D", departements),
  };
  departements.push(newDept);
  localStorage.setItem(STORAGE_KEYS.departements, JSON.stringify(departements));
  return newDept;
};

export const getDepartements = async (): Promise<Departement[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.departements);
  return stored ? JSON.parse(stored) : [];
};

// Professeurs
export const createProfesseur = async (
  data: Omit<Professeur, "id">,
): Promise<Professeur> => {
  const professeurs = await getProfesseurs();
  const newProf: Professeur = {
    ...data,
    id: generateId("P", professeurs),
  };
  professeurs.push(newProf);
  localStorage.setItem(STORAGE_KEYS.professeurs, JSON.stringify(professeurs));
  return newProf;
};

export const getProfesseurs = async (): Promise<Professeur[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.professeurs);
  return stored ? JSON.parse(stored) : [];
};

// Salles
export const createSalle = async (data: Omit<Salle, "id">): Promise<Salle> => {
  const salles = await getSalles();
  const newSalle: Salle = {
    ...data,
    id: generateId("S", salles),
  };
  salles.push(newSalle);
  localStorage.setItem(STORAGE_KEYS.salles, JSON.stringify(salles));
  return newSalle;
};

export const getSalles = async (): Promise<Salle[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.salles);
  return stored ? JSON.parse(stored) : [];
};
