import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProgressTable } from '@/components/bilan'
import { TrendingUp, BookOpen, GraduationCap, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bilanService, semestreService, departementService } from '@/services'
import type { BilanDto, SemestreDto, DepartementDto } from '@/types'

export default function BilanPage() {
  const [bilan, setBilan] = useState<BilanDto | null>(null)
  const [semestres, setSemestres] = useState<SemestreDto[]>([])
  const [departments, setDepartments] = useState<DepartementDto[]>([])
  const [selectedSemestre, setSelectedSemestre] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial selectors
  useEffect(() => {
    Promise.all([
      semestreService.getAll(),
      departementService.getAll(),
    ]).then(([sem, dept]) => {
      setSemestres(sem)
      setDepartments(dept)
      if (sem.length > 0) setSelectedSemestre(String(sem[0].id))
      if (dept.length > 0) setSelectedDept(String(dept[0].id))
    }).catch(() => setError('Impossible de charger les données'))
  }, [])

  // Load bilan when selection changes
  useEffect(() => {
    if (!selectedSemestre || !selectedDept) return
    setLoading(true)
    setError(null)
    bilanService.getBilan(Number(selectedDept), Number(selectedSemestre))
      .then(setBilan)
      .catch(() => setError('Impossible de charger le bilan'))
      .finally(() => setLoading(false))
  }, [selectedSemestre, selectedDept])

  // Map API data to ProgressTable format
  const courses = useMemo(() => {
    if (!bilan) return []
    return bilan.courses.map(c => ({
      courseCode: c.matiereCode,
      courseName: c.matiereIntitule,
      teacher: `${c.professeurPrenom} ${c.professeurNom}`,
      planned: c.planned,
      completed: c.completed,
      evaluations: { devoir: 0, examen: 0, rattrapage: 0 },
    }))
  }, [bilan])

  const summary = useMemo(() => {
    if (!bilan) return { planned: { cm: 0, td: 0, tp: 0 }, completed: { cm: 0, td: 0, tp: 0 } }
    return bilan.summary
  }, [bilan])

  const overallPercentage = bilan?.summary.overallPercentage ?? 0
  const totalPlanned = summary.planned.cm + summary.planned.td + summary.planned.tp
  const totalCompleted = summary.completed.cm + summary.completed.td + summary.completed.tp

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Bilan de Progression</h2>
          <p className="text-sm text-muted-foreground">
            Suivi des séances CM/TD/TP pour {bilan?.semestreLibelle || '—'} • {bilan?.departementCode || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={() => setError(null)}>Réessayer</Button>
        </div>
      )}

      {!loading && !error && bilan && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Progression Globale
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallPercentage}%</div>
                <p className="text-xs text-muted-foreground">
                  {totalCompleted}/{totalPlanned} séances effectuées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Matières Suivies
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  {courses.filter(c =>
                    c.completed.cm >= c.planned.cm &&
                    c.completed.td >= c.planned.td &&
                    c.completed.tp >= c.planned.tp
                  ).length} terminées à 100%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Évaluations
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">—</div>
                <p className="text-xs text-muted-foreground">
                  Fonctionnalité à venir
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progression des Séances</CardTitle>
              <CardDescription>
                Comparaison entre les heures prévues et effectuées par type de séance
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <ProgressTable courses={courses} summary={summary} />
            </CardContent>
          </Card>
        </>
      )}

      {!loading && !error && !bilan && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Aucune donnée disponible pour ce semestre et département.</p>
        </div>
      )}
    </div>
  )
}
