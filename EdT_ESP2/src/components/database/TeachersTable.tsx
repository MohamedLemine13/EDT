import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Mail } from 'lucide-react'
import { fuzzySearch } from '@/lib/fuzzySearch'

interface Teacher {
  id: string
  name: string
  department: string
  email: string
  courses: string[]
}

interface TeachersTableProps {
  teachers: Teacher[]
  searchQuery: string
  selectedTeacher: Teacher | null
  onSelectTeacher: (teacher: Teacher | null) => void
}

export function TeachersTable({
  teachers,
  searchQuery,
  selectedTeacher,
  onSelectTeacher,
}: TeachersTableProps) {
  // Use fuzzy search for intelligent matching
  const filteredTeachers = useMemo(() => {
    return fuzzySearch(teachers, searchQuery, (teacher) => [
      teacher.name,
      teacher.department,
      teacher.email,
      ...teacher.courses,
    ])
  }, [teachers, searchQuery])

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nom</TableHead>
            <TableHead className="w-[100px]">Département</TableHead>
            <TableHead>Matières</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                Aucun enseignant trouvé
              </TableCell>
            </TableRow>
          ) : (
            filteredTeachers.map((teacher) => (
              <TableRow
                key={teacher.id}
                className={cn(
                  'cursor-pointer',
                  selectedTeacher?.id === teacher.id && 'bg-muted'
                )}
                onClick={() =>
                  onSelectTeacher(selectedTeacher?.id === teacher.id ? null : teacher)
                }
              >
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{teacher.department}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.courses.map((code) => (
                      <Badge key={code} variant="secondary" className="text-[10px]">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`mailto:${teacher.email}`}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-3 w-3" />
                    {teacher.email}
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
