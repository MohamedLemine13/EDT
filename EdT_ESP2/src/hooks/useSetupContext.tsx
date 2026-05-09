import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { ecoleService, departementService, professeurService, salleService } from "@/services";
import type { CreateEcoleDto, CreateDepartementDto, CreateProfesseurDto, CreateSalleDto } from "@/types";

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
  statut: "PERMANENT" | "VACATAIRE";
}

export interface Salle {
  id: number;
  nom: string;
  typeSalle: "SALLE" | "AMPHI" | "LABO";
  ecoleId: string;
  departementId?: number;
}

type SetupStep = "ecole" | "departements" | "administrateurs" | "salles" | "complete";

interface SetupContextType {
  currentStep: SetupStep;
  setCurrentStep: (step: SetupStep) => void;
  isInitialized: boolean;
  ecoles: Ecole[];
  addEcole: (ecole: Omit<Ecole, "id">) => Promise<Ecole>;
  departements: Departement[];
  addDepartement: (dept: Omit<Departement, "id">) => Promise<Departement>;
  professeurs: Professeur[];
  addProfesseur: (prof: Omit<Professeur, "id">) => Promise<Professeur>;
  salles: Salle[];
  addSalle: (salle: Omit<Salle, "id">) => Promise<Salle>;
  getActiveEcole: () => Ecole | undefined;
  getActiveDepartement: () => Departement | undefined;
  isSetupComplete: () => boolean;
  finishSetup: () => void;
  resetSetup: () => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

const STORAGE_KEY = "edumanager-setup-data";
const STEP_KEY = "edumanager-setup-step";
const ACADEMIC_CONTEXT_KEY = "edumanager-academic-context";

export function SetupProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStepState] = useState<SetupStep>("ecole");
  const [isInitialized, setIsInitialized] = useState(false);
  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  // Initialize from API on mount - load real data from backend
  useEffect(() => {
    const loadDataFromApi = async () => {
      try {
        // Load all data from API in parallel
        const [ecolesData, departementsData, professeursData, sallesData] = await Promise.all([
          ecoleService.getAll().catch(() => []),
          departementService.getAll().catch(() => []),
          professeurService.getAll().catch(() => []),
          salleService.getAll().catch(() => []),
        ]);

        // Use requestAnimationFrame to avoid setState in effect warning
        requestAnimationFrame(() => {
          setEcoles(ecolesData);
          setDepartements(departementsData);
          setProfesseurs(professeursData);
          setSalles(sallesData);

          // Determine current step based on data availability
          const savedStep = localStorage.getItem(STEP_KEY);
          const hasData = ecolesData.length > 0 || departementsData.length > 0;

          if (savedStep && (savedStep !== "complete" || hasData)) {
            setCurrentStepState(savedStep as SetupStep);
          } else if (ecolesData.length === 0) {
            setCurrentStepState("ecole");
          } else if (departementsData.length === 0) {
            setCurrentStepState("departements");
          } else {
            setCurrentStepState("complete");
          }

          setIsInitialized(true);
        });
      } catch (error) {
        console.error("Failed to load setup data from API:", error);
        // Fallback: use localStorage if API fails
        const savedStep = localStorage.getItem(STEP_KEY);
        const savedData = localStorage.getItem(STORAGE_KEY);

        requestAnimationFrame(() => {
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setEcoles(parsed.ecoles || []);
              setDepartements(parsed.departements || []);
              setProfesseurs(parsed.professeurs || []);
              setSalles(parsed.salles || []);
            } catch {
              console.error("Failed to parse fallback data");
            }
          }
          setCurrentStepState((savedStep as SetupStep) || "ecole");
          setIsInitialized(true);
        });
      }
    };

    loadDataFromApi();
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ecoles,
        departements,
        professeurs,
        salles,
      }));
    }
  }, [ecoles, departements, professeurs, salles, isInitialized]);

  const setCurrentStep = useCallback((step: SetupStep) => {
    setCurrentStepState(step);
    if (typeof window !== "undefined") {
      localStorage.setItem(STEP_KEY, step);
    }
  }, []);

  const addEcole = useCallback(async (ecoleData: Omit<Ecole, "id">): Promise<Ecole> => {
    try {
      const dto: CreateEcoleDto = {
        id: crypto.randomUUID().substring(0, 8).toUpperCase(),
        nom: ecoleData.nom,
        domaine: ecoleData.domaine,
        slug: ecoleData.slug,
      };
      const created = await ecoleService.create(dto);
      const newEcole: Ecole = {
        id: created.id,
        nom: created.nom,
        domaine: created.domaine,
        slug: created.slug,
      };
      setEcoles(prev => [...prev, newEcole]);
      return newEcole;
    } catch (error) {
      console.error("Failed to create ecole:", error);
      throw error;
    }
  }, []);

  const addDepartement = useCallback(async (deptData: Omit<Departement, "id">): Promise<Departement> => {
    try {
      const dto: CreateDepartementDto = {
        code: deptData.code,
        nom: deptData.nom,
        ecoleId: deptData.ecoleId,
      };
      const created = await departementService.create(dto);
      const newDept: Departement = {
        id: created.id,
        code: created.code,
        nom: created.nom,
        ecoleId: created.ecoleId,
      };
      setDepartements(prev => [...prev, newDept]);
      return newDept;
    } catch (error) {
      console.error("Failed to create departement:", error);
      throw error;
    }
  }, []);

  const addProfesseur = useCallback(async (profData: Omit<Professeur, "id">): Promise<Professeur> => {
    try {
      const dto: CreateProfesseurDto = {
        nom: profData.nom,
        prenom: profData.prenom,
        statut: profData.statut,
      };
      const created = await professeurService.create(dto);
      const newProf: Professeur = {
        id: created.id,
        nom: created.nom,
        prenom: created.prenom,
        statut: created.statut,
      };
      setProfesseurs(prev => [...prev, newProf]);
      return newProf;
    } catch (error) {
      console.error("Failed to create professeur:", error);
      throw error;
    }
  }, []);

  const addSalle = useCallback(async (salleData: Omit<Salle, "id">): Promise<Salle> => {
    try {
      const dto: CreateSalleDto = {
        nom: salleData.nom,
        typeSalle: salleData.typeSalle,
        ecoleId: salleData.ecoleId,
        departementId: salleData.departementId,
      };
      const created = await salleService.create(dto);
      const newSalle: Salle = {
        id: created.id,
        nom: created.nom,
        typeSalle: created.typeSalle,
        ecoleId: created.ecoleId,
        departementId: created.departementId,
      };
      setSalles(prev => [...prev, newSalle]);
      return newSalle;
    } catch (error) {
      console.error("Failed to create salle:", error);
      throw error;
    }
  }, []);

  const getActiveEcole = useCallback(() => {
    return ecoles[0];
  }, [ecoles]);

  const getActiveDepartement = useCallback(() => {
    return departements[0];
  }, [departements]);

  const isSetupComplete = useCallback(() => {
    return ecoles.length > 0 && departements.length > 0 && professeurs.length > 0 && salles.length > 0;
  }, [ecoles.length, departements.length, professeurs.length, salles.length]);

  const finishSetup = useCallback(() => {
    // Sauvegarder explicitement toutes les données avant de quitter
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ecoles,
        departements,
        professeurs,
        salles,
      }));

      localStorage.setItem(ACADEMIC_CONTEXT_KEY, JSON.stringify({
        activeSemester: "S1",
        activeWeek: 1,
        activeSchool: ecoles[0]?.id,
        activeDepartment: departements[0]?.id,
        setupCompleted: true,
        completedAt: new Date().toISOString(),
      }));

      // Also update the main app context keys for compatibility
      localStorage.setItem("esp-semester", "S1");
      localStorage.setItem("esp-week", "1");
      if (ecoles[0]) {
        localStorage.setItem("esp-school", ecoles[0].id);
      }
      if (departements[0]) {
        localStorage.setItem("esp-department", departements[0].code);
      }
    }
    setCurrentStep("complete");
  }, [ecoles, departements, professeurs, salles, setCurrentStep]);

  const resetSetup = useCallback(() => {
    setEcoles([]);
    setDepartements([]);
    setProfesseurs([]);
    setSalles([]);
    setCurrentStep("ecole");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      localStorage.removeItem(ACADEMIC_CONTEXT_KEY);
    }
  }, [setCurrentStep]);

  return (
    <SetupContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        isInitialized,
        ecoles,
        addEcole,
        departements,
        addDepartement,
        professeurs,
        addProfesseur,
        salles,
        addSalle,
        getActiveEcole,
        getActiveDepartement,
        isSetupComplete,
        finishSetup,
        resetSetup,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSetup() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function getAcademicContext() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(ACADEMIC_CONTEXT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return null;
}

// eslint-disable-next-line react-refresh/only-export-components
export function isSetupFinished() {
  const context = getAcademicContext();
  return context?.setupCompleted === true;
}
