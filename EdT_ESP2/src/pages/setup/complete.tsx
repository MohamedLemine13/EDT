import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserHeader from "@/components/layout/UserHeader";
import {
  Calendar,
  LayoutGrid,
  Table,
  Database,
  Check,
  School,
  Building2,
  User,
  DoorOpen,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const STORAGE_KEY = "edumanager-setup-data";
const ACADEMIC_CONTEXT_KEY = "edumanager-academic-context";
const STEP_KEY = "edumanager-setup-step";

function getAcademicContext() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(ACADEMIC_CONTEXT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
  }
  return null;
}

interface SetupData {
  id: string;
  nom?: string;
  code?: string;
  prenom?: string;
  statut?: string;
  typeSalle?: string;
}

export default function SetupComplete() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [ecoles, setEcoles] = useState<SetupData[]>([]);
  const [departements, setDepartements] = useState<SetupData[]>([]);
  const [professeurs, setProfesseurs] = useState<SetupData[]>([]);
  const [salles, setSalles] = useState<SetupData[]>([]);
  const [academicContext] = useState<ReturnType<typeof getAcademicContext>>(getAcademicContext());

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Use requestAnimationFrame to avoid setState in effect warning
        requestAnimationFrame(() => {
          setEcoles(data.ecoles || []);
          setDepartements(data.departements || []);
          setProfesseurs(data.professeurs || []);
          setSalles(data.salles || []);
        });
      } catch {
        console.error("Failed to parse setup data");
      }
    }

    // Small delay to show loading state
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  // Ne pas rediriger automatiquement - permettre de voir la page même sans données
  // L'utilisateur peut cliquer sur "Recommencer la configuration" s'il le souhaite

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir recommencer la configuration ? Toutes les données seront perdues.")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      localStorage.removeItem(ACADEMIC_CONTEXT_KEY);
      navigate("/setup");
    }
  };

  // Rendu loading avec header
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <span className="font-semibold text-gray-900">EduManager</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="p-6 lg:p-8 max-w-6xl mx-auto text-center mt-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-primary/50" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Chargement...</h1>
        </div>
      </div>
    );
  }

  const actionCards = [
    {
      title: "Créer votre année académique",
      description: "Configurez le calendrier académique, les semaines, les vacances et les événements importants.",
      icon: Calendar,
      route: "/calendrier",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      title: "Créer votre plan",
      description: "Préparez le planning semestriel avec les matières, les enseignants et les répartitions.",
      icon: LayoutGrid,
      route: "/plan",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
    {
      title: "Créer votre emploi du temps",
      description: "Générez ou visualisez la feuille d'emploi du temps avec les créneaux horaires.",
      icon: Table,
      route: "/",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      title: "Créer votre base de données",
      description: "Complétez les matières, les affectations et les données académiques détaillées.",
      icon: Database,
      route: "/bdd",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec User Info */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <span className="font-semibold text-gray-900">EduManager</span>
        </div>
        <UserHeader />
      </div>

      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        {ecoles.length > 0 || departements.length > 0 ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Configuration terminée
            </h1>
            <p className="text-muted-foreground text-lg">
              Votre environnement EduManager est prêt à l&apos;emploi
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <School className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Aucune configuration
            </h1>
            <p className="text-muted-foreground text-lg">
              Veuillez configurer votre école pour commencer
            </p>
          </>
        )}
      </div>

      {/* Summary Card */}
      <Card className="mb-10 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <School className="w-5 h-5" />
            Résumé de la configuration
          </CardTitle>
          <CardDescription>
            Voici un aperçu de ce qui a été configuré
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ecoles.length}</p>
                <p className="text-xs text-muted-foreground">École</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{departements.length}</p>
                <p className="text-xs text-muted-foreground">Départements</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{professeurs.length}</p>
                <p className="text-xs text-muted-foreground">Professeurs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <DoorOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{salles.length}</p>
                <p className="text-xs text-muted-foreground">Salles</p>
              </div>
            </div>
          </div>

          {/* Academic Context */}
          <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Contexte académique :</span>
              <Badge variant="default" className="bg-green-600">
                Semestre {academicContext?.activeSemester || "S1"}
              </Badge>
              <Badge variant="default" className="bg-blue-600">
                Semaine {academicContext?.activeWeek || 1}
              </Badge>
              {ecoles[0] && (
                <Badge variant="outline">{ecoles[0].nom}</Badge>
              )}
              {departements[0] && (
                <Badge variant="secondary">{departements[0].code}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Que souhaitez-vous faire maintenant ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
                onClick={() => navigate(card.route)}
              >
                <CardHeader className={`${card.color} ${card.hoverColor} text-white transition-colors`}>
                  <div className="flex items-center justify-between">
                    <Icon className="w-8 h-8" />
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardTitle className="text-white text-lg mt-2">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="mb-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Conseils pour démarrer</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>
                <strong className="text-foreground">Année académique</strong> : Commencez par configurer 
                votre calendrier pour définir les semaines de cours et les vacances.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>
                <strong className="text-foreground">Base de données</strong> : Ajoutez les matières et 
                les cours pour préparer vos emplois du temps.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>
                <strong className="text-foreground">Plan semestriel</strong> : Créez le plan avec les 
                répartitions de matières par semestre.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>
                <strong className="text-foreground">Emploi du temps</strong> : Générez enfin vos feuilles 
                d&apos;emploi du temps hebdomadaires.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
          <RotateCcw className="w-4 h-4 mr-2" />
          Recommencer la configuration
        </Button>
        <Button onClick={() => navigate("/")} size="lg" className="w-full sm:w-auto">
          Aller à l&apos;accueil
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      </div>
    </div>
  );
}
