import { useState, useEffect } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  department: 'PERMANENT',
  email: '',
  courses: [],
}

export function TeacherForm({ teacher, isOpen, onClose, onSave, mode }: TeacherFormProps) {
  const [formData, setFormData] = useState<Teacher>(teacher || { ...defaultTeacher, id: generateId('t') })

  useEffect(() => {
    setFormData(teacher || { ...defaultTeacher, id: generateId('t') })
  }, [teacher, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const updateField = <K extends keyof Teacher>(field: K, value: Teacher[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="ahmed@esp.mr"
            />
          </div>

          <div className="space-y-2">
            <Label>Statut *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => updateField('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERMANENT">Permanent</SelectItem>
                <SelectItem value="VACATAIRE">Vacataire</SelectItem>
              </SelectContent>
            </Select>
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
