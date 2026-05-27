import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, BookOpen, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { edtService, semestreService, semaineService, creneauService } from "@/services";
import { DAY_LABELS, type DayName, type SeanceDto, type SemestreDto, type SemaineAcademiqueDto, type CreneauDto } from "@/types";

type BackendDay = "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI";

const DAYS_ORDER: BackendDay[] = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const DAY_MAP: Record<BackendDay, DayName> = {
  LUNDI: "lundi", MARDI: "mardi", MERCREDI: "mercredi",
  JEUDI: "jeudi", VENDREDI: "vendredi", SAMEDI: "samedi",
};

const getStatusBadge = (statut: string) => {
  const styles: Record<string, string> = {
    PLANIFIEE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    REALISEE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    ANNULEE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  const labels: Record<string, string> = {
    PLANIFIEE: "Planifiée", REALISEE: "Réalisée", ANNULEE: "Annulée",
  };
  return <Badge className={`${styles[statut] || ""} text-xs`}>{labels[statut] || statut}</Badge>;
};

const getTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    CM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    TD: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    TP: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  };
  return <Badge className={`${styles[type] || styles.CM} text-xs font-semibold`}>{type}</Badge>;
};

function getTimeSlotsFromCreneaux(creneaux: CreneauDto[]): { label: string; start: string; end: string }[] {
  const set = new Map<string, { start: string; end: string }>();
  creneaux.forEach((c) => {
    const key = `${c.heureDebut}-${c.heureFin}`;
    if (!set.has(key)) set.set(key, { start: c.heureDebut, end: c.heureFin });
  });
  return Array.from(set.entries())
    .sort(([, a], [, b]) => a.start.localeCompare(b.start))
    .map(([, v]) => ({ label: `${v.start}-${v.end}`, start: v.start, end: v.end }));
}

export default function ProfesseurEmploiDuTemps() {
  const { user } = useAuth();
  const [semestres, setSemestres] = useState<SemestreDto[]>([]);
  const [semaines, setSemaines] = useState<SemaineAcademiqueDto[]>([]);
  const [seances, setSeances] = useState<SeanceDto[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [selectedSemaine, setSelectedSemaine] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch semestres
  useEffect(() => {
    semestreService.getAll().then((data) => {
      setSemestres(data);
      if (data.length > 0) setSelectedSemestre(String(data[0].id));
    }).catch(() => setError("Impossible de charger les semestres"));
  }, []);

  // Fetch semaines + creneaux when semestre changes
  useEffect(() => {
    if (!selectedSemestre) return;
    Promise.all([
      semaineService.getAll(Number(selectedSemestre)),
      creneauService.getAll(Number(selectedSemestre)),
    ]).then(([semainesData, creneauxData]) => {
      setSemaines(semainesData);
      setCreneaux(creneauxData);
      if (semainesData.length > 0) setSelectedSemaine(String(semainesData[0].id));
    }).catch(() => setError("Impossible de charger les semaines"));
  }, [selectedSemestre]);

  // Fetch professor seances
  useEffect(() => {
    if (!selectedSemestre || !selectedSemaine) return;
    setLoading(true);
    setError(null);
    edtService.getMyProfessorEdt(Number(selectedSemestre), Number(selectedSemaine))
      .then((data) => setSeances(data))
      .catch((err) => {
        console.error("Prof EDT error:", err);
        setError("Impossible de charger vos séances");
      })
      .finally(() => setLoading(false));
  }, [selectedSemestre, selectedSemaine]);

  const timeSlots = useMemo(() => getTimeSlotsFromCreneaux(creneaux), [creneaux]);

  const getSlotSeances = (day: BackendDay, start: string, end: string) =>
    seances.filter((s) => s.jour === day && s.heureDebut === start && s.heureFin === end);

  const currentSemaine = semaines.find((s) => String(s.id) === selectedSemaine);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon emploi du temps</h1>
          <p className="text-muted-foreground mt-1">
            {user?.prenom} {user?.nom}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Semestre" /></SelectTrigger>
            <SelectContent>
              {semestres.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.libelle}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemaine} onValueChange={setSelectedSemaine}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Semaine" /></SelectTrigger>
            <SelectContent>
              {semaines.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  Semaine {s.numeroSemaine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{seances.length}</p>
              <p className="text-xs text-muted-foreground">Séances cette semaine</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{seances.filter((s) => s.statut === "REALISEE").length}</p>
              <p className="text-xs text-muted-foreground">Réalisées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{seances.filter((s) => s.statut === "PLANIFIEE").length}</p>
              <p className="text-xs text-muted-foreground">À venir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{seances.filter((s) => s.statut === "ANNULEE").length}</p>
              <p className="text-xs text-muted-foreground">Annulées</p>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* EDT Grid */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {currentSemaine ? `Semaine ${currentSemaine.numeroSemaine}` : "—"}
              {" • "}
              {semestres.find((s) => String(s.id) === selectedSemestre)?.libelle || "—"}
            </CardTitle>
            <CardDescription>
              {currentSemaine ? `Du ${currentSemaine.dateDebut} au ${currentSemaine.dateFin}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header jours */}
                <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Créneau</div>
                  {DAYS_ORDER.map((day) => (
                    <div key={day} className="text-center font-semibold text-sm p-2 bg-muted rounded">
                      {DAY_LABELS[DAY_MAP[day]]}
                    </div>
                  ))}
                </div>

                {timeSlots.map((slot) => (
                  <div key={slot.label} className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 mb-2">
                    <div className="text-xs text-muted-foreground flex flex-col justify-center">
                      <span className="font-medium">{slot.label}</span>
                    </div>
                    {DAYS_ORDER.map((day) => {
                      const daySeances = getSlotSeances(day, slot.start, slot.end);
                      return (
                        <div key={`${day}-${slot.label}`} className="h-[100px] min-w-0 overflow-hidden">
                          {daySeances.length > 0 ? (
                            <div className="space-y-1 h-full">
                              {daySeances.map((seance) => (
                                <Link
                                  key={seance.id}
                                  to={`/professeur/seances/${seance.id}`}
                                  className={`h-full block p-2 rounded-md text-xs transition-all hover:shadow-md ${seance.statut === "REALISEE"
                                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                      : seance.statut === "ANNULEE"
                                        ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 opacity-60"
                                        : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    {getTypeBadge(seance.type)}
                                    {getStatusBadge(seance.statut)}
                                  </div>
                                  <p className="font-semibold truncate">{seance.matiereCode}</p>
                                  <p className="text-muted-foreground truncate text-[10px]">{seance.matiereIntitule}</p>
                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    {seance.salleNoms?.join(", ")}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full bg-slate-100 dark:bg-slate-800/50 rounded-md" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {timeSlots.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune séance prévue cette semaine.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions rapides */}
      <div className="flex justify-end">
        <Link to="/professeur/seances">
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            Voir toutes mes séances
          </Button>
        </Link>
      </div>
    </div>
  );
}
