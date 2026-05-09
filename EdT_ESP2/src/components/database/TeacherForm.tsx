import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import type { Teacher } from '@/types'
import { generateId } from '@/hooks/useDataStore'

interface TeacherFormProps {
  teacher?: Teacher | null
  isOpen: boolean
  onClose: () => void
  onSave: (teacher: Teacher) => void
  mode: 'create' | 'edit'
}

const defaultTeacher: Teacher = {
  id: '',
  name: '',
  department: 'IRT',
  email: '',
  courses: [],
}

export function TeacherForm({ teacher, isOpen, onClose, onSave, mode }: TeacherFormProps) {
  const [formData, setFormData] = useState<Teacher>(teacher || { ...defaultTeacher, id: generateId('t') })
  const [newCourse, setNewCourse] = useState('')

  // Reset form when teacher changes
  useEffect(() => {
    setFormData(teacher || { ...defaultTeacher, id: generateId('t') })
    setNewCourse('')
  }, [teacher, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const updateField = <K extends keyof Teacher>(field: K, value: Teacher[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addCourse = () => {
    if (newCourse.trim() && !formData.courses.includes(newCourse.trim().toUpperCase())) {
      setFormData((prev) => ({
        ...prev,
        courses: [...prev.courses, newCourse.trim().toUpperCase()],
      }))
      setNewCourse('')
    }
  }

  const removeCourse = (courseCode: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c !== courseCode),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCourse()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Ajouter un enseignant' : 'Modifier l\'enseignant'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations du nouvel enseignant.'
              : 'Modifiez les informations de l\'enseignant.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Dr. Ahmed Mohamed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Département *</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="IRT"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="ahmed@esp.mr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Matières enseignées</Label>
            <div className="flex gap-2">
              <Input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Code matière (ex: IRT31)"
              />
              <Button type="button" variant="outline" onClick={addCourse}>
                Ajouter
              </Button>
            </div>
            {formData.courses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.courses.map((code) => (
                  <Badge key={code} variant="secondary" className="gap-1">
                    {code}
                    <button
                      type="button"
                      onClick={() => removeCourse(code)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
