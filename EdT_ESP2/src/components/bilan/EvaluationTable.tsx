import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X } from 'lucide-react'

interface CourseEvaluation {
  courseCode: string
  courseName: string
  teacher: string
  evaluations: { devoir: number; examen: number; rattrapage: number }
}

interface EvaluationTableProps {
  courses: CourseEvaluation[]
}

function EvalStatus({ done }: { done: boolean }) {
  return done ? (
    <div className="flex justify-center">
      <div className="rounded-full bg-progress-complete/20 p-1">
        <Check className="h-4 w-4 text-progress-complete" />
      </div>
    </div>
  ) : (
    <div className="flex justify-center">
      <div className="rounded-full bg-muted p-1">
        <X className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

export function EvaluationTable({ courses }: EvaluationTableProps) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px]">Code</TableHead>
            <TableHead className="min-w-[200px]">Matière</TableHead>
            <TableHead>Enseignant</TableHead>
            <TableHead className="text-center w-[100px]">Devoir</TableHead>
            <TableHead className="text-center w-[100px]">Examen</TableHead>
            <TableHead className="text-center w-[100px]">Rattrapage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.courseCode}>
              <TableCell className="font-mono font-medium">{course.courseCode}</TableCell>
              <TableCell className="font-medium">{course.courseName}</TableCell>
              <TableCell className="text-muted-foreground">{course.teacher}</TableCell>
              <TableCell>
                <EvalStatus done={course.evaluations.devoir === 1} />
              </TableCell>
              <TableCell>
                <EvalStatus done={course.evaluations.examen === 1} />
              </TableCell>
              <TableCell>
                <EvalStatus done={course.evaluations.rattrapage === 1} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
