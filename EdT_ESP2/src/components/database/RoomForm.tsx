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
import type { Room } from '@/types'
import { generateId } from '@/hooks/useDataStore'

interface RoomFormProps {
  room?: Room | null
  isOpen: boolean
  onClose: () => void
  onSave: (room: Room) => void
  mode: 'create' | 'edit'
}

const defaultRoom: Room = {
  id: '',
  code: '',
  name: '',
  capacity: 30,
  equipment: [],
  building: 'Bâtiment principal',
}

const commonEquipment = ['Projecteur', 'Tableau blanc', 'Ordinateurs', 'Climatisation', 'WiFi', 'Audio']

export function RoomForm({ room, isOpen, onClose, onSave, mode }: RoomFormProps) {
  const [formData, setFormData] = useState<Room>(room || { ...defaultRoom, id: generateId('r') })
  const [newEquipment, setNewEquipment] = useState('')

  // Reset form when room changes
  useEffect(() => {
    setFormData(room || { ...defaultRoom, id: generateId('r') })
    setNewEquipment('')
  }, [room, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const updateField = <K extends keyof Room>(field: K, value: Room[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleEquipment = (eq: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }))
  }

  const addCustomEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()],
      }))
      setNewEquipment('')
    }
  }

  const removeEquipment = (eq: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e !== eq),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomEquipment()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Ajouter une salle' : 'Modifier la salle'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations de la nouvelle salle.'
              : 'Modifiez les informations de la salle.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value)}
                placeholder="104"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={500}
                value={formData.capacity}
                onChange={(e) => updateField('capacity', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Salle de cours 104"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building">Bâtiment</Label>
            <Input
              id="building"
              value={formData.building}
              onChange={(e) => updateField('building', e.target.value)}
              placeholder="Bâtiment principal"
            />
          </div>

          <div className="space-y-2">
            <Label>Équipements courants</Label>
            <div className="flex flex-wrap gap-2">
              {commonEquipment.map((eq) => (
                <Badge
                  key={eq}
                  variant={formData.equipment.includes(eq) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleEquipment(eq)}
                >
                  {eq}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Équipements personnalisés</Label>
            <div className="flex gap-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Autre équipement..."
              />
              <Button type="button" variant="outline" onClick={addCustomEquipment}>
                Ajouter
              </Button>
            </div>
            {formData.equipment.filter((eq) => !commonEquipment.includes(eq)).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.equipment
                  .filter((eq) => !commonEquipment.includes(eq))
                  .map((eq) => (
                    <Badge key={eq} variant="secondary" className="gap-1">
                      {eq}
                      <button
                        type="button"
                        onClick={() => removeEquipment(eq)}
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
