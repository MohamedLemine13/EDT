import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { fuzzySearch } from '@/lib/fuzzySearch'

interface Course {
  code: string
  title: string
  credits: number

  hours: { cm: number; td: number; tp: number; total: number }
  teachers: { cm: string; td: string; tp: string }
  rooms: { cm: string; td: string; tp: string }
  color: string
}

interface CoursesTableProps {
  courses: Course[]
  searchQuery: string
  selectedCourse: Course | null
  onSelectCourse: (course: Course | null) => void
}

export function CoursesTable({
  courses,
  searchQuery,
  selectedCourse,
  onSelectCourse,
}: CoursesTableProps) {
  // Use fuzzy search for intelligent matching
  const filteredCourses = useMemo(() => {
    return fuzzySearch(courses, searchQuery, (course) => [
      course.code,
      course.title,
      course.teachers.cm,
      course.teachers.td,
      course.teachers.tp,
    ])
  }, [courses, searchQuery])

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead className="text-center w-[80px]">Crédit</TableHead>

            <TableHead className="text-center w-[180px]">Volume horaire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Aucune matière trouvée
              </TableCell>
            </TableRow>
          ) : (
            filteredCourses.map((course) => (
              <TableRow
                key={course.code}
                className={cn(
                  'cursor-pointer',
                  selectedCourse?.code === course.code && 'bg-muted'
                )}
                onClick={() =>
                  onSelectCourse(selectedCourse?.code === course.code ? null : course)
                }
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="font-mono font-medium">{course.code}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell className="text-center">{course.credits}</TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Badge variant="secondary" className="text-[10px] bg-cell-cm/20 text-cell-cm">
                      CM {course.hours.cm}h
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-cell-td/20 text-cell-td">
                      TD {course.hours.td}h
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-cell-tp/20 text-cell-tp">
                      TP {course.hours.tp}h
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
