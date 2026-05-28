import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Eye, CheckCircle2, XCircle, Calendar, MapPin, BookOpen, Clock, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { seanceService, semestreService, semaineService } from "@/services";
import type { SeanceDto, SemestreDto, SemaineAcademiqueDto } from "@/types";

const DAY_LABELS_UPPER: Record<string, string> = {
  LUNDI: "Lundi", MARDI: "Mardi", MERCREDI: "Mercredi",
  JEUDI: "Jeudi", VENDREDI: "Vendredi", SAMEDI: "Samedi",
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

export default function ProfesseurSeances() {
  const { user } = useAuth();
  const [semestres, setSemestres] = useState<SemestreDto[]>([]);
  const [semaines, setSemaines] = useState<SemaineAcademiqueDto[]>([]);
  const [seances, setSeances] = useState<SeanceDto[]>([]);
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [selectedSemaine, setSelectedSemaine] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [matiereFilter, setMatiereFilter] = useState("all");
  const [selectedSeance, setSelectedSeance] = useState<SeanceDto | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [comment, setComment] = useState("");

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
      if (data.length > 0) setSelectedSemaine(String(data[0].id));
    }).catch(() => setError("Impossible de charger les semaines"));
  }, [selectedSemestre]);

  // Fetch my seances
  useEffect(() => {
    if (!selectedSemestre) return;
    setLoading(true);
    setError(null);
    const semaineId = selectedSemaine ? Number(selectedSemaine) : undefined;
    seanceService.getMySeances(Number(selectedSemestre), semaineId)
      .then((data) => setSeances(data))
      .catch((err) => {
        console.error("Seances fetch error:", err);
        setError("Impossible de charger vos séances");
      })
      .finally(() => setLoading(false));
  }, [selectedSemestre, selectedSemaine]);

  // Unique matieres
  const matieres = useMemo(() => {
    const codes = new Set(seances.map((s) => s.matiereCode));
    return Array.from(codes);
  }, [seances]);

  // Filter
  const filteredSeances = useMemo(() => {
    return seances.filter((seance) => {
      const matchesSearch =
        searchQuery === "" ||
        seance.matiereCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seance.matiereIntitule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seance.salleNoms?.join(", ").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || seance.statut === statusFilter;
      const matchesType = typeFilter === "all" || seance.type === typeFilter;
      const matchesMatiere = matiereFilter === "all" || seance.matiereCode === matiereFilter;

      return matchesSearch && matchesStatus && matchesType && matchesMatiere;
    });
  }, [seances, searchQuery, statusFilter, typeFilter, matiereFilter]);

  const handleValidate = async () => {
    if (!selectedSeance) return;
    try {
      await seanceService.update(selectedSeance.id, { statut: "REALISEE" });
      setSeances((prev) => prev.map((s) => s.id === selectedSeance.id ? { ...s, statut: "REALISEE" } : s));
    } catch (err) {
      console.error("Validation error:", err);
    }
    setValidationDialogOpen(false);
    setSelectedSeance(null);
    setComment("");
  };

  const handleCancel = async () => {
    if (!selectedSeance) return;
    try {
      await seanceService.update(selectedSeance.id, { statut: "ANNULEE" });
      setSeances((prev) => prev.map((s) => s.id === selectedSeance.id ? { ...s, statut: "ANNULEE" } : s));
    } catch (err) {
      console.error("Cancel error:", err);
    }
    setValidationDialogOpen(false);
    setSelectedSeance(null);
  };

  const openValidation = (seance: SeanceDto) => {
    setSelectedSeance(seance);
    setValidationDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes séances</h1>
          <p className="text-muted-foreground mt-1">
            {user?.prenom} {user?.nom} • {seances.length} séances au total
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
              <SelectItem value="all">Toutes les semaines</SelectItem>
              {semaines.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>Semaine {s.numeroSemaine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link to="/professeur/emploi-du-temps">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Voir l'EDT
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par matière, salle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PLANIFIEE">Planifiées</SelectItem>
                  <SelectItem value="REALISEE">Réalisées</SelectItem>
                  <SelectItem value="ANNULEE">Annulées</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="CM">CM</SelectItem>
                  <SelectItem value="TD">TD</SelectItem>
                  <SelectItem value="TP">TP</SelectItem>
                </SelectContent>
              </Select>

              <Select value={matiereFilter} onValueChange={setMatiereFilter}>
                <SelectTrigger className="w-40">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {matieres.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Liste des séances ({filteredSeances.length})
            </CardTitle>
            <CardDescription>
              Cliquez sur une séance pour la valider ou la marquer comme annulée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jour</TableHead>
                  <TableHead>Créneau</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Salle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSeances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune séance ne correspond aux critères
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSeances.map((seance) => (
                    <TableRow key={seance.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {DAY_LABELS_UPPER[seance.jour] || seance.jour}
                      </TableCell>
                      <TableCell>{seance.heureDebut}-{seance.heureFin}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{seance.matiereCode}</p>
                          <p className="text-xs text-muted-foreground">{seance.matiereIntitule}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(seance.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {seance.salleNoms?.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(seance.statut)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/professeur/seances/${seance.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {seance.statut === "PLANIFIEE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openValidation(seance)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Valider
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de validation */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Valider la séance
            </DialogTitle>
            <DialogDescription>
              Confirmez que cette séance a été réalisée
            </DialogDescription>
          </DialogHeader>

          {selectedSeance && (
            <div className="space-y-4 py-4 overflow-hidden">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-[80px_1fr] gap-2 items-start">
                  <span className="text-sm text-muted-foreground">Matière</span>
                  <div className="font-medium text-right">
                    <div className="truncate">{selectedSeance.matiereCode}</div>
                    <div className="text-xs text-muted-foreground truncate">{selectedSeance.matiereIntitule}</div>
                  </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-medium text-right">{selectedSeance.type}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Jour</span>
                  <span className="font-medium text-right">{DAY_LABELS_UPPER[selectedSeance.jour]}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Créneau</span>
                  <span className="font-medium text-right">{selectedSeance.heureDebut}-{selectedSeance.heureFin}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Salle</span>
                  <span className="font-medium text-right">{selectedSeance.salleNoms?.join(", ")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Commentaire (optionnel)</label>
                <Input
                  placeholder="Ajoutez un commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setValidationDialogOpen(false)}>
              Annuler
            </Button>
            {selectedSeance?.statut === "PLANIFIEE" && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancel}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Marquer comme annulée
              </Button>
            )}
            <Button onClick={handleValidate} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmer la réalisation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
