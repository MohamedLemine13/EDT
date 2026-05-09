import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Course } from '@/types'

interface CourseFormProps {
  course?: Course | null
  isOpen: boolean
  onClose: () => void
  onSave: (course: Course) => void
  mode: 'create' | 'edit'
}

const defaultCourse: Course = {
  code: '',
  title: '',
  credits: 3,
  coefficient: 2,
  hours: { cm: 10, td: 10, tp: 10, total: 30 },
  teachers: { cm: '', td: '', tp: '' },
  rooms: { cm: '', td: '', tp: '' },
  color: '#6b7280',
}

export function CourseForm({ course, isOpen, onClose, onSave, mode }: CourseFormProps) {
  const [formData, setFormData] = useState<Course>(course || defaultCourse)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Calculate total hours
    const total = formData.hours.cm + formData.hours.td + formData.hours.tp
    onSave({
      ...formData,
      hours: { ...formData.hours, total },
    })
    onClose()
  }

  const updateField = <K extends keyof Course>(field: K, value: Course[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateHours = (type: 'cm' | 'td' | 'tp', value: number) => {
    setFormData((prev) => ({
      ...prev,
      hours: { ...prev.hours, [type]: value },
    }))
  }

  const updateTeacher = (type: 'cm' | 'td' | 'tp', value: string) => {
    setFormData((prev) => ({
      ...prev,
      teachers: { ...prev.teachers, [type]: value },
    }))
  }

  const updateRoom = (type: 'cm' | 'td' | 'tp', value: string) => {
    setFormData((prev) => ({
      ...prev,
      rooms: { ...prev.rooms, [type]: value },
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Ajouter une matière' : 'Modifier la matière'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations de la nouvelle matière.'
              : 'Modifiez les informations de la matière.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value)}
              placeholder="IRT31"
              required
              disabled={mode === 'edit'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Systèmes d'exploitation"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Crédits</Label>
              <Input
                id="credits"
                type="number"
                min={1}
                max={10}
                value={formData.credits}
                onChange={(e) => updateField('credits', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coefficient">Coefficient</Label>
              <Input
                id="coefficient"
                type="number"
                min={1}
                max={10}
                value={formData.coefficient}
                onChange={(e) => updateField('coefficient', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <Label>Volume horaire</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="hours-cm" className="text-xs text-muted-foreground">CM</Label>
                <Input
                  id="hours-cm"
                  type="number"
                  min={0}
                  value={formData.hours.cm}
                  onChange={(e) => updateHours('cm', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="hours-td" className="text-xs text-muted-foreground">TD</Label>
                <Input
                  id="hours-td"
                  type="number"
                  min={0}
                  value={formData.hours.td}
                  onChange={(e) => updateHours('td', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="hours-tp" className="text-xs text-muted-foreground">TP</Label>
                <Input
                  id="hours-tp"
                  type="number"
                  min={0}
                  value={formData.hours.tp}
                  onChange={(e) => updateHours('tp', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Teachers */}
          <div className="space-y-2">
            <Label>Enseignants</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="teacher-cm" className="text-xs text-muted-foreground">CM</Label>
                <Input
                  id="teacher-cm"
                  value={formData.teachers.cm}
                  onChange={(e) => updateTeacher('cm', e.target.value)}
                  placeholder="Nom"
                />
              </div>
              <div>
                <Label htmlFor="teacher-td" className="text-xs text-muted-foreground">TD</Label>
                <Input
                  id="teacher-td"
                  value={formData.teachers.td}
                  onChange={(e) => updateTeacher('td', e.target.value)}
                  placeholder="Nom"
                />
              </div>
              <div>
                <Label htmlFor="teacher-tp" className="text-xs text-muted-foreground">TP</Label>
                <Input
                  id="teacher-tp"
                  value={formData.teachers.tp}
                  onChange={(e) => updateTeacher('tp', e.target.value)}
                  placeholder="Nom"
                />
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div className="space-y-2">
            <Label>Salles</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="room-cm" className="text-xs text-muted-foreground">CM</Label>
                <Input
                  id="room-cm"
                  value={formData.rooms.cm}
                  onChange={(e) => updateRoom('cm', e.target.value)}
                  placeholder="Salle"
                />
              </div>
              <div>
                <Label htmlFor="room-td" className="text-xs text-muted-foreground">TD</Label>
                <Input
                  id="room-td"
                  value={formData.rooms.td}
                  onChange={(e) => updateRoom('td', e.target.value)}
                  placeholder="Salle"
                />
              </div>
              <div>
                <Label htmlFor="room-tp" className="text-xs text-muted-foreground">TP</Label>
                <Input
                  id="room-tp"
                  value={formData.rooms.tp}
                  onChange={(e) => updateRoom('tp', e.target.value)}
                  placeholder="Salle"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
