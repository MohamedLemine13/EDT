import { useState, useMemo, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MonthGrid, EventList } from '@/components/calendar'
import { eachMonthOfInterval } from 'date-fns'
import { CalendarDays, List, Plus, Loader2 } from 'lucide-react'
import { calendrierService } from '@/services'
import type { EvenementCalendrierDto, CreateEvenementCalendrierDto } from '@/types'

// Map backend event types to the CalendarEvent format expected by MonthGrid/EventList
interface CalendarEvent {
  id: string
  date: string
  endDate?: string
  title: string
  type: 'course_start' | 'holiday' | 'vacation' | 'exam' | 'soutenance' | 'religious'
  description: string
}

const BACKEND_TYPE_MAP: Record<string, CalendarEvent['type']> = {
  RENTREE: 'course_start',
  FERIE: 'holiday',
  VACANCES: 'vacation',
  EXAMEN: 'exam',
  SOUTENANCE: 'soutenance',
  EVENEMENT: 'religious',
  AUTRE: 'religious',
}

const FRONTEND_TYPE_MAP: Record<string, CreateEvenementCalendrierDto['type']> = {
  course_start: 'RENTREE',
  holiday: 'FERIE',
  vacation: 'VACANCES',
  exam: 'EXAMEN',
  soutenance: 'SOUTENANCE',
  religious: 'EVENEMENT',
}

function toCalendarEvent(e: EvenementCalendrierDto): CalendarEvent {
  return {
    id: String(e.id),
    date: e.dateDebut,
    endDate: e.dateFin,
    title: e.titre,
    type: BACKEND_TYPE_MAP[e.type] || 'religious',
    description: e.description || '',
  }
}

export default function CalendrierPage() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [mobileTab, setMobileTab] = useState<string>('calendar')
  const [isEventFormOpen, setIsEventFormOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch events from API
  useEffect(() => {
    setLoading(true)
    calendrierService.getAll()
      .then((data) => setEvents(data.map(toCalendarEvent)))
      .catch((err) => console.error('Calendar events error:', err))
      .finally(() => setLoading(false))
  }, [])

  // Generate 12 months for academic year (Oct 2025 - Sep 2026)
  const months = useMemo(() => {
    return eachMonthOfInterval({
      start: new Date(2025, 9, 1), // October 2025
      end: new Date(2026, 8, 1),   // September 2026
    })
  }, [])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(selectedEvent?.id === event.id ? null : event)
    if (mobileTab === 'events') {
      setMobileTab('calendar')
    }
  }

  // Scroll to month when event is selected
  useEffect(() => {
    if (selectedEvent) {
      const eventDate = new Date(selectedEvent.date)
      const monthId = `month-${eventDate.getFullYear()}-${eventDate.getMonth()}`
      const element = document.getElementById(monthId)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedEvent])

  // Calendar grid component
  const CalendarGrid = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {months.map((month) => (
        <div
          key={month.toISOString()}
          id={`month-${month.getFullYear()}-${month.getMonth()}`}
        >
          <MonthGrid
            month={month}
            events={events}
            selectedEvent={selectedEvent}
            onEventClick={handleEventClick}
          />
        </div>
      ))}
    </div>
  )

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Calendrier Académique</h2>
            <p className="text-sm text-muted-foreground">
              {events.length} événements
            </p>
          </div>
          <Button size="sm" onClick={() => setIsEventFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvel événement
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Chargement du calendrier...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Mobile: Tabs interface */}
            <div className="lg:hidden">
              <Tabs value={mobileTab} onValueChange={setMobileTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Calendrier
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Événements
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="mt-0">
                  <CalendarGrid />
                </TabsContent>
                <TabsContent value="events" className="mt-0">
                  <EventList
                    events={events}
                    selectedEvent={selectedEvent}
                    onEventClick={handleEventClick}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop: Side by side layout */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_340px] gap-4">
              <CalendarGrid />
              <div className="sticky top-32 self-start max-h-[calc(100vh-160px)]">
                <EventList
                  events={events}
                  selectedEvent={selectedEvent}
                  onEventClick={handleEventClick}
                />
              </div>
            </div>
          </>
        )}

        {/* Event Form Dialog — creates via API */}
        <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvel événement</DialogTitle>
              <DialogDescription>
                Ajoutez un événement au calendrier académique.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const frontendType = formData.get('type') as CalendarEvent['type']
                const dto: CreateEvenementCalendrierDto = {
                  titre: formData.get('title') as string,
                  dateDebut: formData.get('date') as string,
                  description: formData.get('description') as string || undefined,
                  type: FRONTEND_TYPE_MAP[frontendType] || 'AUTRE',
                }
                try {
                  const created = await calendrierService.create(dto)
                  setEvents([...events, toCalendarEvent(created)])
                } catch (err) {
                  console.error('Create event error:', err)
                }
                setIsEventFormOpen(false)
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Titre</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Ex: Rentrée universitaire"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">Type</label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="course_start">Début des cours</option>
                  <option value="holiday">Jour férié</option>
                  <option value="vacation">Vacances</option>
                  <option value="exam">Examen</option>
                  <option value="soutenance">Soutenance</option>
                  <option value="religious">Fête religieuse</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Description de l'événement..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEventFormOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
