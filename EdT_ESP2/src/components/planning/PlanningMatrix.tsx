import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AddEntryDialog } from './AddEntryDialog'

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
  schedule: PlanningEntry[]
  courses: SimpleCourse[]
  weeks: number
  examWeeks: number[]
  vacationWeeks: number[]
  onWeekClick?: (week: number) => void
  highlightedCourse?: string | null
  onCourseHover?: (code: string | null) => void
  onAddEntry?: (entry: PlanningEntry) => void
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const SLOTS = ['P1', 'P2', 'P3', 'P4', 'P5']
const SLOT_TIMES = ['8h00', '9h45', '11h30', '15h10', '17h00']

export function PlanningMatrix({
  schedule,
  courses,
  weeks,
  examWeeks,
  vacationWeeks,
  onWeekClick,
  highlightedCourse,
  onCourseHover,
  onAddEntry,
}: PlanningMatrixProps) {
  // Dialog state for adding entries
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    week: number
    dayIndex: number
    slotIndex: number
    day: string
    slot: string
  } | null>(null)
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

  // Plan page specific colors: CM=blue, TD/TP=green, exam=red
  const getCellStyle = (entry: PlanningEntry | undefined, week: number) => {
    if (vacationWeeks.includes(week)) {
      return { backgroundColor: '#37474F', opacity: 0.3 }
    }
    if (!entry) {
      return undefined  // No inline style for empty cells - let CSS classes handle it
    }
    if (entry.type === 'exam') {
      return { backgroundColor: '#C62828' }  // Red for exams
    }
    if (entry.type === 'special') {
      return { backgroundColor: '#5D4037' }
    }
    if (entry.type === 'CM') {
      return { backgroundColor: '#1565C0' }  // Blue for CM
    }
    if (entry.type === 'TD' || entry.type === 'TP') {
      return { backgroundColor: '#2E7D32' }  // Green for TD/TP
    }
    return { backgroundColor: '#37474F' }
  }

  const isHighlighted = (entry: PlanningEntry | undefined) => {
    if (!highlightedCourse || !entry) return false
    return entry.code === highlightedCourse
  }

  const handleCellClick = (week: number, dayIndex: number, slotIndex: number, hasEntry: boolean) => {
    if (hasEntry) {
      onWeekClick?.(week)
    } else if (vacationWeeks.includes(week)) {
      // Don't allow editing vacation weeks
      return
    } else {
      // Open dialog to add entry
      setSelectedCell({
        week,
        dayIndex,
        slotIndex,
        day: DAYS[dayIndex],
        slot: SLOTS[slotIndex],
      })
      setDialogOpen(true)
    }
  }

  const handleAddEntry = (code: string, type: string) => {
    if (selectedCell && onAddEntry) {
      onAddEntry({
        week: selectedCell.week,
        day: selectedCell.dayIndex,
        slot: selectedCell.slotIndex,
        code,
        type,
      })
    }
    setDialogOpen(false)
    setSelectedCell(null)
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
                  {/* Row label - sticky on horizontal scroll */}
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
                    const style = getCellStyle(entry, week)
                    const highlighted = isHighlighted(entry)
                    const title = entry ? courseTitles.get(entry.code) : undefined

                    return (
                      <Tooltip key={week}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleCellClick(week, dayIndex, slotIndex, !!entry)}
                            onMouseEnter={() =>
                              entry && entry.type !== 'exam' && entry.type !== 'special'
                                ? onCourseHover?.(entry.code)
                                : onCourseHover?.(null)
                            }
                            onMouseLeave={() => onCourseHover?.(null)}
                            className={cn(
                              'h-5 w-full text-[10px] font-medium text-white/90 transition-all',
                              'hover:brightness-110 cursor-pointer',
                              highlighted && 'ring-2 ring-white ring-offset-1 ring-offset-background',
                              !entry && !vacationWeeks.includes(week) && [
                                'bg-slate-300 dark:bg-slate-600/40 rounded-sm mx-0.5'
                              ]
                            )}
                            style={style}
                          >
                            {entry && (
                              <span className="text-[9px] font-medium">{entry.code}</span>
                            )}
                          </button>
                        </TooltipTrigger>
                        {entry && (
                          <TooltipContent side="top" className="text-xs bg-slate-900 border-slate-700">
                            <div className="font-medium text-white">{entry.code}</div>
                            {title && <div className="text-slate-300">{title}</div>}
                            <div className="text-slate-400">
                              {day} {slot} - Semaine {week}
                            </div>
                          </TooltipContent>
                        )}
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

      <AddEntryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddEntry}
        courses={courses}
        week={selectedCell?.week ?? 0}
        day={selectedCell?.day ?? ''}
        slot={selectedCell?.slot ?? ''}
      />
    </TooltipProvider>
  )
}
