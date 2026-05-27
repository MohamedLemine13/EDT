import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAY_CODES = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
const SLOTS = ['P1', 'P2', 'P3', 'P4', 'P5']

interface MiniEdtGridProps {
  editingSlots: { id: string, oldStart: string, oldEnd: string, newStart: string, newEnd: string, newType: string }[]
  setEditingSlots: (slots: { id: string, oldStart: string, oldEnd: string, newStart: string, newEnd: string, newType: string }[]) => void
  creneaux: any[]
  setCreneaux: (creneaux: any[]) => void
}

export function MiniEdtGrid({ editingSlots, setEditingSlots, creneaux, setCreneaux }: MiniEdtGridProps) {
  // Build lookup from day/slot to creneau
  const cellMap = useMemo(() => {
    const map = new Map<string, any>()
    creneaux.forEach(c => {
      // Find the slot index based on editingSlots or raw time
      let sIndex = -1
      // Try to match by editingSlots to see which period it belongs to
      for (let i = 0; i < editingSlots.length; i++) {
        if (c.heureDebut.startsWith(editingSlots[i].oldStart.substring(0, 5))) {
          sIndex = i
          break
        }
      }
      const dIndex = DAY_CODES.indexOf(c.jour)
      if (dIndex >= 0 && sIndex >= 0) {
        map.set(`${dIndex}-${sIndex}`, c)
      }
    })
    return map
  }, [creneaux, editingSlots])

  const getCellColor = (type: string) => {
    if (type === 'HE' || type === 'ST') return 'bg-blue-600 hover:bg-blue-500'
    if (type === 'DEP') return 'bg-green-700 hover:bg-green-600'
    return 'bg-red-600 hover:bg-red-500'
  }

  const handleTypeChange = (dIndex: number, sIndex: number, newType: string) => {
    const key = `${dIndex}-${sIndex}`
    const creneau = cellMap.get(key)
    if (creneau) {
      // Update local state directly
      const updatedCreneaux = creneaux.map(c => 
        c.id === creneau.id ? { ...c, typeCreneau: newType, _dirty: true } : c
      )
      setCreneaux(updatedCreneaux)
    }
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[500px]">
        {/* Header Row */}
        <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-1 mb-1">
          <div className="text-xs font-medium text-muted-foreground p-1 text-center">Horaires</div>
          {DAYS.map(day => (
            <div key={day} className="bg-muted rounded p-1 text-xs font-semibold text-center">{day.substring(0, 3)}</div>
          ))}
        </div>

        {/* Grid Body */}
        {SLOTS.map((slot, sIndex) => {
          const slotEdit = editingSlots[sIndex]
          if (!slotEdit) return null

          return (
            <div key={slot} className="grid grid-cols-[100px_repeat(6,1fr)] gap-1 mb-1">
              {/* Time Label (Editable) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="bg-slate-100 dark:bg-slate-800 rounded p-1 flex flex-col items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer">
                    <span className="text-[10px] font-bold">{slot}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {slotEdit.newStart.substring(0, 5)} - {slotEdit.newEnd.substring(0, 5)}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 p-3" align="start">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Modifier {slot}</h4>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        value={slotEdit.newStart.substring(0, 5)} 
                        onChange={e => {
                          const ns = [...editingSlots]
                          ns[sIndex].newStart = e.target.value
                          setEditingSlots(ns)
                        }}
                        className="h-8 text-xs"
                      />
                      <span>-</span>
                      <Input 
                        type="time" 
                        value={slotEdit.newEnd.substring(0, 5)} 
                        onChange={e => {
                          const ns = [...editingSlots]
                          ns[sIndex].newEnd = e.target.value
                          setEditingSlots(ns)
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Appliqué aux 6 jours</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Day Cells */}
              {DAYS.map((day, dIndex) => {
                const creneau = cellMap.get(`${dIndex}-${sIndex}`)
                const type = creneau?.typeCreneau || 'AUTRE'
                
                return (
                  <DropdownMenu key={`${day}-${slot}`}>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "h-full w-full rounded text-[10px] font-bold text-white shadow-sm transition-all cursor-pointer border border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-offset-background",
                        getCellColor(type),
                        creneau?._dirty ? "ring-1 ring-yellow-400" : ""
                      )}>
                        {type}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 p-1" align="center">
                      <div className="flex flex-col gap-1">
                        {['DEP', 'HE', 'ST', 'AUTRE'].map(t => (
                          <Button 
                            key={t}
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "justify-start text-xs h-7",
                              t === type ? "bg-muted font-bold" : ""
                            )}
                            onClick={() => handleTypeChange(dIndex, sIndex, t)}
                          >
                            <div className={cn("w-2 h-2 rounded-full mr-2", getCellColor(t).split(' ')[0])} />
                            {t}
                          </Button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
