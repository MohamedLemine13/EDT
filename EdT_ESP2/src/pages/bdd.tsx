import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  SearchBar,
  CoursesTable,
  TeachersTable,
  RoomsTable,
  DetailPanel,
  CourseForm,
  TeacherForm,
  RoomForm,
} from '@/components/database'
import { BookOpen, Users, Building, Link, Plus, RotateCcw, Loader2, AlertCircle } from 'lucide-react'
import {
  matiereService,
  professeurService,
  salleService,
  affectationService,
  semestreService,
  departementService,
  ecoleService,
} from '@/services'
import type {
  MatiereDto,
  ProfesseurDto,
  SalleDto,
  AffectationEnseignementDto,
  SemestreDto,
  DepartementDto,
  EcoleDto,
  Course,
  Teacher,
  Room,
} from '@/types'

type TabValue = 'courses' | 'teachers' | 'rooms' | 'affectations'

// Map API types to the local component types expected by the tables/forms
function mapMatiereToCourse(m: MatiereDto): Course {
  return {
    code: m.code,
    title: m.intitule,
    credits: m.credits,
    typeMatiere: m.typeMatiere as any,
    hours: { cm: m.hCm, td: m.hTd, tp: m.hTp, total: m.hCm + m.hTd + m.hTp },
    teachers: { cm: '', td: '', tp: '' },
    rooms: { cm: '', td: '', tp: '' },
    color: '#1565C0',
  }
}

function mapProfToTeacher(p: ProfesseurDto): Teacher {
  return {
    id: String(p.id),
    name: `${p.prenom} ${p.nom}`,
    department: '',
    email: p.email || '',
    courses: [],
  }
}

function mapSalleToRoom(s: SalleDto): Room {
  return {
    id: String(s.id),
    code: s.nom,
    name: s.nom,
    capacity: s.capacite || 0,
    equipment: s.equipements ? s.equipements.split(',').map(e => e.trim()).filter(Boolean) : [],
    building: s.typeSalle,
    departmentId: s.departementId ? String(s.departementId) : undefined,
  }
}

export default function BDDPage() {
  // API data
  const [matieres, setMatieres] = useState<MatiereDto[]>([])
  const [professeurs, setProfesseurs] = useState<ProfesseurDto[]>([])
  const [salles, setSalles] = useState<SalleDto[]>([])
  const [affectations, setAffectations] = useState<AffectationEnseignementDto[]>([])
  const [semestres, setSemestres] = useState<SemestreDto[]>([])
  const [departments, setDepartments] = useState<DepartementDto[]>([])
  const [ecoles, setEcoles] = useState<EcoleDto[]>([])

  // Selectors for affectations tab
  const [selectedSemestre, setSelectedSemestre] = useState('')
  const [selectedDept, setSelectedDept] = useState('')

  // Mapped data for tables
  const courses = matieres.map(mapMatiereToCourse)
  const teachers = professeurs.map(mapProfToTeacher)
  const rooms = salles.map(mapSalleToRoom)

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('courses')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Form dialog states
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false)
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false)
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isAffectationFormOpen, setIsAffectationFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Load initial data
  const fetchAll = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      matiereService.getAll(),
      professeurService.getAll(),
      salleService.getAll(),
      semestreService.getAll(),
      departementService.getAll(),
      ecoleService.getAll(),
    ]).then(([mat, prof, sal, sem, dept, eco]) => {
      setMatieres(mat)
      setProfesseurs(prof)
      setSalles(sal)
      setSemestres(sem)
      setDepartments(dept)
      setEcoles(eco)
      if (sem.length > 0) setSelectedSemestre(String(sem[0].id))
      if (dept.length > 0) setSelectedDept(String(dept[0].id))
    }).catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Load affectations when selectors change
  useEffect(() => {
    if (!selectedSemestre || !selectedDept) return
    affectationService.getAll(Number(selectedSemestre), Number(selectedDept))
      .then(setAffectations)
      .catch(() => setAffectations([]))
  }, [selectedSemestre, selectedDept])

  // Tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue)
    setSearchQuery('')
    setSelectedCourse(null)
    setSelectedTeacher(null)
    setSelectedRoom(null)
  }

  const getDetailItem = () => {
    switch (activeTab) {
      case 'courses': return selectedCourse
      case 'teachers': return selectedTeacher
      case 'rooms': return selectedRoom
      default: return null
    }
  }

  const handleCloseDetail = () => {
    setSelectedCourse(null)
    setSelectedTeacher(null)
    setSelectedRoom(null)
  }

  const handleAddClick = () => {
    setFormMode('create')
    if (activeTab === 'courses') { setSelectedCourse(null); setIsCourseFormOpen(true) }
    else if (activeTab === 'teachers') { setSelectedTeacher(null); setIsTeacherFormOpen(true) }
    else if (activeTab === 'rooms') { setSelectedRoom(null); setIsRoomFormOpen(true) }
    else if (activeTab === 'affectations') { setIsAffectationFormOpen(true) }
  }

  const handleEditClick = () => {
    setFormMode('edit')
    if (activeTab === 'courses' && selectedCourse) setIsCourseFormOpen(true)
    else if (activeTab === 'teachers' && selectedTeacher) setIsTeacherFormOpen(true)
    else if (activeTab === 'rooms' && selectedRoom) setIsRoomFormOpen(true)
  }

  // CRUD handlers
  const handleSaveCourse = async (course: Course) => {
    try {
      const dto = { 
        code: course.code, 
        intitule: course.title, 
        credits: course.credits, 
        hCm: course.hours.cm, 
        hTd: course.hours.td, 
        hTp: course.hours.tp,
        typeMatiere: course.typeMatiere 
      }
      if (formMode === 'create') {
        await matiereService.create(dto)
      } else {
        await matiereService.update(course.code, dto)
      }
      const updated = await matiereService.getAll()
      setMatieres(updated)
      setSelectedCourse(mapMatiereToCourse(updated.find(m => m.code === course.code) || updated[0]))
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleSaveTeacher = async (teacher: Teacher) => {
    try {
      const parts = teacher.name.split(' ')
      const prenom = parts[0] || ''
      const nom = parts.slice(1).join(' ') || ''
      const statut: "VACATAIRE" | "PERMANENT" = teacher.department === 'VACATAIRE' ? 'VACATAIRE' : 'PERMANENT'
      const dto = { nom, prenom, statut, email: teacher.email }
      if (formMode === 'create') {
        await professeurService.create(dto)
      } else {
        await professeurService.update(Number(teacher.id), dto)
      }
      const updated = await professeurService.getAll()
      setProfesseurs(updated)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleSaveRoom = async (room: Room) => {
    try {
      const ecoleId = ecoles.length > 0 ? ecoles[0].id : 'ESP'
      const dto = { 
        nom: room.name, 
        typeSalle: (room.building as 'AMPHI' | 'SALLE' | 'LABO') || 'SALLE', 
        ecoleId,
        departementId: room.building !== 'AMPHI' && room.departmentId ? Number(room.departmentId) : undefined,
        capacite: room.capacity || undefined,
        equipements: room.equipment && room.equipment.length > 0 ? room.equipment.join(', ') : undefined
      }
      if (formMode === 'create') {
        await salleService.create(dto)
      } else {
        await salleService.update(Number(room.id), dto)
      }
      const updated = await salleService.getAll()
      setSalles(updated)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async () => {
    try {
      if (activeTab === 'courses' && selectedCourse) {
        await matiereService.delete(selectedCourse.code)
        setMatieres(await matiereService.getAll())
        setSelectedCourse(null)
      } else if (activeTab === 'teachers' && selectedTeacher) {
        await professeurService.delete(Number(selectedTeacher.id))
        setProfesseurs(await professeurService.getAll())
        setSelectedTeacher(null)
      } else if (activeTab === 'rooms' && selectedRoom) {
        await salleService.delete(Number(selectedRoom.id))
        setSalles(await salleService.getAll())
        setSelectedRoom(null)
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || 'Erreur lors de la suppression')
    }
    setIsDeleteDialogOpen(false)
  }

  const handleSaveAffectation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      const depIdsForm = formData.getAll('departementIds').map(id => parseInt(id as string));
      await affectationService.upsert({
        semestreId: Number(selectedSemestre),
        departementIds: depIdsForm,
        matiereCode: formData.get('courseCode') as string,
        type: formData.get('type') as 'CM' | 'TD' | 'TP',
        professeurIds: formData.getAll('teacherIds').map(id => parseInt(id as string)),
        salleIds: formData.getAll('roomIds').map(id => parseInt(id as string)),
      })
      setIsAffectationFormOpen(false)
      // Refresh affectations
      const updated = await affectationService.getAll(Number(selectedSemestre), selectedDept === 'tous' ? undefined : Number(selectedDept))
      setAffectations(updated)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || 'Erreur lors de la création de l\'affectation')
    }
  }

  const handleDeleteAffectation = async (id: number) => {
    try {
      await affectationService.delete(id)
      const updated = await affectationService.getAll(Number(selectedSemestre), selectedDept === 'tous' ? undefined : Number(selectedDept))
      setAffectations(updated)
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      setError(apiErr.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Base de Données</h2>
          <p className="text-sm text-muted-foreground">
            Référentiel des matières, enseignants et salles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Rafraîchir
          </Button>
          <Button size="sm" onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>Fermer</Button>
        </div>
      )}

      {/* Main content with tabs */}
      <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <TabsList>
                    <TabsTrigger value="courses" className="gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Matières</span>
                      <span className="text-xs text-muted-foreground">({courses.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Enseignants</span>
                      <span className="text-xs text-muted-foreground">({teachers.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="rooms" className="gap-1.5">
                      <Building className="h-4 w-4" />
                      <span className="hidden sm:inline">Salles</span>
                      <span className="text-xs text-muted-foreground">({rooms.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="affectations" className="gap-1.5">
                      <Link className="h-4 w-4" />
                      <span className="hidden sm:inline">Affectations</span>
                      <span className="text-xs text-muted-foreground">({affectations.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="w-full sm:w-64">
                    <SearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder={
                        activeTab === 'courses'
                          ? 'Rechercher une matière...'
                          : activeTab === 'teachers'
                          ? 'Rechercher un enseignant...'
                          : 'Rechercher une salle...'
                      }
                    />
                  </div>
                </div>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab}>
              <TabsContent value="courses" className="mt-0">
                <CoursesTable
                  courses={courses}
                  searchQuery={searchQuery}
                  selectedCourse={selectedCourse}
                  onSelectCourse={setSelectedCourse}
                />
              </TabsContent>
              <TabsContent value="teachers" className="mt-0">
                <TeachersTable
                  teachers={teachers}
                  searchQuery={searchQuery}
                  selectedTeacher={selectedTeacher}
                  onSelectTeacher={setSelectedTeacher}
                />
              </TabsContent>
              <TabsContent value="rooms" className="mt-0">
                <RoomsTable
                  rooms={rooms}
                  searchQuery={searchQuery}
                  selectedRoom={selectedRoom}
                  onSelectRoom={setSelectedRoom}
                />
              </TabsContent>
              <TabsContent value="affectations" className="mt-0">
                <div className="space-y-4">
                  {/* Semester + Dept selector for affectations */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                      <SelectTrigger className="w-[100px]"><SelectValue placeholder="Dept" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tous">Tous (Commun & Départements)</SelectItem>
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

                  {affectations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Link className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Aucune affectation créée</p>
                      <p className="text-sm mt-1">Cliquez sur "Ajouter" pour lier une matière à un enseignant et une salle</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {affectations.map((aff) => (
                        <div key={aff.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">{aff.matiereCode} — {aff.type}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {aff.professeurNoms?.join(", ")} •
                              <span className="font-medium text-primary ml-1">
                                {aff.departementCodes && aff.departementCodes.length > 0 
                                  ? aff.departementCodes.join(', ') 
                                  : 'Commun (Tous)'}
                              </span>
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAffectation(aff.id)}>
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detail panel sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {getDetailItem() ? (
            <DetailPanel
              item={getDetailItem()}
              type={activeTab === 'courses' ? 'course' : activeTab === 'teachers' ? 'teacher' : 'room'}
              onClose={handleCloseDetail}
              onEdit={handleEditClick}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Détails</CardTitle>
                <CardDescription>
                  Sélectionnez un élément dans le tableau pour voir ses détails
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>

      {/* Course Form Dialog */}
      <CourseForm
        course={formMode === 'edit' ? selectedCourse : null}
        isOpen={isCourseFormOpen}
        onClose={() => setIsCourseFormOpen(false)}
        onSave={handleSaveCourse}
        mode={formMode}
      />

      {/* Teacher Form Dialog */}
      <TeacherForm
        teacher={formMode === 'edit' ? selectedTeacher : null}
        isOpen={isTeacherFormOpen}
        onClose={() => setIsTeacherFormOpen(false)}
        onSave={handleSaveTeacher}
        mode={formMode}
      />

      {/* Room Form Dialog */}
      <RoomForm
        room={formMode === 'edit' ? selectedRoom : null}
        isOpen={isRoomFormOpen}
        onClose={() => setIsRoomFormOpen(false)}
        onSave={handleSaveRoom}
        mode={formMode}
        departments={departments}
      />

      {/* Affectation Form Dialog */}
      <Dialog open={isAffectationFormOpen} onOpenChange={setIsAffectationFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle affectation</DialogTitle>
            <DialogDescription>
              Liez une matière à un enseignant et une salle pour un type de séance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAffectation} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="courseCode" className="text-sm font-medium">Matière</label>
              <select id="courseCode" name="courseCode" required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">-- Sélectionner --</option>
                {matieres.map((m) => (
                  <option key={m.code} value={m.code}>{m.code} - {m.intitule}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Départements concernés</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {departments.map((d) => (
                  <label key={d.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      name="departementIds" 
                      value={d.id} 
                      className="rounded border-gray-300"
                      defaultChecked={selectedDept === String(d.id)}
                    />
                    <span className="text-sm">{d.code}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Laissez tout décoché pour une matière commune (HE/ST).</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enseignant(s)</label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {professeurs.map((p) => (
                  <label key={p.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      name="teacherIds" 
                      value={p.id} 
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{p.prenom} {p.nom}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Salle(s)</label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {salles.map((s) => (
                  <label key={s.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      name="roomIds" 
                      value={s.id} 
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{s.nom} ({s.typeSalle})</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Type</label>
              <select id="type" name="type" required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="CM">CM - Cours Magistral</option>
                <option value="TD">TD - Travaux Dirigés</option>
                <option value="TP">TP - Travaux Pratiques</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAffectationFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
