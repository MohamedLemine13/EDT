import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Session, Course } from '@/types'
import { User, MapPin, Monitor, Plus, AlertTriangle, Award, Shield, Cpu } from 'lucide-react'

interface ScheduleCellProps {
  session: Session | null
  course?: Course
  onClick?: (session: Session) => void
  onEmptyClick?: () => void
}

// Determine if session is special (Club/Militaire)
function isSpecialSession(session: Session): boolean {
  return (
    session.courseCode === 'MILITARY' ||
    session.courseCode === 'CLUB' ||
    !!session.tags?.includes('Instruction militaire') ||
    !!session.tags?.includes('Club robotique') ||
    !!session.tags?.includes('Club')
  )
}

// Get cell background based on courseCode prefix
// IRT → green, HE → blue, Club/Militaire → white
function getCellBackground(session: Session): string {
  if (isSpecialSession(session)) {
    return 'bg-card border border-border'
  }
  if (session.courseCode.startsWith('IRT')) {
    return 'bg-cell-tp border border-cell-tp/30'
  }
  if (session.courseCode.startsWith('HE')) {
    return 'bg-cell-cm border border-cell-cm/30'
  }
  return 'bg-card border border-border'
}

// Badge base styles
const badgeContrastStyles = "text-[10px] px-1.5 py-0 h-4 gap-0.5 shadow-sm ring-1 ring-white/30"

// Get tag badges from session.tags (Exam→red, Devoir→orange, Militaire→purple, Club→orange, En ligne→green)
function getTagBadges(session: Session) {
  const badges: React.ReactNode[] = []

  if (session.tags?.includes('En ligne')) {
    badges.push(
      <Badge key="online" className={cn(badgeContrastStyles, "bg-emerald-500 text-white")}>
        <Monitor className="h-2.5 w-2.5" />
        <span className="hidden sm:inline">En ligne</span>
      </Badge>
    )
  }

  if (session.status === 'exam' || session.type === 'Exam' || session.tags?.includes('Examen')) {
    badges.push(
      <Badge key="exam" className={cn(badgeContrastStyles, "bg-red-600 text-white")}>
        <AlertTriangle className="h-2.5 w-2.5" />
        <span className="hidden sm:inline">Exam</span>
      </Badge>
    )
  }

  if (session.tags?.includes('Devoir')) {
    badges.push(
      <Badge key="devoir" className={cn(badgeContrastStyles, "bg-orange-500 text-white")}>
        <Award className="h-2.5 w-2.5" />
        <span className="hidden sm:inline">Devoir</span>
      </Badge>
    )
  }

  if (session.tags?.includes('Instruction militaire')) {
    badges.push(
      <Badge key="military" className={cn(badgeContrastStyles, "bg-purple-600 text-white")}>
        <Shield className="h-2.5 w-2.5" />
        <span className="hidden sm:inline">Militaire</span>
      </Badge>
    )
  }

  if (session.tags?.includes('Club robotique') || session.tags?.includes('Club')) {
    badges.push(
      <Badge key="club" className={cn(badgeContrastStyles, "bg-orange-500 text-white")}>
        <Cpu className="h-2.5 w-2.5" />
        <span className="hidden sm:inline">Club</span>
      </Badge>
    )
  }

  return badges.length > 0 ? badges : null
}

export function ScheduleCell({ session, course, onClick, onEmptyClick }: ScheduleCellProps) {
  // Empty cell - clickable for creating new session
  if (!session) {
    return (
      <button
        onClick={onEmptyClick}
        className="min-h-[68px] sm:min-h-[72px] h-full w-full bg-slate-800/30 rounded-lg border border-slate-700/30 border-dashed
          hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-200 group
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        <Plus className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mx-auto" />
      </button>
    )
  }

  const tagBadges = getTagBadges(session)
  const isSpecial = isSpecialSession(session)
  const cellBg = getCellBackground(session)
  // Text color: white on colored bg (IRT/HE), normal on white bg (special/other)
  const hasColoredBg = session.courseCode.startsWith('IRT') || session.courseCode.startsWith('HE')
  const textColor = hasColoredBg && !isSpecial ? 'text-white' : 'text-foreground'
  const subTextColor = hasColoredBg && !isSpecial ? 'text-white/80' : 'text-muted-foreground'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onClick?.(session)}
          className={cn(
            'min-h-[68px] sm:min-h-[72px] h-full w-full rounded-lg p-1.5 sm:p-2 text-left transition-all duration-200',
            'hover:brightness-110 hover:scale-[1.02] hover:shadow-lg',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            'cursor-pointer overflow-hidden',
            'flex flex-col',
            cellBg,
            textColor
          )}
        >
          {/* Header row: Code + Type tag + Tag badges */}
          <div className="flex items-start justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              {!session.tags?.some(t => ['Instruction militaire', 'Club robotique'].includes(t)) && (
                <span className="font-bold text-sm sm:text-base leading-tight">
                  {session.courseCode}
                </span>
              )}
              {!session.tags?.some(t => ['Examen', 'Devoir', 'Instruction militaire', 'Club robotique'].includes(t)) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold text-white/90 bg-white/20 shrink-0">
                  {session.type}
                </span>
              )}
            </div>
            {tagBadges && (
              <div className="flex items-center gap-1 shrink-0">
                {tagBadges}
              </div>
            )}
          </div>

          {/* Course title - flexible grow area */}
          <div className={cn("text-xs sm:text-sm leading-snug mt-1 flex-1 min-h-0 line-clamp-2", subTextColor)}>
            {session.tags?.some(t => ['Instruction militaire', 'Club robotique'].includes(t))
              ? session.tags.find(t => ['Instruction militaire', 'Club robotique'].includes(t))
              : (course?.title || session.courseCode)}
          </div>

          {/* Room and Teacher - always at bottom */}
          <div className={cn("flex flex-col gap-0.5 text-[11px] sm:text-xs mt-auto pt-1 shrink-0", subTextColor)}>
            {session.room && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{session.room}</span>
              </div>
            )}
            {session.teacher && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{session.teacher}</span>
              </div>
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-slate-900 border-slate-700 text-white">
        <div className="space-y-1">
          <p className="font-semibold text-white">
            {`${session.courseCode} - ${course?.title || ''}`}
          </p>
          <p className="text-xs text-slate-300">
            {session.type} {session.room && `• ${session.room}`} {session.teacher && `• ${session.teacher}`}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
