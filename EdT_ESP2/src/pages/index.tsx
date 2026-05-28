import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { departementService, semestreService } from "@/services";
import creneauService from "@/services/creneauService";
import type { DepartementDto, SemestreDto, CreneauDto } from "@/types";
import { Building, CalendarDays, Loader2, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MiniEdtGrid } from "@/components/planning/MiniEdtGrid";

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const ecoleId = user?.ecoleId || "ESP";

  const [departments, setDepartments] = useState<DepartementDto[]>([]);
  const [semesters, setSemesters] = useState<SemestreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Department Form
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [deptCode, setDeptCode] = useState("");
  const [deptNom, setDeptNom] = useState("");
  const [deptSaving, setDeptSaving] = useState(false);

  // Semester Form
  const [isSemOpen, setIsSemOpen] = useState(false);
  const [semLibelle, setSemLibelle] = useState("");
  const [semStart, setSemStart] = useState("");
  const [semEnd, setSemEnd] = useState("");
  const [semSaving, setSemSaving] = useState(false);

  // Semester Setup (Creneaux)
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configSemestreId, setConfigSemestreId] = useState<number | null>(null);
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([]);
  const [editingSlots, setEditingSlots] = useState<{ id: string, oldStart: string, oldEnd: string, newStart: string, newEnd: string, newType: string }[]>([]);
  const [configSaving, setConfigSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [depts, sems] = await Promise.all([
        departementService.getAll(),
        semestreService.getAll()
      ]);
      setDepartments(depts);
      setSemesters(sems);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptSaving(true);
    try {
      await departementService.create({
        code: deptCode,
        nom: deptNom,
        ecoleId: ecoleId,
      });
      setIsDeptOpen(false);
      setDeptCode("");
      setDeptNom("");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création du département");
    } finally {
      setDeptSaving(false);
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setSemSaving(true);
    try {
      const newSem = await semestreService.create({
        libelle: semLibelle,
        dateDebut: semStart,
        dateFin: semEnd,
      });
      setIsSemOpen(false);
      setSemLibelle("");
      setSemStart("");
      setSemEnd("");
      fetchData();
      
      // Load creneaux and open config
      const cren = await creneauService.getAll(newSem.id);
      setCreneaux(cren);
      const unique = getTimeSlotsFromCreneaux(cren);
      setEditingSlots(unique.map(u => ({ id: u.label, oldStart: u.start, oldEnd: u.end, newStart: u.start, newEnd: u.end, newType: u.type })));
      setConfigSemestreId(newSem.id);
      setIsConfigOpen(true);

    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création du semestre");
    } finally {
      setSemSaving(false);
    }
  };

  const handleSaveCreneaux = async () => {
    if (!configSemestreId) return;
    setConfigSaving(true);
    try {
      const promises = [];
      
      // 1. Save time updates from editingSlots
      for (const slot of editingSlots) {
        if (slot.oldStart !== slot.newStart || slot.oldEnd !== slot.newEnd) {
          const matching = creneaux.filter(c => c.heureDebut === slot.oldStart && c.heureFin === slot.oldEnd);
          for (const c of matching) {
            promises.push(creneauService.update(c.id, {
              jour: c.jour,
              heureDebut: slot.newStart + (slot.newStart.length === 5 ? ":00" : ""),
              heureFin: slot.newEnd + (slot.newEnd.length === 5 ? ":00" : ""),
              typeCreneau: c.typeCreneau as any,
              semestreId: c.semestreId
            }));
          }
        }
      }
      
      // 2. Save type updates from MiniEdtGrid (_dirty flag)
      const dirtyCreneaux = creneaux.filter(c => (c as any)._dirty);
      if (dirtyCreneaux.length > 0) {
        // Group by type to bulk update
        const types = new Set(dirtyCreneaux.map(c => c.typeCreneau));
        for (const type of types) {
          const ids = dirtyCreneaux.filter(c => c.typeCreneau === type).map(c => c.id);
          promises.push(creneauService.bulkUpdateType(ids, type));
        }
      }

      await Promise.all(promises);
      setIsConfigOpen(false);
      setConfigSemestreId(null);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la configuration des horaires");
    } finally {
      setConfigSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground mt-1">
          Gérez les départements et les semestres de votre école.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Départements
              </CardTitle>
              <CardDescription>
                Structures académiques de l'école
              </CardDescription>
            </div>
            <Button onClick={() => setIsDeptOpen(true)} size="sm" className="h-8 gap-1">
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucun département créé.</p>
            ) : (
              <div className="space-y-3 mt-4">
                {departments.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{d.code}</p>
                      <p className="text-sm text-muted-foreground">{d.nom}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Semesters Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Semestres
              </CardTitle>
              <CardDescription>
                Périodes académiques
              </CardDescription>
            </div>
            <Button onClick={() => setIsSemOpen(true)} size="sm" className="h-8 gap-1">
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </Button>
          </CardHeader>
          <CardContent>
            {semesters.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Aucun semestre créé.</p>
            ) : (
              <div className="space-y-3 mt-4">
                {semesters.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{s.libelle}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(s.dateDebut).toLocaleDateString()} - {new Date(s.dateFin).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un département</DialogTitle>
            <DialogDescription>Créez un nouveau département pour votre école.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDept} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code (ex: IRT)</label>
              <input type="text" required value={deptCode} onChange={e => setDeptCode(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom complet</label>
              <input type="text" required value={deptNom} onChange={e => setDeptNom(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDeptOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={deptSaving}>
                {deptSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Semester Dialog */}
      <Dialog open={isSemOpen} onOpenChange={setIsSemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un semestre</DialogTitle>
            <DialogDescription>
              La création génèrera automatiquement les semaines académiques et les créneaux.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSemester} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Libellé (ex: Semestre 1 - 2024/2025)</label>
              <input type="text" required value={semLibelle} onChange={e => setSemLibelle(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début</label>
                <input type="date" required value={semStart} onChange={e => setSemStart(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <input type="date" required value={semEnd} onChange={e => setSemEnd(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsSemOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={semSaving}>
                {semSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configure Creneaux Dialog (After Creation) */}
      <Dialog open={isConfigOpen} onOpenChange={(open) => {
        if (!open) {
          setIsConfigOpen(false);
          setConfigSemestreId(null);
        }
      }}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configuration initiale</DialogTitle>
            <DialogDescription>
              Veuillez définir les horaires de base et les types de créneaux par défaut pour ce semestre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <MiniEdtGrid 
              editingSlots={editingSlots} 
              setEditingSlots={setEditingSlots} 
              creneaux={creneaux} 
              setCreneaux={setCreneaux} 
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)} disabled={configSaving}>Plus tard</Button>
              <Button onClick={handleSaveCreneaux} disabled={configSaving || editingSlots.length === 0}>
                {configSaving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
