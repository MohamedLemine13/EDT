import { useState } from "react";

import { useSetup, SetupProvider } from "@/hooks/useSetupContext";
import { authService, semaineService, creneauService } from "@/services";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  Building2,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  CalendarDays,
} from "lucide-react";

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: { key: string; label: string; icon: React.ElementType }[];
  currentStep: string;
}) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex flex-col items-center gap-1 ${
                  isActive
                    ? "text-primary"
                    : isCompleted
                    ? "text-primary/70"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-primary/70 bg-primary/70 text-primary-foreground"
                      : "border-muted bg-muted"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    isCompleted ? "bg-primary/70" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EcoleStep() {
  const { addEcole, setCurrentStep, ecoles } = useSetup();
  const [formData, setFormData] = useState({
    id: "",
    nom: "",
    domaine: "",
    slug: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = "L'ID est requis";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.domaine.trim()) newErrors.domaine = "Le domaine est requis";
    if (!formData.slug.trim()) newErrors.slug = "Le slug est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ecoles.length > 0 && !formData.id && !formData.nom && !formData.domaine && !formData.slug) {
      setCurrentStep("departements");
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addEcole(formData);
      setCurrentStep("departements");
    } catch (error) {
      console.error("Failed to create ecole:", error);
      alert("Erreur lors de la création de l'école. Vérifiez que vous êtes connecté.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-6 h-6" />
            Créer votre École
          </CardTitle>
          <CardDescription>
            Commencez par créer l&apos;école principale de votre institution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ecoles.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <Check className="w-5 h-5" />
                <span className="font-medium">École créée : {ecoles[0].nom}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ecole-id">ID</Label>
                <Input
                  id="ecole-id"
                  placeholder="E01"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className={errors.id ? "border-red-500" : ""}
                />
                {errors.id && <p className="text-xs text-red-500">{errors.id}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ecole-slug">Slug</Label>
                <Input
                  id="ecole-slug"
                  placeholder="esp"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={errors.slug ? "border-red-500" : ""}
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ecole-nom">Nom de l&apos;école</Label>
              <Input
                id="ecole-nom"
                placeholder="École Supérieure Polytechnique"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className={errors.nom ? "border-red-500" : ""}
              />
              {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ecole-domaine">Domaine</Label>
              <Input
                id="ecole-domaine"
                placeholder="Informatique, Réseaux & Télécommunications"
                value={formData.domaine}
                onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
                className={errors.domaine ? "border-red-500" : ""}
              />
              {errors.domaine && <p className="text-xs text-red-500">{errors.domaine}</p>}
            </div>
            <div className="flex justify-end pt-4 gap-3">
              {ecoles.length > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setCurrentStep("departements")}
                >
                  Continuer sans modifier
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : (ecoles.length > 0 ? "Ajouter une autre école" : "Créer et Continuer")}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DepartementsStep() {
  const { addDepartement, departements, ecoles, setCurrentStep } = useSetup();
  const [formData, setFormData] = useState({ code: "", nom: "", ecoleId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeEcole = ecoles[0];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = "Le code est requis";
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addDepartement({ ...formData, ecoleId: activeEcole?.id || "" });
      setFormData({ code: "", nom: "", ecoleId: "" });
    } catch (error) {
      console.error("Failed to create departement:", error);
      alert("Erreur lors de la création du département.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (departements.length > 0) {
      setCurrentStep("semestres");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Ajouter un Département
            </CardTitle>
            <CardDescription>
              Créez les départements de {activeEcole?.nom || "votre école"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept-code">Code</Label>
                <Input
                  id="dept-code"
                  placeholder="IRT"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-nom">Nom du département</Label>
                <Input
                  id="dept-nom"
                  placeholder="Informatique Réseaux Télécom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className={errors.nom ? "border-red-500" : ""}
                />
                {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
              </div>
              <Button type="submit" className="w-full" variant="outline" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Création..." : "Ajouter le Département"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Départements créés</CardTitle>
            <CardDescription>
              {departements.length === 0
                ? "Aucun département créé"
                : `${departements.length} département(s) créé(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departements.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{dept.nom}</p>
                    <p className="text-xs text-muted-foreground">Code: {dept.code}</p>
                  </div>
                  <Badge variant="secondary">{dept.code}</Badge>
                </div>
              ))}
            </div>

            {departements.length > 0 && (
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("ecole")}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleContinue}>
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SemestresStep() {
  const { addSemestre, semestres, setCurrentStep } = useSetup();
  const [formData, setFormData] = useState({ libelle: "S1", dateDebut: "", dateFin: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateWeeks = async (semestreId: number, start: Date, end: Date) => {
    let currentStart = new Date(start);
    let weekNum = 1;
    // ensure monday
    const day = currentStart.getDay();
    const diff = currentStart.getDate() - day + (day === 0 ? -6 : 1);
    currentStart.setDate(diff);

    const promises = [];
    while (currentStart <= end) {
      const weekEnd = new Date(currentStart);
      weekEnd.setDate(currentStart.getDate() + 5); // Saturday
      promises.push(
        semaineService.create({
          numeroSemaine: weekNum++,
          dateDebut: currentStart.toISOString().split('T')[0],
          dateFin: weekEnd.toISOString().split('T')[0],
          semestreId: semestreId
        })
      );
      currentStart.setDate(currentStart.getDate() + 7);
    }
    await Promise.all(promises);
  };

  const generateCreneaux = async (semestreId: number) => {
    const jours = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    const horaires = [
      { debut: "08:00:00", fin: "09:30:00" },
      { debut: "09:45:00", fin: "11:15:00" },
      { debut: "11:30:00", fin: "13:00:00" },
      { debut: "15:00:00", fin: "16:30:00" },
      { debut: "17:00:00", fin: "18:30:00" },
    ];

    const promises = [];
    for (const jour of jours) {
      for (const h of horaires) {
        promises.push(
          creneauService.create({
            jour: jour as "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI",
            heureDebut: h.debut,
            heureFin: h.fin,
            typeCreneau: "AUTRE",
            semestreId,
          })
        );
      }
    }
    await Promise.all(promises);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.libelle.trim()) newErrors.libelle = "Le libellé est requis";
    if (!formData.dateDebut) newErrors.dateDebut = "Date de début requise";
    if (!formData.dateFin) newErrors.dateFin = "Date de fin requise";
    if (formData.dateDebut && formData.dateFin && formData.dateDebut >= formData.dateFin) {
       newErrors.dateFin = "La date de fin doit être après le début";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const sem = await addSemestre({
         libelle: formData.libelle,
         dateDebut: formData.dateDebut,
         dateFin: formData.dateFin
      });
      await generateWeeks(sem.id, new Date(formData.dateDebut), new Date(formData.dateFin));
      await generateCreneaux(sem.id);
      setFormData({ libelle: "S" + (semestres.length + 2), dateDebut: "", dateFin: "" });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du semestre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (semestres.length > 0) {
      setCurrentStep("administrateurs");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-6 h-6" />
              Ajouter un Semestre
            </CardTitle>
            <CardDescription>
              Définissez l'année académique et les semestres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sem-libelle">Libellé (ex: Semestre 1)</Label>
                <Input
                  id="sem-libelle"
                  placeholder="S1"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className={errors.libelle ? "border-red-500" : ""}
                />
                {errors.libelle && <p className="text-xs text-red-500">{errors.libelle}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sem-debut">Date de début</Label>
                  <Input
                    id="sem-debut"
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    className={errors.dateDebut ? "border-red-500" : ""}
                  />
                  {errors.dateDebut && <p className="text-xs text-red-500">{errors.dateDebut}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sem-fin">Date de fin</Label>
                  <Input
                    id="sem-fin"
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    className={errors.dateFin ? "border-red-500" : ""}
                  />
                  {errors.dateFin && <p className="text-xs text-red-500">{errors.dateFin}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full" variant="outline" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Création..." : "Ajouter le Semestre et générer les semaines"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semestres créés</CardTitle>
            <CardDescription>
              {semestres.length === 0
                ? "Aucun semestre créé"
                : `${semestres.length} semestre(s) créé(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {semestres.map((sem) => (
                <div
                  key={sem.id}
                  className="flex flex-col p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{sem.libelle}</p>
                    <Badge variant="secondary">{sem.dateDebut.split('-')[0]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Du {new Date(sem.dateDebut).toLocaleDateString('fr-FR')} au {new Date(sem.dateFin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>

            {semestres.length > 0 && (
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("departements")}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleContinue}>
                  Continuer
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type AdminType = "ADMIN_PRINCIPAL" | "CHEF_HE" | "CHEF_ST" | "CHEF_DEPARTEMENT";

interface Administrateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  type: AdminType;
  departementId?: string;
  created?: boolean;
}

function AdministrateursStep() {
  const { setCurrentStep, finishSetup, departements } = useSetup();
  const [administrateurs, setAdministrateurs] = useState<Administrateur[]>([]);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    type: "" as AdminType | "",
    departementId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.type) newErrors.type = "Le type est requis";
    if (formData.type === "CHEF_DEPARTEMENT" && !formData.departementId) {
      newErrors.departementId = "Le département est requis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Créer l'utilisateur dans le backend via l'API
      const roleMap: Record<AdminType, UserRole> = {
        ADMIN_PRINCIPAL: "ADMIN",
        CHEF_HE: "CHEF_HE",
        CHEF_ST: "CHEF_ST",
        CHEF_DEPARTEMENT: "CHEF_DEP",
      };

      await authService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: "password123", // Mot de passe temporaire
        role: roleMap[formData.type as AdminType],
        departementId: formData.departementId ? parseInt(formData.departementId) : undefined,
      });

      const newAdmin: Administrateur = {
        id: Date.now().toString(),
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        type: formData.type as AdminType,
        departementId: formData.departementId || undefined,
        created: true, // Marquer comme déjà créé dans le backend
      };

      setAdministrateurs((prev) => [...prev, newAdmin]);
      setFormData({ nom: "", prenom: "", email: "", type: "", departementId: "" });
    } catch (error) {
      console.error("Failed to create admin:", error);
      alert("Erreur lors de la création de l'administrateur. Vérifiez l'email ou la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    const hasAdminPrincipal = administrateurs.some((a) => a.type === "ADMIN_PRINCIPAL");
    if (hasAdminPrincipal) {
      // Créer tous les administrateurs dans le backend avant de terminer
      setIsSubmitting(true);
      try {
        for (const admin of administrateurs) {
          if (!admin.created) { // Éviter de recréer les admins déjà créés
            const roleMap: Record<AdminType, import("@/types").UserRole> = {
              ADMIN_PRINCIPAL: "ADMIN",
              CHEF_HE: "CHEF_HE",
              CHEF_ST: "CHEF_ST",
              CHEF_DEPARTEMENT: "CHEF_DEP",
            };

            await authService.register({
              nom: admin.nom,
              prenom: admin.prenom,
              email: admin.email,
              password: "password123",
              role: roleMap[admin.type],
              departementId: admin.departementId ? parseInt(admin.departementId) : undefined,
            });
            admin.created = true;
          }
        }
        finishSetup();
      } catch (error) {
        console.error("Failed to create admins:", error);
        alert("Erreur lors de la création des administrateurs.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getTypeLabel = (type: AdminType) => {
    switch (type) {
      case "ADMIN_PRINCIPAL":
        return "Administrateur Principal";
      case "CHEF_HE":
        return "Chef de Pôle HE";
      case "CHEF_ST":
        return "Chef de Pôle ST";
      case "CHEF_DEPARTEMENT":
        return "Chef de Département";
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: AdminType) => {
    switch (type) {
      case "ADMIN_PRINCIPAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "CHEF_HE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CHEF_ST":
        return "bg-green-100 text-green-800 border-green-200";
      case "CHEF_DEPARTEMENT":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "";
    }
  };

  const hasAdminPrincipal = administrateurs.some((a) => a.type === "ADMIN_PRINCIPAL");
  const adminPrincipalCount = administrateurs.filter((a) => a.type === "ADMIN_PRINCIPAL").length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Ajouter un Administrateur
            </CardTitle>
            <CardDescription>
              Définissez l'admin principal et les responsables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-nom">Nom</Label>
                  <Input
                    id="admin-nom"
                    placeholder="Dupont"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className={errors.nom ? "border-red-500" : ""}
                  />
                  {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-prenom">Prénom</Label>
                  <Input
                    id="admin-prenom"
                    placeholder="Jean"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className={errors.prenom ? "border-red-500" : ""}
                  />
                  {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="jean.dupont@ecole.fr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as AdminType, departementId: "" })
                  }
                >
                  <SelectTrigger id="admin-type" className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN_PRINCIPAL" disabled={adminPrincipalCount > 0}>
                      Administrateur Principal {adminPrincipalCount > 0 && "(déjà créé)"}
                    </SelectItem>
                    <SelectItem value="CHEF_HE">Chef de Pôle HE</SelectItem>
                    <SelectItem value="CHEF_ST">Chef de Pôle ST</SelectItem>
                    <SelectItem value="CHEF_DEPARTEMENT">Chef de Département</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
              </div>
              {formData.type === "CHEF_DEPARTEMENT" && (
                <div className="space-y-2">
                  <Label htmlFor="admin-dept">Département</Label>
                  <Select
                    value={formData.departementId}
                    onValueChange={(v) => setFormData({ ...formData, departementId: v })}
                  >
                    <SelectTrigger id="admin-dept" className={errors.departementId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departements.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.code} - {dept.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departementId && <p className="text-xs text-red-500">{errors.departementId}</p>}
                </div>
              )}
              <Button type="submit" className="w-full" variant="outline" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? "Création..." : "Ajouter l'Administrateur"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administrateurs créés</CardTitle>
            <CardDescription>
              {administrateurs.length === 0
                ? "Aucun administrateur créé"
                : `${administrateurs.length} administrateur(s) créé(s)`}
              {hasAdminPrincipal && (
                <span className="text-green-600 block text-xs mt-1">
                  ✓ Admin principal défini
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {administrateurs.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-col p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {admin.prenom} {admin.nom}
                    </p>
                    <Badge className={getTypeBadgeColor(admin.type)}>
                      {getTypeLabel(admin.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                  {admin.departementId && (
                    <p className="text-xs text-muted-foreground">
                      {departements.find((d) => d.id.toString() === admin.departementId)?.nom}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {hasAdminPrincipal && (
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("departements")}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button onClick={handleFinish} size="lg" className="bg-green-600 hover:bg-green-700">
                  Terminer la Configuration
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
            {!hasAdminPrincipal && administrateurs.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  ⚠️ Vous devez créer un Administrateur Principal pour terminer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SetupCompleteDashboard() {
  const { ecoles, departements, semestres, professeurs, salles, setCurrentStep } = useSetup();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Configuration Terminée</h1>
        <p className="text-muted-foreground mt-2">
          Votre environnement EduManager est configuré et opérationnel.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <School className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{ecoles.length}</p>
            <p className="text-sm text-muted-foreground">École(s)</p>
            {ecoles[0] && <p className="text-xs mt-1 font-medium">{ecoles[0].nom}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{departements.length}</p>
            <p className="text-sm text-muted-foreground">Département(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{semestres.length}</p>
            <p className="text-sm text-muted-foreground">Semestre(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{professeurs.length}</p>
            <p className="text-sm text-muted-foreground">Professeur(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{salles.length}</p>
            <p className="text-sm text-muted-foreground">Salle(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Details cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ecole details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Écoles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ecoles.map((e) => (
              <div key={e.id} className="p-3 bg-muted rounded-lg mb-2">
                <p className="font-medium">{e.nom}</p>
                <p className="text-xs text-muted-foreground">ID: {e.id} • Domaine: {e.domaine} • Slug: {e.slug}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Departements list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Départements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departements.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-muted rounded-lg mb-2">
                <div>
                  <p className="font-medium">{d.nom}</p>
                  <p className="text-xs text-muted-foreground">Code: {d.code}</p>
                </div>
                <Badge variant="secondary">{d.code}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reset button */}
      <div className="text-center">
        {showResetConfirm ? (
          <div className="inline-flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">Êtes-vous sûr ? Vous allez retourner à la première étape pour modifier la configuration.</p>
            <Button variant="default" size="sm" onClick={() => { setCurrentStep('ecole'); setShowResetConfirm(false); }}>Confirmer</Button>
            <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>Annuler</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
            Reconfigurer
          </Button>
        )}
      </div>
    </div>
  );
}

function SetupContent() {
  const { currentStep, setCurrentStep, ecoles, departements, isInitialized } = useSetup();

  // Wait for API data to load before deciding what to show
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la configuration...</p>
        </div>
      </div>
    );
  }

  // If data already exists, show the completed dashboard
  const hasExistingData = ecoles.length > 0 && departements.length > 0;
  if (hasExistingData && currentStep !== "ecole" && currentStep !== "departements" && currentStep !== "semestres" && currentStep !== "administrateurs") {
    return <SetupCompleteDashboard />;
  }

  // Handle navigation to complete page
  if (currentStep === "complete") {
    return <SetupCompleteDashboard />;
  }

  // Reset to ecole ONLY if no école exists at all (true fresh start)
  if (ecoles.length === 0 && currentStep !== "ecole") {
    setCurrentStep("ecole");
  }

  const steps = [
    { key: "ecole", label: "École", icon: School },
    { key: "departements", label: "Départements", icon: Building2 },
    { key: "semestres", label: "Semestres", icon: CalendarDays },
    { key: "administrateurs", label: "Administrateurs", icon: Shield },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Configuration Initiale</h1>
        <p className="text-muted-foreground mt-2">
          Configurez votre environnement EduManager étape par étape
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="mt-8">
        {currentStep === "ecole" && <EcoleStep />}
        {currentStep === "departements" && <DepartementsStep />}
        {currentStep === "semestres" && <SemestresStep />}
        {currentStep === "administrateurs" && <AdministrateursStep />}
      </div>
    </div>
  );
}

export default function Setup() {
  return (
    <SetupProvider>
      <SetupContent />
    </SetupProvider>
  );
}
