import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { demoProfesseurSeances, demoProfesseur } from "@/data/demo-users";
import { DAY_LABELS } from "@/types";

const timeSlots = [
  { id: 0, label: "8h00-9h30" },
  { id: 1, label: "09h45-11h15" },
  { id: 2, label: "11h30-13h00" },
  { id: 3, label: "15h10-16h40" },
  { id: 4, label: "17h00-18h30" },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    exam: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };
  const labels: Record<string, string> = {
    scheduled: "Planifiée",
    done: "Réalisée",
    cancelled: "Annulée",
    exam: "Examen",
  };
  return (
    <Badge className={`${styles[status] || styles.scheduled}`}>
      {labels[status] || status}
    </Badge>
  );
};

const getTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    CM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    TD: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    TP: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    Exam: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Special: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return (
    <Badge className={`${styles[type] || styles.CM}`}>
      {type}
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="w-12 h-12 text-green-500" />;
    case "cancelled":
      return <XCircle className="w-12 h-12 text-red-500" />;
    case "exam":
      return <AlertCircle className="w-12 h-12 text-purple-500" />;
    default:
      return <Clock className="w-12 h-12 text-blue-500" />;
  }
};

export default function SeanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const seance = demoProfesseurSeances.find((s) => s.id === id);

  if (!seance) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link to="/professeur/seances">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Séance non trouvée</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">La séance demandée n'existe pas.</p>
            <Link to="/professeur/seances" className="mt-4 inline-block">
              <Button>Retour à la liste</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeSlot = timeSlots.find((t) => t.id === seance.timeSlot);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/professeur/seances">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Détail de la séance</h1>
          <p className="text-muted-foreground mt-1">
            {seance.courseCode} - {seance.matiereTitle}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {getStatusIcon(seance.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold">{getStatusBadge(seance.status)}</span>
                {getTypeBadge(seance.type)}
              </div>
              <p className="text-muted-foreground">
                Séance {seance.status === "done" ? "réalisée" : seance.status === "cancelled" ? "annulée" : "planifiée"} le {DAY_LABELS[seance.day]} {timeSlot?.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Informations du cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Code</span>
              <span className="font-medium">{seance.courseCode}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Matière</span>
              <span className="font-medium">{seance.matiereTitle}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{seance.type}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Enseignant</span>
              <span className="font-medium">{demoProfesseur.prenom} {demoProfesseur.nom}</span>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Horaire et lieu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Jour</span>
              <span className="font-medium">{DAY_LABELS[seance.day]}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Créneau</span>
              <span className="font-medium">{timeSlot?.label}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">Salle</span>
              <span className="font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {seance.room}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/professeur/seances">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
        <Link to="/professeur/emploi-du-temps">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Voir l'emploi du temps
          </Button>
        </Link>
      </div>
    </div>
  );
}
