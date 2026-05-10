import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { X, BookOpen, User, MapPin, Clock, Mail, Building, Users, Wrench, Pencil, Trash2 } from 'lucide-react'

interface Course {
  code: string
  title: string
  credits: number

  hours: { cm: number; td: number; tp: number; total: number }
  teachers: { cm: string; td: string; tp: string }
  rooms: { cm: string; td: string; tp: string }
  color: string
}

interface Teacher {
  id: string
  name: string
  department: string
  email: string
  courses: string[]
}

interface Room {
  id: string
  code: string
  name: string
  capacity: number
  equipment: string[]
  building: string
  departmentId?: string
}

type DetailItem = Course | Teacher | Room | null

interface DetailPanelProps {
  item: DetailItem
  type: 'course' | 'teacher' | 'room'
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function isCourse(item: DetailItem): item is Course {
  return item !== null && 'code' in item && 'hours' in item
}

function isTeacher(item: DetailItem): item is Teacher {
  return item !== null && 'email' in item && 'courses' in item
}

function isRoom(item: DetailItem): item is Room {
  return item !== null && 'capacity' in item && 'equipment' in item
}

export function DetailPanel({ item, type, onClose, onEdit, onDelete }: DetailPanelProps) {
  if (!item) return null

  return (
    <Card className="border-t-4 border-t-primary flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {type === 'course' && isCourse(item) && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.code}</span>
              </div>
            )}
            {type === 'teacher' && isTeacher(item) && item.name}
            {type === 'room' && isRoom(item) && item.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course details */}
        {type === 'course' && isCourse(item) && (
          <>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Titre</h4>
              <p className="font-medium">{item.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Crédits</h4>
                <p className="font-medium">{item.credits}</p>
              </div>

            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Volume horaire ({item.hours.total}h total)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-cell-cm/10 text-center">
                  <div className="text-lg font-bold text-cell-cm">{item.hours.cm}h</div>
                  <div className="text-xs text-muted-foreground">CM</div>
                </div>
                <div className="p-2 rounded-lg bg-cell-td/10 text-center">
                  <div className="text-lg font-bold text-cell-td">{item.hours.td}h</div>
                  <div className="text-xs text-muted-foreground">TD</div>
                </div>
                <div className="p-2 rounded-lg bg-cell-tp/10 text-center">
                  <div className="text-lg font-bold text-cell-tp">{item.hours.tp}h</div>
                  <div className="text-xs text-muted-foreground">TP</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <User className="h-4 w-4" />
                Enseignants
              </h4>
              <div className="space-y-1 text-sm">
                {item.teachers.cm && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CM:</span>
                    <span>{item.teachers.cm}</span>
                  </div>
                )}
                {item.teachers.td && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TD:</span>
                    <span>{item.teachers.td}</span>
                  </div>
                )}
                {item.teachers.tp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TP:</span>
                    <span>{item.teachers.tp}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Salles
              </h4>
              <div className="space-y-1 text-sm">
                {item.rooms.cm && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CM:</span>
                    <span>{item.rooms.cm}</span>
                  </div>
                )}
                {item.rooms.td && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TD:</span>
                    <span>{item.rooms.td}</span>
                  </div>
                )}
                {item.rooms.tp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TP:</span>
                    <span>{item.rooms.tp}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Teacher details */}
        {type === 'teacher' && isTeacher(item) && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.department}</Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </h4>
              <a
                href={`mailto:${item.email}`}
                className="text-sm text-primary hover:underline"
              >
                {item.email}
              </a>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Matières enseignées
              </h4>
              <div className="flex flex-wrap gap-1">
                {item.courses.map((code) => (
                  <Badge key={code} variant="secondary">
                    {code}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Room details */}
        {type === 'room' && isRoom(item) && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacité
                </h4>
                <p className="text-lg font-bold">
                  {item.capacity > 0 ? `${item.capacity} places` : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Bâtiment
                </h4>
                <p className="font-medium">{item.building}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Wrench className="h-4 w-4" />
                Équipements
              </h4>
              <div className="flex flex-wrap gap-1">
                {item.equipment.map((eq) => (
                  <Badge key={eq} variant="secondary">
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Action buttons */}
      {(onEdit || onDelete) && (
        <CardFooter className="border-t pt-4 flex gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" className="flex-1" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
