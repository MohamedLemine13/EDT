import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, GraduationCap, BookOpen, ChevronLeft, ChevronRight, Sun, Snowflake, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { calendrierService, semestreService, semaineService } from "@/services";
import type { EvenementCalendrierDto, SemestreDto, SemaineAcademiqueDto } from "@/types";

const EVENT_TYPE_MAP: Record<string, { style: string; label: string }> = {
  RENTREE: { style: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", label: "Rentrée" },
  VACANCES: { style: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: "Vacances" },
  EXAMEN: { style: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", label: "Examens" },
  FERIE: { style: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: "Férié" },
  SOUTENANCE: { style: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", label: "Soutenance" },
  EVENEMENT: { style: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", label: "Événement" },
  AUTRE: { style: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", label: "Autre" },
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "VACANCES": return <Sun className="w-4 h-4" />;
    case "EXAMEN": return <BookOpen className="w-4 h-4" />;
    case "FERIE": return <Snowflake className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getTypeBadge = (type: string) => {
  const info = EVENT_TYPE_MAP[type] || EVENT_TYPE_MAP.AUTRE;
  return <Badge className={`${info.style} text-xs`}>{info.label}</Badge>;
};

export default function EtudiantCalendrier() {
  const { user } = useAuth();
  const [semestres, setSemestres] = useState<SemestreDto[]>([]);
  const [semaines, setSemaines] = useState<SemaineAcademiqueDto[]>([]);
  const [events, setEvents] = useState<EvenementCalendrierDto[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch semestres
  useEffect(() => {
    semestreService.getAll().then((data) => {
      setSemestres(data);
      if (data.length > 0) setSelectedSemestre(String(data[0].id));
    }).catch(() => setError("Impossible de charger les semestres"));
  }, []);

  // Fetch semaines
  useEffect(() => {
    if (!selectedSemestre) return;
    semaineService.getAll(Number(selectedSemestre)).then((data) => {
      setSemaines(data);
      if (data.length > 0) setSelectedWeek(1);
    }).catch(() => {});
  }, [selectedSemestre]);

  // Fetch events
  useEffect(() => {
    if (!selectedSemestre) return;
    setLoading(true);
    setError(null);
    calendrierService.getAll({ semestreId: Number(selectedSemestre) })
      .then((data) => setEvents(data))
      .catch((err) => {
        console.error("Calendar events error:", err);
        setError("Impossible de charger le calendrier");
      })
      .finally(() => setLoading(false));
  }, [selectedSemestre]);

  const currentSemaine = semaines[selectedWeek - 1];

  const goToPreviousWeek = () => { if (selectedWeek > 1) setSelectedWeek(selectedWeek - 1); };
  const goToNextWeek = () => { if (selectedWeek < semaines.length) setSelectedWeek(selectedWeek + 1); };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier académique</h1>
          <p className="text-muted-foreground mt-1">
            {user?.prenom} {user?.nom} • Année universitaire
          </p>
        </div>
        <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
          <SelectTrigger className="w-40">
            <GraduationCap className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            {semestres.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.libelle}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Week navigation */}
      {semaines.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} disabled={selectedWeek <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Semaine académique</p>
                <p className="text-2xl font-bold">{currentSemaine?.numeroSemaine || selectedWeek}</p>
                {currentSemaine && (
                  <p className="text-xs text-muted-foreground">
                    Du {currentSemaine.dateDebut} au {currentSemaine.dateFin}
                  </p>
                )}
              </div>
              <Button variant="outline" size="icon" onClick={goToNextWeek} disabled={selectedWeek >= semaines.length}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semester info */}
      {semestres.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semestres.map((semester) => (
            <Card key={semester.id} className={String(semester.id) === selectedSemestre ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge className="bg-indigo-100 text-indigo-800">{semester.libelle}</Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Du</span>
                  <span className="font-medium">{semester.dateDebut}</span>
                  <span className="text-muted-foreground">au</span>
                  <span className="font-medium">{semester.dateFin}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Chargement...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Events */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Dates importantes ({events.length})
            </CardTitle>
            <CardDescription>
              Événements et jalons de l'année universitaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucun événement pour ce semestre
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.titre}</p>
                        {getTypeBadge(event.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.dateDebut}{event.dateFin ? ` — ${event.dateFin}` : ""}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                    <Link to="/etudiant/emploi-du-temps">
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Légende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(EVENT_TYPE_MAP).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge className={val.style}>{val.label}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mon semestre actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Semestre</span>
                <span className="font-medium">{semestres.find((s) => String(s.id) === selectedSemestre)?.libelle || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Semaine actuelle</span>
                <span className="font-medium">{selectedWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Semaines restantes</span>
                <span className="font-medium">{Math.max(0, semaines.length - selectedWeek)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Événements</span>
                <span className="font-medium">{events.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
