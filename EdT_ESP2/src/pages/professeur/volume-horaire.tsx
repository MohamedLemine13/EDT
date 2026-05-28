import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Clock, CheckCircle2, XCircle, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { seanceService, semestreService } from "@/services";
import type { SeanceDto, SemestreDto } from "@/types";

// Compute volume horaire from real seances
interface VolumeHoraire {
  matiere: string;
  matiereIntitule: string;
  type: string;
  prevu: number;
  realise: number;
  annule: number;
  restant: number;
}

function computeVolumeHoraire(seances: SeanceDto[]): VolumeHoraire[] {
  const map = new Map<string, VolumeHoraire>();

  seances.forEach((s) => {
    const key = `${s.matiereCode}-${s.type}`;
    const existing = map.get(key);
    // Assume 1h30 per session
    const duration = 1.5;

    if (existing) {
      existing.prevu += duration;
      if (s.statut === "REALISEE") existing.realise += duration;
      if (s.statut === "ANNULEE") existing.annule += duration;
      existing.restant = existing.prevu - existing.realise - existing.annule;
    } else {
      const realise = s.statut === "REALISEE" ? duration : 0;
      const annule = s.statut === "ANNULEE" ? duration : 0;
      map.set(key, {
        matiere: s.matiereCode,
        matiereIntitule: s.matiereIntitule || s.matiereCode,
        type: s.type,
        prevu: duration,
        realise,
        annule,
        restant: duration - realise - annule,
      });
    }
  });

  return Array.from(map.values());
}

function computeTotals(volumes: VolumeHoraire[]) {
  return volumes.reduce(
    (acc, v) => ({
      prevu: acc.prevu + v.prevu,
      realise: acc.realise + v.realise,
      annule: acc.annule + v.annule,
      restant: acc.restant + v.restant,
    }),
    { prevu: 0, realise: 0, annule: 0, restant: 0 }
  );
}

const getTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    CM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    TD: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    TP: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  };
  return <Badge className={`${styles[type] || styles.CM} text-xs font-semibold`}>{type}</Badge>;
};

export default function ProfesseurVolumeHoraire() {
  const { user } = useAuth();
  const [semestres, setSemestres] = useState<SemestreDto[]>([]);
  const [seances, setSeances] = useState<SeanceDto[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch semestres
  useEffect(() => {
    semestreService.getAll().then((data) => {
      setSemestres(data);
      if (data.length > 0) setSelectedSemestre(String(data[0].id));
    }).catch(() => setError("Impossible de charger les semestres"));
  }, []);

  // Fetch all seances for the selected semester (no week filter → all weeks)
  useEffect(() => {
    if (!selectedSemestre) return;
    setLoading(true);
    setError(null);
    seanceService.getMySeances(Number(selectedSemestre))
      .then((data) => setSeances(data))
      .catch((err) => {
        console.error("Volume fetch error:", err);
        setError("Impossible de charger le volume horaire");
      })
      .finally(() => setLoading(false));
  }, [selectedSemestre]);

  const volumes = useMemo(() => computeVolumeHoraire(seances), [seances]);
  const totals = useMemo(() => computeTotals(volumes), [volumes]);
  const progressPct = totals.prevu > 0 ? Math.round((totals.realise / totals.prevu) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Volume horaire</h1>
          <p className="text-muted-foreground mt-1">
            {user?.prenom} {user?.nom} • Suivi de vos heures d'enseignement
          </p>
        </div>
        <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Semestre" /></SelectTrigger>
          <SelectContent>
            {semestres.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.libelle}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.prevu}h</p>
                  <p className="text-xs text-muted-foreground">Total prévu</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.realise}h</p>
                  <p className="text-xs text-muted-foreground">Réalisées</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totals.annule}h</p>
                  <p className="text-xs text-muted-foreground">Annulées</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progressPct}%</p>
                  <p className="text-xs text-muted-foreground">Progression</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress bar */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression globale</span>
                <span className="font-medium">{totals.realise}h / {totals.prevu}h</span>
              </div>
              <Progress value={progressPct} className="h-3" />
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Détail par matière
              </CardTitle>
              <CardDescription>
                Répartition du volume horaire par matière et type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matière</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Prévu (h)</TableHead>
                    <TableHead className="text-right">Réalisé (h)</TableHead>
                    <TableHead className="text-right">Annulé (h)</TableHead>
                    <TableHead className="text-right">Restant (h)</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volumes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucune donnée disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {volumes.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{v.matiere}</p>
                              <p className="text-xs text-muted-foreground">{v.matiereIntitule}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(v.type)}</TableCell>
                          <TableCell className="text-right">{v.prevu}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">{v.realise}</TableCell>
                          <TableCell className="text-right text-red-600">{v.annule}</TableCell>
                          <TableCell className="text-right">{v.restant}</TableCell>
                          <TableCell className="text-right font-medium">
                            {v.prevu > 0 ? Math.round((v.realise / v.prevu) * 100) : 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals row */}
                      <TableRow className="border-t-2 font-bold">
                        <TableCell colSpan={2}>TOTAL</TableCell>
                        <TableCell className="text-right">{totals.prevu}</TableCell>
                        <TableCell className="text-right text-green-600">{totals.realise}</TableCell>
                        <TableCell className="text-right text-red-600">{totals.annule}</TableCell>
                        <TableCell className="text-right">{totals.restant}</TableCell>
                        <TableCell className="text-right">{progressPct}%</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
