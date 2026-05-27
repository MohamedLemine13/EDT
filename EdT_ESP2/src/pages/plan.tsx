import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Calendar, LayoutGrid, GraduationCap, Info, List, Loader2, AlertCircle, Clock } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { PlanningMatrix } from '@/components/planning/PlanningMatrix'
import { CourseLegend } from '@/components/planning/CourseLegend'
import { AddEntryDialog } from '@/components/planning/AddEntryDialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  semestreService,
  semaineService,
  creneauService,
  seanceService,
  affectationService,
  departementService,
  matiereService,
  calendrierService,
  professeurService,
  salleService,
} from '@/services'
import type {
  SemestreDto,
  SemaineAcademiqueDto,
  CreneauDto,
  SeanceDto,
  AffectationEnseignementDto,
  DepartementDto,
  MatiereDto,
  EvenementCalendrierDto,
  ProfesseurDto,
  SalleDto,
  CreateSeanceRequestDto,
} from '@/types'
import { useAppState } from '@/hooks/useAppState'

interface PlanningEntry {
  week: number
  day: number
  slot: number
  code: string
  type: string
  seanceId?: number // Track the real backend id
}

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

interface SimpleCourse {
  code: string
  title: string
  color: string
}

// Color palette for courses
const COURSE_COLORS = [
  '#1565C0', '#7B1FA2', '#00838F', '#F57C00', '#C62828',
  '#2E7D32', '#5D4037', '#0097A7', '#AFB42B', '#FF5722',
  '#607D8B', '#8E24AA', '#00695C', '#E65100', '#1B5E20',
]

type BackendDay = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI'
const DAY_TO_INDEX: Record<BackendDay, number> = {
  LUNDI: 0, MARDI: 1, MERCREDI: 2, JEUDI: 3, VENDREDI: 4, SAMEDI: 5,
}

const SLOT_TIMES = ['08:00:00', '09:45:00', '11:30:00', '15:10:00', '17:00:00']
const SLOT_TIME_TO_INDEX: Record<string, number> = {}
SLOT_TIMES.forEach((t, i) => {
  SLOT_TIME_TO_INDEX[t] = i
  // Also map short format (HH:mm) for safety
  SLOT_TIME_TO_INDEX[t.substring(0, 5)] = i
})

export default function PlanPage() {
  const navigate = useNavigate()
  const { department } = useAppState()

  // API data
  const [semestres, setSemestres] = useState<SemestreDto[]>([])
  const [semaines, setSemaines] = useState<SemaineAcademiqueDto[]>([])
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([])
  const [seances, setSeances] = useState<SeanceDto[]>([])
  const [departments, setDepartments] = useState<DepartementDto[]>([])
  const [matieres, setMatieres] = useState<MatiereDto[]>([])
  const [, setProfesseurs] = useState<ProfesseurDto[]>([])
  const [, setSalles] = useState<SalleDto[]>([])
  const [affectations, setAffectations] = useState<AffectationEnseignementDto[]>([])
  const [calendarEvents, setCalendarEvents] = useState<EvenementCalendrierDto[]>([])

  // Selection state
  const [selectedSemestre, setSelectedSemestre] = useState('')
  const [selectedDept, setSelectedDept] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightedCourse, setHighlightedCourse] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<string>('matrix')
  const [saving, setSaving] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isCreneauxOpen, setIsCreneauxOpen] = useState(false)
  const [editingSlots, setEditingSlots] = useState<{ id: string, oldStart: string, oldEnd: string, newStart: string, newEnd: string, newType: string }[]>([])
  const [pendingSlot, setPendingSlot] = useState<{
    week: number; dayIndex: number; slotIndex: number; day: string; slot: string
  } | null>(null)

  // Load initial data
  useEffect(() => {
    Promise.all([
      semestreService.getAll(),
      departementService.getAll(),
      matiereService.getAll(),
      professeurService.getAll(),
      salleService.getAll(),
    ]).then(([sem, dept, mat, prof, sal]) => {
      setSemestres(sem)
      setDepartments(dept)
      setMatieres(mat)
      setProfesseurs(prof)
      setSalles(sal)
      if (sem.length > 0) setSelectedSemestre(String(sem[0].id))
      if (dept.length > 0) {
        const found = dept.find((d: DepartementDto) => d.code === department)
        setSelectedDept(String(found ? found.id : dept[0].id))
      }
    }).catch(() => setError('Impossible de charger les données initiales'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load semaines + creneaux + calendar events when semestre changes
  useEffect(() => {
    if (!selectedSemestre) return
    const sId = Number(selectedSemestre)
    Promise.all([
      semaineService.getAll(sId),
      creneauService.getAll(sId),
      calendrierService.getAll({ semestreId: sId }).catch(() => []),
    ]).then(([sem, cren, events]) => {
      setSemaines(sem)
      setCreneaux(cren)
      setCalendarEvents(events)
    }).catch(() => setError('Impossible de charger les semaines'))
  }, [selectedSemestre])

  // Load affectations when semestre + dept change
  useEffect(() => {
    if (!selectedSemestre || !selectedDept) return
    affectationService.getAll(Number(selectedSemestre), Number(selectedDept))
      .then(setAffectations)
      .catch(() => setAffectations([]))
  }, [selectedSemestre, selectedDept])

  // Load all seances for the department + semester
  const fetchSeances = useCallback(() => {
    if (!selectedDept || !selectedSemestre) return
    setLoading(true)
    setError(null)
    seanceService.getByDepartement(Number(selectedDept), Number(selectedSemestre))
      .then(setSeances)
      .catch(() => setError('Impossible de charger les séances'))
      .finally(() => setLoading(false))
  }, [selectedDept, selectedSemestre])

  useEffect(() => { fetchSeances() }, [fetchSeances])

  // Map seances to PlanningEntry[]
  const schedule = useMemo<PlanningEntry[]>(() => {
    return seances.map(s => ({
      week: s.numeroSemaine,
      day: DAY_TO_INDEX[s.jour as BackendDay] ?? 0,
      slot: SLOT_TIME_TO_INDEX[s.heureDebut] ?? 0,
      code: s.matiereCode || s.tag || '???',
      type: s.type,
      seanceId: s.id,
    }))
  }, [seances])

  // Build courses list from matieres (with auto-colors)
  const courses = useMemo<SimpleCourse[]>(() => {
    return matieres.map((m, i) => ({
      code: m.code,
      title: m.intitule,
      color: COURSE_COLORS[i % COURSE_COLORS.length],
    }))
  }, [matieres])

  // Derive exam/vacation weeks from calendar events
  const examWeeks = useMemo<number[]>(() => {
    const examEvents = calendarEvents.filter(e => e.type === 'EXAMEN')
    const weeks: number[] = []
    examEvents.forEach(ev => {
      semaines.forEach(s => {
        const sStart = new Date(s.dateDebut)
        const sEnd = new Date(s.dateFin)
        const evStart = new Date(ev.dateDebut)
        const evEnd = ev.dateFin ? new Date(ev.dateFin) : evStart
        if (sStart <= evEnd && sEnd >= evStart) {
          weeks.push(s.numeroSemaine)
        }
      })
    })
    return [...new Set(weeks)]
  }, [calendarEvents, semaines])

  const vacationWeeks = useMemo<number[]>(() => {
    const vacEvents = calendarEvents.filter(e => e.type === 'VACANCES')
    const weeks: number[] = []
    vacEvents.forEach(ev => {
      semaines.forEach(s => {
        const sStart = new Date(s.dateDebut)
        const sEnd = new Date(s.dateFin)
        const evStart = new Date(ev.dateDebut)
        const evEnd = ev.dateFin ? new Date(ev.dateFin) : evStart
        if (sStart <= evEnd && sEnd >= evStart) {
          weeks.push(s.numeroSemaine)
        }
      })
    })
    return [...new Set(weeks)]
  }, [calendarEvents, semaines])

  const totalWeeks = semaines.length

  // Stats
  const stats = useMemo(() => {
    const cmCount = schedule.filter(e => e.type === 'CM').length
    const tdCount = schedule.filter(e => e.type === 'TD').length
    const tpCount = schedule.filter(e => e.type === 'TP').length
    const examCount = schedule.filter(e => e.type === 'exam').length
    return { totalEntries: schedule.length, cmCount, tdCount, tpCount, examCount }
  }, [schedule])

  // Find creneauId for a given day+slot
  const findCreneauId = (dayIndex: number, slotIndex: number): number | null => {
    const dayNames: BackendDay[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
    const day = dayNames[dayIndex]
    const time = SLOT_TIMES[slotIndex]
    const creneau = creneaux.find(c => c.jour === day && c.heureDebut === time)
    return creneau?.id ?? null
  }

  // Find semaineId from week number
  const findSemaineId = (weekNum: number): number | null => {
    const s = semaines.find(s => s.numeroSemaine === weekNum)
    return s?.id ?? null
  }

  const handleWeekClick = (week: number) => {
    navigate(`/?week=${week}`)
  }


  const [bulkSelectedCells, setBulkSelectedCells] = useState<{week: number, dayIndex: number, slotIndex: number}[]>([])

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
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la modification des horaires");
    } finally {
      setSaving(false);
    }
  };

  // Handle add from the PlanningMatrix
  const handleAddEntry = (entry: PlanningEntry) => {
    // This is the old local-only add. We no longer use it.
    // Instead, the matrix opens the dialog and we handle creation there.
    console.log('handleAddEntry called (legacy):', entry)
  }

  const handleBulkSelect = (cells: {week: number, dayIndex: number, slotIndex: number}[], typeCreneau: string) => {
    if (cells.length === 0) return
    setBulkSelectedCells(cells)
    
    // We set pendingSlot to the first cell just to satisfy handleEditCreneau's guard
    const firstCell = cells[0]
    setPendingSlot({
      week: firstCell.week,
      dayIndex: firstCell.dayIndex,
      slotIndex: firstCell.slotIndex,
      day: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][firstCell.dayIndex],
      slot: SLOT_TIMES[firstCell.slotIndex],
    })
    
    // Immediately trigger the update using the chosen type from the toolbar
    setTimeout(() => {
      handleEditCreneau(typeCreneau)
    }, 0)
  }

  // Handle actual seance creation from the dialog
  const handleCreateSeance = async (data: {
    matiereCode: string
    type: string
    professeurIds?: number[]
    salleIds?: number[]
    tag?: string
    isCommun: boolean
    departementIds: number[]
  }) => {
    if (bulkSelectedCells.length === 0) return

    setSaving(true)
    setError(null)
    
    let successCount = 0;
    try {
      // Create a seance for every selected cell
      for (const cell of bulkSelectedCells) {
        const creneauId = findCreneauId(cell.dayIndex, cell.slotIndex)
        const semaineId = findSemaineId(cell.week)

        if (!creneauId || !semaineId) {
          continue; // skip invalid cells
        }

        const dto: CreateSeanceRequestDto = {
          type: data.type as 'CM' | 'TD' | 'TP',
          statut: 'PLANIFIEE',
          creneauId,
          matiereCode: data.matiereCode,
          salleIds: data.salleIds,
          semaineId: semaineId,
          professeurIds: data.professeurIds,
          isCommun: data.isCommun,
          tag: data.tag,
          departementIds: data.departementIds,
        }
        await seanceService.create(dto)
        successCount++;
      }
      
      setDialogOpen(false)
      setPendingSlot(null)
      setBulkSelectedCells([])
      fetchSeances()
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || `Erreur après avoir créé ${successCount} séances`)
      if (successCount > 0) fetchSeances() // Refresh what succeeded
    } finally {
      setSaving(false)
    }
  }

  const handleEditCreneau = async (typeCreneau: string) => {
    if (!pendingSlot) return
    setSaving(true)
    setError(null)
    
    const cellsToUpdate = bulkSelectedCells.length > 0 
      ? bulkSelectedCells 
      : [{ week: pendingSlot.week, dayIndex: pendingSlot.dayIndex, slotIndex: pendingSlot.slotIndex }]

    const creneauIdsToUpdate = new Set<number>()
    const dayNames = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
    
    cellsToUpdate.forEach(cell => {
      const jour = dayNames[cell.dayIndex]
      const fullTime = SLOT_TIMES[cell.slotIndex] // e.g. "08:00:00"
      const shortTime = fullTime.substring(0, 5) // e.g. "08:00"
      const matchingCreneau = creneaux.find(c => 
        c.jour === jour && (c.heureDebut === fullTime || c.heureDebut === shortTime || c.heureDebut.startsWith(shortTime))
      )
      if (matchingCreneau) {
        creneauIdsToUpdate.add(matchingCreneau.id)
      }
    })

    try {
      const ids = Array.from(creneauIdsToUpdate)
      console.log('Bulk updating creneaux:', { ids, typeCreneau, cellsToUpdate: cellsToUpdate.length })
      if (ids.length > 0) {
        await creneauService.bulkUpdateType(ids, typeCreneau)
        const newCren = await creneauService.getAll(Number(selectedSemestre))
        setCreneaux(newCren)
      } else {
        console.warn('No matching creneaux found for cells:', cellsToUpdate)
        setError("Aucun créneau trouvé pour les cellules sélectionnées")
      }
    } catch (err: unknown) {
      console.error('bulkUpdateType error:', err)
      setError("Erreur lors de la mise à jour des créneaux")
    } finally {
      setSaving(false)
      setDialogOpen(false)
      setPendingSlot(null)
      setBulkSelectedCells([])
    }
  }

  const currentDeptCode = departments.find(d => String(d.id) === selectedDept)?.code || ''
  const currentSemestreLabel = semestres.find(s => String(s.id) === selectedSemestre)?.libelle || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Plan du Semestre
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {currentSemestreLabel} • {currentDeptCode} • {totalWeeks} semaines • Vue matricielle
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Dept" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={String(d.id)}>{d.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemestre} onValueChange={setSelectedSemestre}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Semestre" /></SelectTrigger>
            <SelectContent>
              {semestres.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.libelle}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            <GraduationCap className="h-3 w-3 mr-1" />
            {courses.length} cours
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {stats.totalEntries} séances
          </Badge>
          <Button variant="outline" size="sm" onClick={handleOpenCreneaux} title="Gérer les horaires">
            <Clock className="h-4 w-4 mr-1" /> Horaires
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.cmCount}</div>
            <div className="text-xs text-muted-foreground">CM</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-emerald-600">{stats.tdCount}</div>
            <div className="text-xs text-muted-foreground">TD</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-200/50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-teal-600">{stats.tpCount}</div>
            <div className="text-xs text-muted-foreground">TP</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-purple-600">{stats.examCount}</div>
            <div className="text-xs text-muted-foreground">Examens</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-primary">{stats.totalEntries}</div>
            <div className="text-xs text-muted-foreground">Total</div>
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
          <Button variant="outline" size="sm" onClick={() => { setError(null); fetchSeances(); }}>Réessayer</Button>
        </div>
      )}

      {/* Info banner */}
      {!loading && !error && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-3">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Astuce :</span> Survolez un cours dans la légende pour le mettre en évidence.
              Cliquez sur une cellule vide pour ajouter une séance. Cliquez sur une séance pour voir son EDT.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && totalWeeks > 0 && (
        <>
          {/* Mobile: Tabs */}
          <div className="lg:hidden">
            <Tabs value={mobileTab} onValueChange={setMobileTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="matrix" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Matrice
                </TabsTrigger>
                <TabsTrigger value="legend" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Légende
                </TabsTrigger>
              </TabsList>
              <TabsContent value="matrix" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Matrice de Planification
                    </CardTitle>
                    <CardDescription>
                      30 créneaux (6 jours × 5 périodes) sur {totalWeeks} semaines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PlanningMatrix
                      creneaux={creneaux}
                      schedule={schedule}
                      courses={courses}
                      weeks={totalWeeks}
                      examWeeks={examWeeks}
                      vacationWeeks={vacationWeeks}
                      onWeekClick={handleWeekClick}
                      highlightedCourse={highlightedCourse}
                      onCourseHover={setHighlightedCourse}
                      onAddEntry={handleAddEntry}
                      onBulkSelect={handleBulkSelect}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="legend" className="mt-0">
                <CourseLegend
                  courses={courses}
                  schedule={schedule}
                  highlightedCourse={highlightedCourse}
                  onCourseHover={setHighlightedCourse}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop: Side by side */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_300px] gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5 text-primary" />
                      Matrice de Planification
                    </CardTitle>
                    <CardDescription className="mt-1">
                      30 créneaux (6 jours × 5 périodes) sur {totalWeeks} semaines
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleWeekClick(1)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Voir EDT
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <PlanningMatrix
                  creneaux={creneaux}
                  schedule={schedule}
                  courses={courses}
                  weeks={totalWeeks}
                  examWeeks={examWeeks}
                  vacationWeeks={vacationWeeks}
                  onWeekClick={handleWeekClick}
                  highlightedCourse={highlightedCourse}
                  onCourseHover={setHighlightedCourse}
                  onAddEntry={handleAddEntry}
                  onBulkSelect={handleBulkSelect}
                />
              </CardContent>
            </Card>

            {/* Legend sidebar */}
            <div className="sticky top-32 self-start space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Légende des Cours
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <CourseLegend
                    courses={courses}
                    schedule={schedule}
                    highlightedCourse={highlightedCourse}
                    onCourseHover={setHighlightedCourse}
                  />
                </CardContent>
              </Card>

              {/* Legend key */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base">Types de Séances</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
                      <span>CM - Cours Magistral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
                      <span>TD - Travaux Dirigés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-teal-600"></div>
                      <span>TP - Travaux Pratiques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-red-600"></div>
                      <span>Exam - Examens</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Rich Add Entry Dialog */}
      <AddEntryDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setPendingSlot(null)
          setBulkSelectedCells([])
        }}
        onAdd={(code: string, type: string) => {
          if (pendingSlot) {
            const aff = affectations.find(a => a.matiereCode === code && a.type === type)
            if (aff) {
              handleCreateSeance({
                matiereCode: code,
                type,
                professeurIds: aff.professeurIds,
                salleIds: aff.salleIds,
                isCommun: aff.departementIds.length !== 1,
                departementIds: aff.departementIds.length !== 1 ? [] : [Number(selectedDept)],
              })
            }
          }
        }}
        onEditCreneau={handleEditCreneau}
        courses={courses}
        week={pendingSlot?.week ?? 0}
        day={bulkSelectedCells.length > 1 ? `${bulkSelectedCells.length} cellules sélectionnées` : pendingSlot?.day ?? ''}
        slot={bulkSelectedCells.length > 1 ? 'Créneaux multiples' : pendingSlot?.slot ?? ''}
        isBulk={bulkSelectedCells.length > 1}
      />

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
  )
}
