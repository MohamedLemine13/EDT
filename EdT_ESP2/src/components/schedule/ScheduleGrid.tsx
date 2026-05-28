import { ScheduleCell } from './ScheduleCell'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import type { Session, Course, WeekSchedule, DayName, TimeSlot } from '@/types'
import { DAY_LABELS } from '@/types'

interface ScheduleGridProps {
  schedule: WeekSchedule
  courses: Course[]
  onSessionClick: (session: Session) => void
  onEmptyCellClick?: (day: string, timeSlot: number) => void
}

// Get session for a specific day and time slot
function getSession(
  sessions: Session[],
  day: DayName,
  slotId: number
): Session | null {
  return sessions.find((s) => s.day === day && s.timeSlot === slotId) || null
}

// Get course by code
function getCourse(courses: Course[], code: string): Course | undefined {
  return courses.find((c) => c.code === code)
}

export function ScheduleGrid({ schedule, courses, onSessionClick, onEmptyCellClick }: ScheduleGridProps) {
  const { timeSlots, days, sessions } = schedule

  return (
    <div className="w-full">
      {/* Desktop view - full grid */}
      <div className="hidden md:block">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Header row with time slots */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1">
              <div className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                Jour / Heure
              </div>
              {timeSlots.map((slot: TimeSlot) => (
                <div
                  key={slot.id}
                  className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground bg-muted/30 rounded-lg"
                >
                  {slot.label}
                </div>
              ))}
            </div>

            {/* Day rows */}
            {days.map((day: DayName) => (
              <div key={day} className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 mb-1 auto-rows-fr">
                {/* Day label */}
                <div className="min-h-[68px] sm:min-h-[72px] flex items-center justify-center text-sm font-medium text-foreground bg-muted/30 rounded-lg">
                  {DAY_LABELS[day]}
                </div>

                {/* Time slot cells */}
                {timeSlots.map((slot: TimeSlot) => {
                  const session = getSession(sessions, day, slot.id)
                  const course = session ? getCourse(courses, session.courseCode) : undefined

                  return (
                    <ScheduleCell
                      key={`${day}-${slot.id}`}
                      session={session}
                      course={course}
                      onClick={onSessionClick}
                      onEmptyClick={onEmptyCellClick ? () => onEmptyCellClick(day, slot.id) : undefined}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Mobile view - card list by day */}
      <div className="md:hidden space-y-4">
        {days.map((day: DayName) => {
          const daySessions = sessions.filter((s: Session) => s.day === day)

          return (
            <div key={day} className="space-y-2">
              {/* Day header */}
              <div className="flex items-center gap-2 py-2 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  {DAY_LABELS[day]}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({daySessions.length} séance{daySessions.length !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Sessions for this day */}
              {daySessions.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Pas de cours
                </div>
              ) : (
                <div className="space-y-2">
                  {timeSlots.map((slot: TimeSlot) => {
                    const session = getSession(sessions, day, slot.id)
                    if (!session) return null

                    const course = getCourse(courses, session.courseCode)

                    return (
                      <div key={`${day}-${slot.id}`} className="flex gap-2">
                        {/* Time label */}
                        <div className="w-20 shrink-0 text-xs text-muted-foreground py-2">
                          {slot.label}
                        </div>
                        {/* Session cell */}
                        <div className="flex-1">
                          <ScheduleCell
                            session={session}
                            course={course}
                            onClick={onSessionClick}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
