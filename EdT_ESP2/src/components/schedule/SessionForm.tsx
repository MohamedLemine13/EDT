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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import type { Session, Course, DayName, SessionType, SessionStatus } from '@/types'
import { DAYS, DAY_LABELS, TIME_SLOTS } from '@/types'
import { generateId } from '@/hooks/useDataStore'

interface SessionFormProps {
  session?: Session | null
  courses: Course[]
  isOpen: boolean
  onClose: () => void
  onSave: (session: Session) => void
  mode: 'create' | 'edit'
  defaultDay?: DayName
  defaultTimeSlot?: number
}

const sessionTypes: SessionType[] = ['CM', 'TD', 'TP']
const sessionStatuses: SessionStatus[] = ['scheduled', 'done', 'cancelled', 'exam', 'online']
const commonTags = ['Examen', 'En ligne', 'Devoir', 'Instruction militaire', 'Club robotique']
const specialTags = ['Examen', 'Devoir', 'Instruction militaire', 'Club robotique']

export function SessionForm({
  session,
  courses,
  isOpen,
  onClose,
  onSave,
  mode,
  defaultDay,
  defaultTimeSlot,
}: SessionFormProps) {
  const defaultSession: Session = {
    id: generateId('s'),
    courseCode: courses[0]?.code || '',
    type: 'CM',
    day: defaultDay || 'lundi',
    timeSlot: defaultTimeSlot ?? 0,
    room: '',
    teacher: '',
    status: 'scheduled',
    tags: [],
  }

  const resolvedSession = session || {
    ...defaultSession,
    day: defaultDay || 'lundi',
    timeSlot: defaultTimeSlot ?? 0,
  }

  // Use a key to reset form state when the dialog opens or session changes
  const formKey = `${session?.id ?? 'new'}-${isOpen}-${defaultDay}-${defaultTimeSlot}`
  const [formData, setFormData] = useState<Session>(resolvedSession)
  const [newTag, setNewTag] = useState('')
  const [prevFormKey, setPrevFormKey] = useState(formKey)

  if (prevFormKey !== formKey) {
    setPrevFormKey(formKey)
    setFormData(resolvedSession)
    setNewTag('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const updateField = <K extends keyof Session>(field: K, value: Session[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }))
  }

  const addCustomTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  // Get selected course info
  const selectedCourse = courses.find((c) => c.code === formData.courseCode)

  // Disable type selector when a special tag is selected
  const hasSpecialTag = formData.tags?.some((t) => specialTags.includes(t)) || false

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Ajouter une séance' : 'Modifier la séance'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Créez une nouvelle séance dans l\'emploi du temps.'
              : 'Modifiez les informations de cette séance.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course selection */}
          <div className="space-y-2">
            <Label htmlFor="courseCode">Matière *</Label>
            <Select
              value={formData.courseCode}
              onValueChange={(value) => {
                updateField('courseCode', value)
                // Auto-fill teacher from course
                const course = courses.find((c) => c.code === value)
                if (course) {
                  const teacherKey = formData.type.toLowerCase() as 'cm' | 'td' | 'tp'
                  if (course.teachers[teacherKey]) {
                    updateField('teacher', course.teachers[teacherKey])
                  }
                  if (course.rooms[teacherKey]) {
                    updateField('room', course.rooms[teacherKey])
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une matière" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.code} value={course.code}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type and Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  updateField('type', value as SessionType)
                  // Auto-fill teacher and room from course
                  if (selectedCourse) {
                    const teacherKey = value.toLowerCase() as 'cm' | 'td' | 'tp'
                    if (selectedCourse.teachers[teacherKey]) {
                      updateField('teacher', selectedCourse.teachers[teacherKey])
                    }
                    if (selectedCourse.rooms[teacherKey]) {
                      updateField('room', selectedCourse.rooms[teacherKey])
                    }
                  }
                }}
                disabled={hasSpecialTag}
              >
                <SelectTrigger className={hasSpecialTag ? 'opacity-50 cursor-not-allowed' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Jour *</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => updateField('day', value as DayName)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {DAY_LABELS[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time slot and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeSlot">Créneau *</Label>
              <Select
                value={formData.timeSlot.toString()}
                onValueChange={(value) => updateField('timeSlot', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id.toString()}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField('status', value as SessionStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessionStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Room and Teacher */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Salle</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => updateField('room', e.target.value)}
                placeholder="104"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Enseignant</Label>
              <Input
                id="teacher"
                value={formData.teacher}
                onChange={(e) => updateField('teacher', e.target.value)}
                placeholder="Dr. Ahmed"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.tags?.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags personnalisés</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Autre tag..."
              />
              <Button type="button" variant="outline" onClick={addCustomTag}>
                Ajouter
              </Button>
            </div>
            {formData.tags && formData.tags.filter((t) => !commonTags.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags
                  .filter((t) => !commonTags.includes(t))
                  .map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
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
