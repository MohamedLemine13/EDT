import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  User,
  Plus,
  Download,
  Loader2,
  AlertCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  CheckCheck,
  Clock,
} from "lucide-react";
import { DAY_LABELS, type DayName } from "@/types";
import type {
  SeanceDto,
  SemestreDto,
  SemaineAcademiqueDto,
  CreneauDto,
  EdtSemaineDto,
  CreateSeanceRequestDto,
  UpdateSeanceRequestDto,
  DepartementDto,
  AffectationEnseignementDto,
  MatiereDto,
  ProfesseurDto,
  SalleDto,
} from "@/types";
import {
  edtService,
  semestreService,
  semaineService,
  creneauService,
  seanceService,
  departementService,
  affectationService,
  matiereService,
  professeurService,
  salleService,
} from "@/services";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/hooks/useAppState";
import { useAuth } from "@/hooks/useAuth";

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
    PLANIFIEE: "Planifié", REALISEE: "Terminé", ANNULEE: "Annulé",
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

function fmtTime(t: string) { return t.length > 5 ? t.substring(0, 5) : t; }

function getTimeSlotsFromCreneaux(creneaux: CreneauDto[]): { label: string; start: string; end: string; type: string }[] {
  const set = new Map<string, { start: string; end: string; type: string }>();
  creneaux.forEach((c) => {
    const key = `${c.heureDebut}-${c.heureFin}`;
    if (!set.has(key)) set.set(key, { start: c.heureDebut, end: c.heureFin, type: c.typeCreneau || "AUTRE" });
  });
  return Array.from(set.entries())
    .sort(([, a], [, b]) => a.start.localeCompare(b.start))
    .map(([, v]) => ({ label: `${fmtTime(v.start)}-${fmtTime(v.end)}`, start: v.start, end: v.end, type: v.type }));
}

export default function EmploiPage() {
  const { department } = useAppState();
  const { user } = useAuth();

  // API data
  const [semestres, setSemestres] = useState<SemestreDto[]>([]);
  const [semaines, setSemaines] = useState<SemaineAcademiqueDto[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([]);
  const [edtData, setEdtData] = useState<EdtSemaineDto | null>(null);
  const [departments, setDepartments] = useState<DepartementDto[]>([]);
  const [affectations, setAffectations] = useState<AffectationEnseignementDto[]>([]);
  const [matieres, setMatieres] = useState<MatiereDto[]>([]);
  const [professeurs, setProfesseurs] = useState<ProfesseurDto[]>([]);
  const [sallesAll, setSallesAll] = useState<SalleDto[]>([]);

  // Selection state
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [selectedSemaine, setSelectedSemaine] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeance, setSelectedSeance] = useState<SeanceDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreneauxOpen, setIsCreneauxOpen] = useState(false);
  const [editingSlots, setEditingSlots] = useState<{ id: string, oldStart: string, oldEnd: string, newStart: string, newEnd: string, newType: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Create form state — individual editable fields
  const [selectedAffectation, setSelectedAffectation] = useState("");
  const [pendingSlot, setPendingSlot] = useState<{ day: BackendDay; start: string; end: string; creneauId: number; type: string } | null>(null);
  const [formMatiere, setFormMatiere] = useState("");
  const [formType, setFormType] = useState<string>("CM");
  const [formProf, setFormProf] = useState<string[]>([]);
  const [formSalle, setFormSalle] = useState<string[]>([]);
  const [formTag, setFormTag] = useState("");
  const [formIsCommun, setFormIsCommun] = useState(false);

  // Load initial data
  useEffect(() => {
    Promise.all([
      semestreService.getAll(),
      departementService.getAll(),
      matiereService.getAll(),
      professeurService.getAll(),
      salleService.getAll(),
    ]).then(([sem, dept, mat, prof, sal]) => {
      setSemestres(sem);
      setDepartments(dept);
      setMatieres(mat);
      setProfesseurs(prof);
      setSallesAll(sal);
      if (sem.length > 0) setSelectedSemestre(String(sem[0].id));
      if (dept.length > 0) {
        const found = dept.find((d: DepartementDto) => d.code === department);
        setSelectedDept(String(found ? found.id : dept[0].id));
      }
    }).catch(() => setError("Impossible de charger les données initiales"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load semaines + creneaux when semestre changes
  useEffect(() => {
    if (!selectedSemestre) return;
    Promise.all([
      semaineService.getAll(Number(selectedSemestre)),
      creneauService.getAll(Number(selectedSemestre)),
    ]).then(([sem, cren]) => {
      const sortedSem = sem.sort((a, b) => a.numeroSemaine - b.numeroSemaine);
      setSemaines(sortedSem);
      setCreneaux(cren);
      if (sortedSem.length > 0) setSelectedSemaine(String(sortedSem[0].numeroSemaine));
    }).catch(() => setError("Impossible de charger les semaines"));
  }, [selectedSemestre]);

  // Load affectations when semestre + dept change
  useEffect(() => {
    if (!selectedSemestre || !selectedDept) return;
    affectationService.getAll(Number(selectedSemestre), Number(selectedDept))
      .then(setAffectations)
      .catch(() => setAffectations([]));
  }, [selectedSemestre, selectedDept]);

  // Load EDT when dept + semestre + semaine changes
  const fetchEdt = useCallback(() => {
    if (!selectedDept || !selectedSemestre || !selectedSemaine) return;
    setLoading(true);
    setError(null);
    edtService.getByDepartement(Number(selectedDept), Number(selectedSemestre), Number(selectedSemaine))
      .then((data) => setEdtData(data))
      .catch((err) => {
        console.error("EDT fetch error:", err);
        setError("Impossible de charger l'emploi du temps");
      })
      .finally(() => setLoading(false));
  }, [selectedDept, selectedSemestre, selectedSemaine]);

  useEffect(() => { fetchEdt(); }, [fetchEdt]);

  // Computed data
  const allSeances = useMemo(() => {
    if (!edtData?.jours) return [];
    return edtData.jours.flatMap((j) => j.seances);
  }, [edtData]);

  const timeSlots = useMemo(() => getTimeSlotsFromCreneaux(creneaux), [creneaux]);

  const getSeances = (day: BackendDay, slotStart: string, slotEnd: string): SeanceDto[] => {
    return allSeances.filter((s) => s.jour === day && s.heureDebut === slotStart && s.heureFin === slotEnd);
  };

  const findCreneau = (day: BackendDay, start: string, end: string): CreneauDto | undefined => {
    return creneaux.find((c) => c.jour === day && c.heureDebut === start && c.heureFin === end);
  };

  const currentSemaine = semaines.find((s) => String(s.numeroSemaine) === selectedSemaine);

  // Handle empty cell click → open create dialog with all fields
  const handleEmptyCellClick = (day: BackendDay, start: string, end: string) => {
    const creneau = findCreneau(day, start, end);
    if (!creneau) return;

    const type = creneau.typeCreneau || "AUTRE";
    const role = user?.role || "USER";

    // RBAC checks
    if (role === "CHEF_DEP" && type !== "DEP") return;
    if (role === "CHEF_HE" && type !== "HE") return;
    if (role === "CHEF_ST" && type !== "ST") return;

    setPendingSlot({ day, start, end, creneauId: creneau.id, type });
    setSelectedAffectation("");
    setFormMatiere("");
    setFormType("CM");
    setFormProf("");
    setFormSalle("");
    setFormTag("");
    setFormIsCommun(type !== "DEP");
    setIsCreateOpen(true);
  };

  // Creneaux Management
  const handleOpenCreneaux = () => {
    const unique = getTimeSlotsFromCreneaux(creneaux);
    setEditingSlots(unique.map(u => ({ id: u.label, oldStart: u.start, oldEnd: u.end, newStart: u.start, newEnd: u.end, newType: u.type })));
    setIsCreneauxOpen(true);
  };

  const handleSaveCreneaux = async () => {
    setSaving(true);
    try {
      const promises = [];
      for (const slot of editingSlots) {
        if (slot.oldStart !== slot.newStart || slot.oldEnd !== slot.newEnd || slot.newType !== "AUTRE") {
          const matching = creneaux.filter(c => c.heureDebut === slot.oldStart && c.heureFin === slot.oldEnd);
          for (const c of matching) {
            // Check if anything actually changed for this slot
            if (slot.oldStart === slot.newStart && slot.oldEnd === slot.newEnd && slot.newType === c.typeCreneau) continue;
            promises.push(creneauService.update(c.id, {
              jour: c.jour,
              heureDebut: slot.newStart + (slot.newStart.length === 5 ? ":00" : ""),
              heureFin: slot.newEnd + (slot.newEnd.length === 5 ? ":00" : ""),
              typeCreneau: slot.newType as "DEP" | "HE" | "ST" | "AUTRE",
              semestreId: c.semestreId
            }));
          }
        }
      }
      await Promise.all(promises);
      setIsCreneauxOpen(false);
      
      const newCren = await creneauService.getAll(Number(selectedSemestre));
      setCreneaux(newCren);
      fetchEdt();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification des horaires");
    } finally {
      setSaving(false);
    }
  };

  const handleInlineTypeChange = async (creneauId: number, newType: string, c: CreneauDto) => {
    if (c.typeCreneau === newType) return;
    setSaving(true);
    try {
      await creneauService.update(creneauId, {
        jour: c.jour,
        heureDebut: c.heureDebut,
        heureFin: c.heureFin,
        typeCreneau: newType as "DEP" | "HE" | "ST" | "AUTRE",
        semestreId: c.semestreId
      });
      const newCren = await creneauService.getAll(Number(selectedSemestre));
      setCreneaux(newCren);
      fetchEdt();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification du type de créneau");
    } finally {
      setSaving(false);
    }
  };

  // Quick-fill from affectation selection
  const handleAffectationQuickFill = (affId: string) => {
    setSelectedAffectation(affId);
    const aff = affectations.find((a) => String(a.id) === affId);
    if (aff) {
      setFormMatiere(aff.matiereCode);
      setFormType(aff.type);
      setFormProf(aff.professeurIds?.map(String) || []);
      setFormSalle(aff.salleIds?.map(String) || []);
      setFormIsCommun(aff.departementIds.length !== 1);
    }
  };

  // Handle create seance from individual fields
  const handleCreateSeance = async () => {
    if (!formMatiere || !pendingSlot || !currentSemaine) return;

    setSaving(true);
    try {
      const isCommunFixed = pendingSlot.type === "HE" || pendingSlot.type === "ST" ? true : pendingSlot.type === "DEP" ? false : formIsCommun;
      const dto: CreateSeanceRequestDto = {
        type: formType as any,
        statut: "PLANIFIEE",
        creneauId: pendingSlot.creneauId,
        matiereCode: formMatiere,
        salleIds: formSalle.length > 0 ? formSalle.map(Number) : undefined,
        semaineId: currentSemaine.id,
        professeurIds: formProf.length > 0 ? formProf.map(Number) : undefined,
        isCommun: isCommunFixed,
        tag: formTag || undefined,
        departementIds: isCommunFixed ? [] : [Number(selectedDept)],
      };
      await seanceService.create(dto);
      setIsCreateOpen(false);
      fetchEdt(); // Refresh grid
    } catch (err: unknown) {
      console.error("Create seance error:", err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || "Erreur lors de la création de la séance");
    } finally {
      setSaving(false);
    }
  };

  // Handle change seance status
  const handleChangeStatus = async (seanceId: number, newStatut: "PLANIFIEE" | "REALISEE" | "ANNULEE") => {
    setSaving(true);
    try {
      const dto: UpdateSeanceRequestDto = { statut: newStatut };
      await seanceService.update(seanceId, dto);
      setIsDetailOpen(false);
      setSelectedSeance(null);
      fetchEdt();
    } catch (err: unknown) {
      console.error("Status change error:", err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || "Erreur lors du changement de statut");
    } finally {
      setSaving(false);
    }
  };

  // Handle mark all seances in current week as REALISEE
  const handleMarkWeekDone = async () => {
    if (!allSeances.length) return;
    const pending = allSeances.filter((s) => s.statut === "PLANIFIEE");
    if (pending.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        pending.map((s) => seanceService.update(s.id, { statut: "REALISEE" } as UpdateSeanceRequestDto))
      );
      fetchEdt();
    } catch (err: unknown) {
      console.error("Mark week done error:", err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || "Erreur lors de la validation de la semaine");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete seance
  const handleDeleteSeance = async () => {
    if (!selectedSeance) return;
    setSaving(true);
    try {
      await seanceService.delete(selectedSeance.id);
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedSeance(null);
      fetchEdt();
    } catch (err) {
      console.error("Delete seance error:", err);
      setError("Erreur lors de la suppression");
    } finally {
      setSaving(false);
    }
  };

  // Excel export
  const handleDownloadExcel = () => {
    const headers = ["Jour", "Créneau", "Matière", "Type", "Salle", "Enseignant"];
    const rows = allSeances.map((s) => [
      s.jour,
      `${s.heureDebut}-${s.heureFin}`,
      `${s.matiereCode} - ${s.matiereIntitule}`,
      s.type,
      s.salleNoms?.join(", ") || "",
      s.professeurNoms?.join(", ") || "",
    ]);

    const escape = (str: string) => str.replace(/[<>&'"]/g, (c) =>
      c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;"
    );

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="EDT">
<Table>
  <Row>${headers.map((h) => `<Cell><Data ss:Type="String">${escape(h)}</Data></Cell>`).join("")}</Row>
${rows.map((row) => `  <Row>${row.map((c) => `<Cell><Data ss:Type="String">${escape(String(c))}</Data></Cell>`).join("")}</Row>`).join("\n")}
</Table>
</Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `EDT_${edtData?.departementCode || "dept"}_S${selectedSemaine}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emploi du temps</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>{d.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semestre" />
            </SelectTrigger>
            <SelectContent>
              {semestres.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.libelle}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSemaine} onValueChange={setSelectedSemaine}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semaine" />
            </SelectTrigger>
            <SelectContent>
              {semaines.map((s) => (
                <SelectItem key={s.id} value={String(s.numeroSemaine)}>
                  Semaine {s.numeroSemaine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleDownloadExcel} title="Exporter Excel" disabled={allSeances.length === 0}>
            <Download className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleOpenCreneaux} title="Gérer les horaires">
            <Clock className="h-4 w-4 mr-1" /> Horaires
          </Button>

          {allSeances.some((s) => s.statut === "PLANIFIEE") && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkWeekDone}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
              title="Marquer toutes les séances planifiées de cette semaine comme réalisées"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCheck className="w-4 h-4 mr-1" />}
              Valider semaine
            </Button>
          )}
        </div>
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
          <Button variant="outline" size="sm" onClick={() => { setError(null); fetchEdt(); }}>Réessayer</Button>
        </div>
      )}

      {/* EDT Grid */}
      {!loading && !error && edtData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Semaine {edtData.numeroSemaine} • {edtData.semestreLibelle} • {edtData.departementCode}
            </CardTitle>
            <CardDescription>
              Du {edtData.dateDebut} au {edtData.dateFin} • Cliquez sur une cellule vide pour ajouter, sur une séance pour voir les détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
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
                      const seances = getSeances(day, slot.start, slot.end);
                      const creneau = findCreneau(day, slot.start, slot.end);
                      const type = creneau?.typeCreneau || "AUTRE";
                      const role = user?.role || "USER";
                      let hasAccess = true;
                      if (role === "CHEF_DEP" && type !== "DEP") hasAccess = false;
                      if (role === "CHEF_HE" && type !== "HE") hasAccess = false;
                      if (role === "CHEF_ST" && type !== "ST") hasAccess = false;

                      let cellClass = "h-full rounded-md transition-colors flex items-center justify-center border";
                      
                      if (!hasAccess) {
                        cellClass += " bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50";
                      } else {
                        cellClass += " cursor-pointer";
                        if (type === "DEP") {
                          cellClass += " bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50";
                        } else if (type === "HE" || type === "ST") {
                          cellClass += " bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800/50";
                        } else {
                          cellClass += " bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800/50";
                        }
                      }

                      return (
                        <div key={`${day}-${slot.label}`} className="h-[100px] min-w-0 overflow-hidden">
                          {seances.length > 0 ? (
                            <div className="space-y-1 h-full">
                              {seances.map((seance) => (
                                <div
                                  key={seance.id}
                                  onClick={() => { setSelectedSeance(seance); setIsDetailOpen(true); }}
                                  className={`h-full block p-2 rounded-md text-xs cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${
                                    type === "DEP"
                                      ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700"
                                      : type === "HE" || type === "ST"
                                      ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                                      : "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700"
                                  } ${seance.statut === "ANNULEE" ? "opacity-60" : ""}`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    {getTypeBadge(seance.type)}
                                    {getStatusBadge(seance.statut)}
                                  </div>
                                  <p className="font-semibold truncate">{seance.matiereCode}</p>
                                  <div className="flex items-center gap-1 font-medium text-[11px] truncate mt-0.5" title={seance.professeurNoms?.join(", ")}>
                                    <User className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{seance.professeurNoms?.join(", ")}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] opacity-90 truncate" title={seance.salleNoms?.join(", ")}>
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{seance.salleNoms?.join(", ")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              onClick={() => { if (hasAccess) handleEmptyCellClick(day, slot.start, slot.end); }}
                              className={`${cellClass} relative group`}
                              title={hasAccess ? `Ajouter une séance (${type})` : "Non autorisé"}
                            >
                              <Plus className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/70" />
                              
                              {role === "ADMIN" && creneau && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                  <Select 
                                    value={type} 
                                    onValueChange={(val) => handleInlineTypeChange(creneau.id, val, creneau)}
                                  >
                                    <SelectTrigger className="h-5 w-[65px] text-[9px] px-1 py-0 shadow-sm border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 rounded-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="DEP" className="text-[10px]">DEP</SelectItem>
                                      <SelectItem value="HE" className="text-[10px]">HE</SelectItem>
                                      <SelectItem value="ST" className="text-[10px]">ST</SelectItem>
                                      <SelectItem value="AUTRE" className="text-[10px]">AUTRE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {timeSlots.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun créneau configuré pour ce semestre.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seance Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la séance</DialogTitle>
          </DialogHeader>
          {selectedSeance && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedSeance.type)}
                {getStatusBadge(selectedSeance.statut)}
              </div>
              <div>
                <p className="font-semibold text-lg">{selectedSeance.matiereCode}</p>
                <p className="text-muted-foreground">{selectedSeance.matiereIntitule}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Jour:</span> {selectedSeance.jour}</div>
                <div><span className="text-muted-foreground">Créneau:</span> {selectedSeance.heureDebut} - {selectedSeance.heureFin}</div>
                <div className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedSeance.professeurNoms?.join(", ")}</div>
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedSeance.salleNoms?.join(", ")}</div>
              </div>
              {/* Status change buttons */}
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                <span className="text-xs text-muted-foreground w-full mb-1">Changer le statut :</span>
                {selectedSeance.statut !== "REALISEE" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                    onClick={() => handleChangeStatus(selectedSeance.id, "REALISEE")}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Réalisée
                  </Button>
                )}
                {selectedSeance.statut !== "ANNULEE" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                    onClick={() => handleChangeStatus(selectedSeance.id, "ANNULEE")}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                    Annulée
                  </Button>
                )}
                {selectedSeance.statut !== "PLANIFIEE" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangeStatus(selectedSeance.id, "PLANIFIEE")}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Calendar className="w-4 h-4 mr-1" />}
                    Planifiée
                  </Button>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="destructive" size="sm" onClick={() => { setIsDetailOpen(false); setIsDeleteOpen(true); }}>
                  <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Supprimer la séance {selectedSeance?.matiereCode} ({selectedSeance?.type}) ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={saving}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteSeance} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Seance Dialog — all fields with affectation quick-fill */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une séance</DialogTitle>
            <DialogDescription>
              {pendingSlot && `${pendingSlot.day} • ${pendingSlot.start} - ${pendingSlot.end}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Quick fill from affectation (optional) */}
            {affectations.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">⚡ Remplissage rapide (depuis une affectation)</label>
                <Select value={selectedAffectation} onValueChange={handleAffectationQuickFill}>
                  <SelectTrigger><SelectValue placeholder="Optionnel — choisir une affectation..." /></SelectTrigger>
                  <SelectContent>
                    {affectations
                      .filter((a) => {
                        if (pendingSlot?.type === "DEP") return a.departementIds.length === 1;
                        if (pendingSlot?.type === "HE" || pendingSlot?.type === "ST") return a.departementIds.length !== 1;
                        return true;
                      })
                      .map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.matiereCode} ({a.type}) — {a.professeurNoms?.join(", ")} — {a.salleNoms?.join(", ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <hr className="border-border" />

            {/* Matière */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Matière *</label>
              <Select value={formMatiere} onValueChange={setFormMatiere}>
                <SelectTrigger><SelectValue placeholder="Sélectionner la matière" /></SelectTrigger>
                <SelectContent>
                  {matieres.map((m) => (
                    <SelectItem key={m.code} value={m.code}>{m.code} — {m.intitule}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Type de séance *</label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CM">CM — Cours Magistral</SelectItem>
                  <SelectItem value="TD">TD — Travaux Dirigés</SelectItem>
                  <SelectItem value="TP">TP — Travaux Pratiques</SelectItem>
                  <SelectItem value="EXAMEN">EXAMEN</SelectItem>
                  <SelectItem value="DEVOIR">DEVOIR</SelectItem>
                  <SelectItem value="MEETING">MEETING</SelectItem>
                  <SelectItem value="AUTRE">AUTRE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Professeur */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Enseignant(s)</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {professeurs.map((p) => (
                  <Badge
                    key={p.id}
                    variant={formProf.includes(String(p.id)) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const id = String(p.id);
                      setFormProf(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                    }}
                  >
                    {p.prenom} {p.nom} ({p.statut})
                  </Badge>
                ))}
                {professeurs.length === 0 && <span className="text-muted-foreground text-sm">Aucun enseignant disponible</span>}
              </div>
            </div>

            {/* Salle */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Salle(s) {(formType === "CM" || formType === "TD" || formType === "TP") ? "*" : "(Optionnel)"}</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {sallesAll.map((s) => (
                  <Badge
                    key={s.id}
                    variant={formSalle.includes(String(s.id)) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const id = String(s.id);
                      setFormSalle(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                    }}
                  >
                    {s.nom} ({s.typeSalle})
                  </Badge>
                ))}
                {sallesAll.length === 0 && <span className="text-muted-foreground text-sm">Aucune salle disponible</span>}
              </div>
            </div>

            {/* Tag */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Tag / Note (optionnel)</label>
              <Input value={formTag} onChange={(e) => setFormTag(e.target.value)} placeholder="Ex: Rattrapage, Online..." />
            </div>

            {/* Preview card */}
            {formMatiere && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <div className="flex items-center gap-2">
                  {getTypeBadge(formType)}
                  <span className="font-medium">{formMatiere}</span>
                  {formTag && <Badge variant="outline" className="text-xs">{formTag}</Badge>}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="w-3 h-3" /> {formProf ? (() => { const p = professeurs.find(p => String(p.id) === formProf); return p ? `${p.prenom} ${p.nom}` : '—'; })() : '—'}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {formSalle ? (() => { const s = sallesAll.find(s => String(s.id) === formSalle); return s ? `${s.nom} (${s.typeSalle})` : '—'; })() : '—'}
                </div>
                {formIsCommun && <Badge variant="secondary" className="text-xs">Commun (tous départements)</Badge>}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={saving}>Annuler</Button>
              <Button onClick={handleCreateSeance} disabled={saving || !formMatiere || !formSalle}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Créer la séance
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Creneaux Dialog */}
      <Dialog open={isCreneauxOpen} onOpenChange={setIsCreneauxOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gérer les horaires</DialogTitle>
            <DialogDescription>
              Modifiez les heures de début et de fin des créneaux de ce semestre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {editingSlots.map((slot, index) => (
              <div key={slot.id} className="grid grid-cols-[auto_1fr_auto_1fr_minmax(100px,120px)] items-center gap-3 bg-muted/50 p-2 rounded-lg">
                <span className="text-sm font-medium w-16 text-muted-foreground">Créneau {index + 1}</span>
                <Input type="time" value={slot.newStart.substring(0, 5)} onChange={(e) => {
                  const newSlots = [...editingSlots];
                  newSlots[index].newStart = e.target.value;
                  setEditingSlots(newSlots);
                }} />
                <span className="text-muted-foreground">-</span>
                <Input type="time" value={slot.newEnd.substring(0, 5)} onChange={(e) => {
                  const newSlots = [...editingSlots];
                  newSlots[index].newEnd = e.target.value;
                  setEditingSlots(newSlots);
                }} />
                <Select value={slot.newType} onValueChange={(val) => {
                  const newSlots = [...editingSlots];
                  newSlots[index].newType = val;
                  setEditingSlots(newSlots);
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEP">DEP</SelectItem>
                    <SelectItem value="HE">HE</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="AUTRE">AUTRE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
            {editingSlots.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun créneau configuré.</p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreneauxOpen(false)} disabled={saving}>Annuler</Button>
              <Button onClick={handleSaveCreneaux} disabled={saving || editingSlots.length === 0}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
