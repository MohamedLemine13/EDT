import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Calendar,
  GraduationCap,
  Sun,
  Plane,
  FileText,
  Award,
  Moon,
} from 'lucide-react'

interface CalendarEvent {
  id: string
  date: string
  endDate?: string
  title: string
  type: 'course_start' | 'holiday' | 'vacation' | 'exam' | 'soutenance' | 'religious'
  description: string
}

interface EventListProps {
  events: CalendarEvent[]
  selectedEvent?: CalendarEvent | null
  onEventClick?: (event: CalendarEvent) => void
}

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  course_start: { icon: Calendar, color: 'bg-green-500/20 text-green-400', label: 'Rentrée' },
  holiday: { icon: Sun, color: 'bg-yellow-500/20 text-yellow-400', label: 'Férié' },
  vacation: { icon: Plane, color: 'bg-blue-500/20 text-blue-400', label: 'Vacances' },
  exam: { icon: FileText, color: 'bg-red-500/20 text-red-400', label: 'Examens' },
  soutenance: { icon: Award, color: 'bg-purple-500/20 text-purple-400', label: 'Soutenance' },
  religious: { icon: Moon, color: 'bg-amber-500/20 text-amber-400', label: 'Religieux' },
}

function formatEventDate(date: string, endDate?: string): string {
  const start = parseISO(date)
  if (endDate) {
    const end = parseISO(endDate)
    return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`
  }
  return format(start, 'd MMMM yyyy', { locale: fr })
}

export function EventList({ events, selectedEvent, onEventClick }: EventListProps) {
  // Group events by type
  const groupedEvents = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {}
    events.forEach((event) => {
      if (!groups[event.type]) {
        groups[event.type] = []
      }
      groups[event.type].push(event)
    })
    return groups
  }, [events])

  // Sort events by date
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
  }, [events])

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GraduationCap className="h-4 w-4 shrink-0" />
          Événements de l'Année
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="px-4 pb-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border mb-3">
              {Object.entries(EVENT_CONFIG).map(([type, config]) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className={cn('text-[10px] gap-1 shrink-0', config.color)}
                >
                  <config.icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              ))}
            </div>

            {/* Events list */}
            <div className="space-y-2">
              {sortedEvents.map((event) => {
                const config = EVENT_CONFIG[event.type]
                const Icon = config.icon
                const isSelected = selectedEvent?.id === event.id

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-lg transition-all',
                      'hover:bg-muted/50',
                      isSelected
                        ? 'bg-muted/50 border-l-2 border-l-primary border-y border-r border-y-border border-r-border'
                        : 'border border-transparent hover:border-border'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn('p-1.5 rounded-md shrink-0', config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'text-sm font-medium leading-tight',
                          isSelected ? 'text-primary' : ''
                        )}>
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatEventDate(event.date, event.endDate)}
                        </div>
                        {isSelected && (
                          <p className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-border/50 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Summary by type */}
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Résumé par type
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(groupedEvents).map(([type, typeEvents]) => {
                  const config = EVENT_CONFIG[type]
                  return (
                    <div
                      key={type}
                      className={cn(
                        'p-1.5 rounded-lg text-center',
                        config.color.replace('text-', 'bg-').split(' ')[0]
                      )}
                    >
                      <div className="text-base font-bold">{typeEvents.length}</div>
                      <div className="text-[9px] text-muted-foreground leading-tight">{config.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
