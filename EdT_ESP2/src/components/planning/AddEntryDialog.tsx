import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SimpleCourse {
  code: string
  title: string
  color: string
}

interface AddEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (code: string, type: string) => void
  courses: SimpleCourse[]
  week: number
  day: string
  slot: string
}

const SESSION_TYPES = [
  { value: 'CM', label: 'CM (Cours Magistral)', color: '#1565C0' },
  { value: 'TD', label: 'TD (Travaux Dirigés)', color: '#2E7D32' },
  { value: 'TP', label: 'TP (Travaux Pratiques)', color: '#2E7D32' },
  { value: 'exam', label: 'Examen', color: '#C62828' },
]

export function AddEntryDialog({
  isOpen,
  onClose,
  onAdd,
  courses,
  week,
  day,
  slot,
}: AddEntryDialogProps) {
  const [code, setCode] = useState('')
  const [type, setType] = useState('CM')
  const [customCode, setCustomCode] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalCode = isCustom ? customCode.toUpperCase() : code
    if (finalCode && type) {
      onAdd(finalCode, type)
      reset()
    }
  }

  const reset = () => {
    setCode('')
    setType('CM')
    setCustomCode('')
    setIsCustom(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajouter une séance</DialogTitle>
          <DialogDescription>
            Semaine {week} • {day} • {slot}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type de séance</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: t.color }}
                      />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Code de la matière</Label>
            {!isCustom ? (
              <Select value={code} onValueChange={(val) => {
                if (val === 'custom') {
                  setIsCustom(true)
                  setCode('')
                } else {
                  setCode(val)
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner ou saisir" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground">- {c.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">
                    <span className="text-muted-foreground italic">+ Saisir un code personnalisé</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Ex: IRT40"
                  className="uppercase"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCustom(false)
                    setCustomCode('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!isCustom ? !code : !customCode}>
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
