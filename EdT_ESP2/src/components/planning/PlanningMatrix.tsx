import { useState, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BulkTypeToolbar } from './BulkTypeToolbar'

interface PlanningEntry {
  week: number
  day: number
  slot: number
  code: string
  type: string
}

interface SimpleCourse {
  code: string
  title: string
  color: string
}

interface PlanningMatrixProps {
  creneaux: any[]
  schedule: PlanningEntry[]
  courses: SimpleCourse[]
  weeks: number
  examWeeks: number[]
  vacationWeeks: number[]
  onWeekClick?: (week: number) => void
  highlightedCourse?: string | null
  onCourseHover?: (code: string | null) => void
  onAddEntry?: (entry: PlanningEntry) => void
  onBulkSelect?: (cells: {week: number, dayIndex: number, slotIndex: number}[], typeCreneau: string) => void
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const SLOTS = ['P1', 'P2', 'P3', 'P4', 'P5']
const SLOT_TIMES = ['08h00', '09h45', '11h30', '15h10', '17h00']

export function PlanningMatrix({
  schedule,
  courses,
  weeks,
  examWeeks,
  vacationWeeks,
  onWeekClick,
  highlightedCourse,
  onCourseHover,
  onBulkSelect,
  creneaux = [],
}: PlanningMatrixProps) {
  // Drag selection state
  useEffect(() => {}, [])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{week: number, dayIndex: number, slotIndex: number} | null>(null)
  const [dragEnd, setDragEnd] = useState<{week: number, dayIndex: number, slotIndex: number} | null>(null)
  
  // After-drag toolbar state
  const [selectedCells, setSelectedCells] = useState<{week: number, dayIndex: number, slotIndex: number}[]>([])
  const [showToolbar, setShowToolbar] = useState(false)

  const handleMouseDown = useCallback((week: number, dayIndex: number, slotIndex: number) => {
    // Start a new drag — clear any previous selection
    setShowToolbar(false)
    setSelectedCells([])
    setIsDragging(true)
    setDragStart({week, dayIndex, slotIndex})
    setDragEnd({week, dayIndex, slotIndex})
  }, [])

  const handleMouseEnter = useCallback((week: number) => {
    if (isDragging && dragStart) {
      // HORIZONTAL ONLY: lock dayIndex and slotIndex to the drag start
      setDragEnd({week, dayIndex: dragStart.dayIndex, slotIndex: dragStart.slotIndex})
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragEnd) {
      setIsDragging(false)
      
      const minWeek = Math.min(dragStart.week, dragEnd.week)
      const maxWeek = Math.max(dragStart.week, dragEnd.week)
      // Horizontal only — same day+slot
      const dayIdx = dragStart.dayIndex
      const slotIdx = dragStart.slotIndex
      
      const cells: {week: number, dayIndex: number, slotIndex: number}[] = []
      for (let w = minWeek; w <= maxWeek; w++) {
        cells.push({week: w, dayIndex: dayIdx, slotIndex: slotIdx})
      }
      
      if (cells.length === 1) {
        // Single cell click → normal behavior
        const entry = scheduleMap.get(`${dragStart.week}-${dragStart.dayIndex}-${dragStart.slotIndex}`)
        if (entry) {
          onWeekClick?.(dragStart.week)
        } else if (!vacationWeeks.includes(dragStart.week)) {
          // Single empty cell click — could open add dialog via parent
          // For now, still show the toolbar so user can set créneau type
          setSelectedCells(cells)
          setShowToolbar(true)
        }
      } else {
        // Multi-cell drag → show toolbar
        setSelectedCells(cells)
        setShowToolbar(true)
      }
      
      setDragStart(null)
      setDragEnd(null)
    }
  }, [isDragging, dragStart, dragEnd, vacationWeeks, onWeekClick])

  const handleToolbarSelect = useCallback((typeCreneau: string) => {
    if (onBulkSelect && selectedCells.length > 0) {
      onBulkSelect(selectedCells, typeCreneau)
    }
    setShowToolbar(false)
    setSelectedCells([])
  }, [onBulkSelect, selectedCells])

  const handleToolbarCancel = useCallback(() => {
    setShowToolbar(false)
    setSelectedCells([])
  }, [])

  // Build lookup for schedule entries
  const scheduleMap = useMemo(() => {
    const map = new Map<string, PlanningEntry>()
    schedule.forEach((entry) => {
      const key = `${entry.week}-${entry.day}-${entry.slot}`
      map.set(key, entry)
    })
    return map
  }, [schedule])

  // Build course title lookup
  const courseTitles = useMemo(() => {
    const map = new Map<string, string>()
    courses.forEach((c) => map.set(c.code, c.title))
    return map
  }, [courses])

  // Build typeCreneau lookup for cells
  const slotTypeMap = useMemo(() => {
    const map = new Map<string, string>()
    const dayNames = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
    
    // Map backend slot times to our indexes
    const slotTimesMap: Record<string, number> = {}
    SLOT_TIMES.forEach((t, i) => {
      slotTimesMap[t] = i
      slotTimesMap[t.replace('h', ':') + ':00'] = i
      slotTimesMap[t.replace('h', ':')] = i
    })

    creneaux.forEach((c: any) => {
      const dIndex = dayNames.indexOf(c.jour)
      const sTime = c.heureDebut.substring(0, 5)
      let sIndex = -1
      for (const key in slotTimesMap) {
        if (key.startsWith(sTime)) {
          sIndex = slotTimesMap[key]
          break
        }
      }
      if (dIndex >= 0 && sIndex >= 0) {
        map.set(`${dIndex}-${sIndex}`, c.typeCreneau || 'AUTRE')
      }
    })
    return map
  }, [creneaux])

  // Colors based on typeCreneau: HE/ST=blue, DEP=green, AUTRE=red
  const getCellStyle = (week: number, dayIndex: number, slotIndex: number) => {
    if (vacationWeeks.includes(week)) {
      return { backgroundColor: '#37474F', opacity: 0.3 }
    }
    
    const typeCreneau = slotTypeMap.get(`${dayIndex}-${slotIndex}`) || 'AUTRE'
    
    if (typeCreneau === 'HE' || typeCreneau === 'ST') {
      return { backgroundColor: '#1565C0' }
    }
    if (typeCreneau === 'DEP') {
      return { backgroundColor: '#2E7D32' }
    }
    
    return { backgroundColor: '#C62828' }
  }

  const isHighlighted = (entry: PlanningEntry | undefined) => {
    if (!highlightedCourse || !entry) return false
    return entry.code === highlightedCourse
  }

  // Check if a cell is in the current selection (either during drag or after drag)
  const isCellSelected = (week: number, dayIndex: number, slotIndex: number) => {
    // During active drag
    if (isDragging && dragStart && dragEnd) {
      const minWeek = Math.min(dragStart.week, dragEnd.week)
      const maxWeek = Math.max(dragStart.week, dragEnd.week)
      return dayIndex === dragStart.dayIndex && 
             slotIndex === dragStart.slotIndex &&
             week >= minWeek && week <= maxWeek
    }
    // After drag (toolbar showing)
    if (showToolbar && selectedCells.length > 0) {
      return selectedCells.some(c => c.week === week && c.dayIndex === dayIndex && c.slotIndex === slotIndex)
    }
    return false
  }

  return (
    <TooltipProvider delayDuration={100}>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-border">
        <div className="min-w-[900px] p-1">
          {/* Header row with week numbers */}
          <div className="grid grid-cols-[80px_repeat(18,minmax(40px,1fr))] gap-1.5 pb-1.5">
            <div className="bg-card p-2 text-xs font-medium text-muted-foreground sticky left-0 z-10">
              Période
            </div>
            {Array.from({ length: weeks }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                onClick={() => onWeekClick?.(week)}
                className={cn(
                  'bg-card p-2 text-xs font-medium text-center transition-colors',
                  'hover:bg-muted cursor-pointer',
                  examWeeks.includes(week) && 'text-cell-exam font-bold',
                  vacationWeeks.includes(week) && 'text-muted-foreground italic'
                )}
              >
                S{week}
              </button>
            ))}
          </div>

          {/* Grid body - 30 rows (6 days × 5 slots) */}
          {DAYS.map((day, dayIndex) => (
            <div key={day}>
              {SLOTS.map((slot, slotIndex) => (
                <div
                  key={`${day}-${slot}`}
                  className="grid grid-cols-[80px_repeat(18,minmax(40px,1fr))] gap-1.5 py-0.5"
                >
                  {/* Row label */}
                  <div className="bg-card p-1.5 text-xs flex items-center gap-1 sticky left-0 z-10">
                    {slotIndex === 0 && (
                      <span className="font-medium text-foreground w-8">{day}</span>
                    )}
                    {slotIndex !== 0 && <span className="w-8" />}
                    <span className="text-muted-foreground">{slot}</span>
                    <span className="text-muted-foreground/50 text-[10px] hidden sm:inline">
                      {SLOT_TIMES[slotIndex]}
                    </span>
                  </div>

                  {/* Week cells */}
                  {Array.from({ length: weeks }, (_, i) => i + 1).map((week) => {
                    const entry = scheduleMap.get(`${week}-${dayIndex}-${slotIndex}`)
                    const style = getCellStyle(week, dayIndex, slotIndex)
                    const highlighted = isHighlighted(entry)
                    const title = entry ? courseTitles.get(entry.code) : undefined
                    const typeCreneau = slotTypeMap.get(`${dayIndex}-${slotIndex}`) || 'AUTRE'
                    const selected = isCellSelected(week, dayIndex, slotIndex)

                    return (
                      <Tooltip key={week}>
                        <TooltipTrigger asChild>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleMouseDown(week, dayIndex, slotIndex)
                            }}
                            onMouseEnter={() => {
                              handleMouseEnter(week)
                              if (entry && entry.type !== 'exam' && entry.type !== 'special') {
                                onCourseHover?.(entry.code)
                              } else {
                                onCourseHover?.(null)
                              }
                            }}
                            onMouseLeave={() => onCourseHover?.(null)}
                            onMouseUp={handleMouseUp}
                            className={cn(
                              'h-5 w-full text-[10px] font-medium text-white/90 transition-all cursor-pointer select-none rounded-sm',
                              'hover:brightness-125',
                              highlighted && 'ring-2 ring-white ring-offset-1 ring-offset-background',
                              selected && 'ring-2 ring-yellow-400 brightness-150 z-20 shadow-lg shadow-yellow-400/30',
                            )}
                            style={style}
                          >
                            <span className="text-[9px] font-medium opacity-90 drop-shadow-md">
                              {entry ? entry.code : typeCreneau.substring(0, 1)}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs bg-slate-900 border-slate-700">
                          {entry ? (
                            <>
                              <div className="font-medium text-white">{entry.code}</div>
                              {title && <div className="text-slate-300">{title}</div>}
                              <div className="text-slate-400">
                                {day} {slot} - Semaine {week}
                              </div>
                              <div className="text-slate-500 mt-1">Séance: {entry.type} • Créneau: {typeCreneau}</div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-white">Créneau {typeCreneau}</div>
                              <div className="text-slate-400">
                                {day} {slot} - Semaine {week}
                              </div>
                              <div className="text-slate-500 mt-1">Cellule vide</div>
                            </>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Global mouseup handler to catch drags that end outside a cell */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-10 cursor-grabbing" 
          onMouseUp={handleMouseUp} 
          onMouseMove={(e) => e.preventDefault()}
        />
      )}

      {/* Floating toolbar after selection */}
      {showToolbar && selectedCells.length > 0 && (
        <div className="flex justify-center mt-3">
          <BulkTypeToolbar
            cellCount={selectedCells.length}
            onSelectType={handleToolbarSelect}
            onCancel={handleToolbarCancel}
          />
        </div>
      )}
    </TooltipProvider>
  )
}
