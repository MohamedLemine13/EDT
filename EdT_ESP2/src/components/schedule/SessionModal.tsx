import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Session, Course, TimeSlot } from '@/types'
import { TIME_SLOTS } from '@/types'
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Award,
  Monitor,
  AlertTriangle,
  Trash2,
  Pencil,
} from 'lucide-react'

interface SessionModalProps {
  session: Session | null
  course?: Course
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function getTypeBadge(session: Session) {
  const typeLabels: Record<string, string> = {
    CM: 'Cours Magistral',
    TP: 'Travaux Pratiques',
  }

  const typeColors: Record<string, string> = {
    CM: 'bg-cell-cm',
    TP: 'bg-cell-tp',
  }

  return (
    <Badge className={`${typeColors[session.type] || 'bg-slate-600'} text-white`}>
      {typeLabels[session.type] || session.type}
    </Badge>
  )
}

export function SessionModal({ session, course, isOpen, onClose, onEdit, onDelete }: SessionModalProps) {
  if (!session) return null

  const timeSlot: TimeSlot | undefined = TIME_SLOTS.find((t) => t.id === session.timeSlot)
  const isSpecial = session.courseCode === 'MILITARY' || session.courseCode === 'CLUB'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {!isSpecial && (
              <span className="font-bold">{session.courseCode}</span>
            )}
            {getTypeBadge(session)}
          </DialogTitle>
          <DialogDescription className="text-base text-foreground">
            {isSpecial
              ? session.tags?.[0] || 'Activité spéciale'
              : course?.title || session.courseCode}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          {/* Status badges */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {session.tags.includes('En ligne') && (
                <Badge variant="success" className="gap-1">
                  <Monitor className="h-3 w-3" />
                  En ligne
                </Badge>
              )}
              {(session.status === 'exam' || session.type === 'Exam' || session.tags?.includes('Examen')) && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Examen
                </Badge>
              )}
              {session.tags.includes('Devoir') && (
                <Badge variant="warning" className="gap-1">
                  <Award className="h-3 w-3" />
                  Devoir
                </Badge>
              )}
            </div>
          )}

          {/* Session details */}
          <div className="grid gap-3">
            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Horaire</p>
                <p className="text-sm text-muted-foreground">
                  {timeSlot?.start || ''} - {timeSlot?.end || ''}
                </p>
              </div>
            </div>

            {/* Room */}
            {session.room && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Salle</p>
                  <p className="text-sm text-muted-foreground">{session.room}</p>
                </div>
              </div>
            )}

            {/* Teacher */}
            {session.teacher && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Enseignant</p>
                  <p className="text-sm text-muted-foreground">{session.teacher}</p>
                </div>
              </div>
            )}
          </div>

          {/* Course info (if available) */}
          {course && !isSpecial && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Crédits</p>
                    <p className="text-sm font-medium">{course.credits}</p>
                  </div>
                </div>

              </div>

              {/* Volume horaire */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-2">Volume horaire</p>
                <div className="flex justify-between text-sm">
                  <span>CM: {course.hours.cm}h</span>
                  <span>TD: {course.hours.td}h</span>
                  <span>TP: {course.hours.tp}h</span>
                  <span className="font-medium">Total: {course.hours.total}h</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {(onEdit || onDelete) && (
          <DialogFooter className="border-t pt-4 flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
