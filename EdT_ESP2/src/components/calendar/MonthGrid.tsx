import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isWithinInterval,
  isSameDay,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CalendarEvent {
  id: string
  date: string
  endDate?: string
  title: string
  type: 'course_start' | 'holiday' | 'vacation' | 'exam' | 'soutenance' | 'religious'
  description: string
}

interface MonthGridProps {
  month: Date
  events: CalendarEvent[]
  selectedEvent?: CalendarEvent | null
  onEventClick?: (event: CalendarEvent) => void
}

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  course_start: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  holiday: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  vacation: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  exam: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  soutenance: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
  religious: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' },
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function MonthGrid({ month, events, selectedEvent, onEventClick }: MonthGridProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = parseISO(event.date)
      if (event.endDate) {
        const eventEnd = parseISO(event.endDate)
        return isWithinInterval(day, { start: eventStart, end: eventEnd })
      }
      return isSameDay(day, eventStart)
    })
  }

  const isSelectedEvent = (event: CalendarEvent) => {
    return selectedEvent?.id === event.id
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Month header */}
      <div className="bg-muted/50 px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </h3>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-1 py-1.5 text-[10px] font-medium text-muted-foreground text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, month)
          const hasEvents = dayEvents.length > 0
          const primaryEvent = dayEvents[0]

          return (
            <Tooltip key={day.toISOString()}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'relative h-8 text-xs transition-colors border-t border-r border-border',
                    'hover:bg-muted/50',
                    !isCurrentMonth && 'opacity-30',
                    index % 7 === 0 && 'border-l-0',
                    hasEvents && primaryEvent && EVENT_COLORS[primaryEvent.type]?.bg,
                    primaryEvent && isSelectedEvent(primaryEvent) && 'ring-2 ring-inset ring-primary'
                  )}
                  onClick={() => primaryEvent && onEventClick?.(primaryEvent)}
                  disabled={!hasEvents}
                >
                  <span
                    className={cn(
                      'absolute inset-0 flex items-center justify-center',
                      hasEvents && primaryEvent && EVENT_COLORS[primaryEvent.type]?.text,
                      !hasEvents && 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 1 && (
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] text-muted-foreground">
                      +{dayEvents.length - 1}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {hasEvents && (
                <TooltipContent side="top" className="max-w-[200px] bg-slate-900 border-slate-700">
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="text-xs">
                        <div className="font-medium text-white">{event.title}</div>
                        <div className="text-slate-300">{event.description}</div>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
