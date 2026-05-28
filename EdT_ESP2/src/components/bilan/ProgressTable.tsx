import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { ProgressBar } from './ProgressBar'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CourseProgress {
  courseCode: string
  courseName: string
  teacher: string
  planned: { cm: number; td: number; tp: number }
  completed: { cm: number; td: number; tp: number }
}

interface ProgressTableProps {
  courses: CourseProgress[]
  summary: {
    planned: { cm: number; td: number; tp: number }
    completed: { cm: number; td: number; tp: number }
  }
}

type SortField = 'code' | 'name' | 'cm' | 'td' | 'tp'
type SortDirection = 'asc' | 'desc'

function getPercentage(completed: number, planned: number): number {
  return planned > 0 ? Math.round((completed / planned) * 100) : 0
}

interface SortButtonProps {
  field: SortField
  children: React.ReactNode
  onSort: (field: SortField) => void
  isActive?: boolean
  direction?: SortDirection
}

function SortButton({ field, children, onSort, isActive, direction }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 px-2 -ml-2 font-medium hover:bg-muted",
        isActive && "text-primary"
      )}
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className={cn(
        "ml-1 h-3 w-3 transition-transform",
        isActive && direction === 'desc' && "rotate-180"
      )} />
    </Button>
  )
}

export function ProgressTable({ courses, summary }: ProgressTableProps) {
  const [sortField, setSortField] = useState<SortField>('code')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'code':
          comparison = a.courseCode.localeCompare(b.courseCode)
          break
        case 'name':
          comparison = a.courseName.localeCompare(b.courseName)
          break
        case 'cm':
          comparison = getPercentage(a.completed.cm, a.planned.cm) - getPercentage(b.completed.cm, b.planned.cm)
          break
        case 'td':
          comparison = getPercentage(a.completed.td, a.planned.td) - getPercentage(b.completed.td, b.planned.td)
          break
        case 'tp':
          comparison = getPercentage(a.completed.tp, a.planned.tp) - getPercentage(b.completed.tp, b.planned.tp)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [courses, sortField, sortDirection])

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px] sticky left-0 z-10 bg-card">
              <SortButton field="code" onSort={handleSort} isActive={sortField === 'code'} direction={sortDirection}>Code</SortButton>
            </TableHead>
            <TableHead className="min-w-[180px] sticky left-[80px] z-10 bg-card">
              <SortButton field="name" onSort={handleSort} isActive={sortField === 'name'} direction={sortDirection}>Matière</SortButton>
            </TableHead>
            <TableHead colSpan={3} className="text-center border-l border-border bg-cell-cm/10">
              <SortButton field="cm" onSort={handleSort} isActive={sortField === 'cm'} direction={sortDirection}>CM</SortButton>
            </TableHead>
            <TableHead colSpan={3} className="text-center border-l border-border bg-cell-td/10">
              <SortButton field="td" onSort={handleSort} isActive={sortField === 'td'} direction={sortDirection}>TD</SortButton>
            </TableHead>
            <TableHead colSpan={3} className="text-center border-l border-border bg-cell-tp/10">
              <SortButton field="tp" onSort={handleSort} isActive={sortField === 'tp'} direction={sortDirection}>TP</SortButton>
            </TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent text-xs">
            <TableHead className="sticky left-0 z-10 bg-card" />
            <TableHead className="sticky left-[80px] z-10 bg-card" />
            <TableHead className="text-center border-l border-border bg-cell-cm/10 w-12">Prév</TableHead>
            <TableHead className="text-center bg-cell-cm/10 w-12">Eff</TableHead>
            <TableHead className="text-center bg-cell-cm/10 w-24">%</TableHead>
            <TableHead className="text-center border-l border-border bg-cell-td/10 w-12">Prév</TableHead>
            <TableHead className="text-center bg-cell-td/10 w-12">Eff</TableHead>
            <TableHead className="text-center bg-cell-td/10 w-24">%</TableHead>
            <TableHead className="text-center border-l border-border bg-cell-tp/10 w-12">Prév</TableHead>
            <TableHead className="text-center bg-cell-tp/10 w-12">Eff</TableHead>
            <TableHead className="text-center bg-cell-tp/10 w-24">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCourses.map((course) => (
            <TableRow key={course.courseCode}>
              <TableCell className="font-mono font-medium sticky left-0 z-10 bg-card">{course.courseCode}</TableCell>
              <TableCell className="font-medium sticky left-[80px] z-10 bg-card truncate max-w-[180px]">{course.courseName}</TableCell>
              <TableCell className="text-center border-l border-border bg-cell-cm/5">{course.planned.cm}</TableCell>
              <TableCell className="text-center bg-cell-cm/5">{course.completed.cm}</TableCell>
              <TableCell className="bg-cell-cm/5">
                <ProgressBar value={course.completed.cm} max={course.planned.cm} size="sm" />
              </TableCell>
              <TableCell className="text-center border-l border-border bg-cell-td/5">{course.planned.td}</TableCell>
              <TableCell className="text-center bg-cell-td/5">{course.completed.td}</TableCell>
              <TableCell className="bg-cell-td/5">
                <ProgressBar value={course.completed.td} max={course.planned.td} size="sm" />
              </TableCell>
              <TableCell className="text-center border-l border-border bg-cell-tp/5">{course.planned.tp}</TableCell>
              <TableCell className="text-center bg-cell-tp/5">{course.completed.tp}</TableCell>
              <TableCell className="bg-cell-tp/5">
                <ProgressBar value={course.completed.tp} max={course.planned.tp} size="sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/30 font-semibold">
            <TableCell colSpan={2} className="sticky left-0 z-10 bg-muted/30">Total</TableCell>
            <TableCell className="text-center border-l border-border">{summary.planned.cm}</TableCell>
            <TableCell className="text-center">{summary.completed.cm}</TableCell>
            <TableCell>
              <ProgressBar value={summary.completed.cm} max={summary.planned.cm} size="sm" />
            </TableCell>
            <TableCell className="text-center border-l border-border">{summary.planned.td}</TableCell>
            <TableCell className="text-center">{summary.completed.td}</TableCell>
            <TableCell>
              <ProgressBar value={summary.completed.td} max={summary.planned.td} size="sm" />
            </TableCell>
            <TableCell className="text-center border-l border-border">{summary.planned.tp}</TableCell>
            <TableCell className="text-center">{summary.completed.tp}</TableCell>
            <TableCell>
              <ProgressBar value={summary.completed.tp} max={summary.planned.tp} size="sm" />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
