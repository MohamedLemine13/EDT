import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Course {
  code: string
  title: string
  color: string
}

interface PlanningEntry {
  week: number
  day: number
  slot: number
  code: string
  type: string
}

interface CourseLegendProps {
  courses: Course[]
  schedule: PlanningEntry[]
  highlightedCourse?: string | null
  onCourseHover?: (code: string | null) => void
}

interface CourseStats {
  cm: number
  tp: number
  total: number
}

export function CourseLegend({
  courses,
  schedule,
  highlightedCourse,
  onCourseHover,
}: CourseLegendProps) {
  // Calculate session counts per course
  const courseStats = useMemo(() => {
    const stats = new Map<string, CourseStats>()

    courses.forEach((course) => {
      stats.set(course.code, { cm: 0, tp: 0, total: 0 })
    })

    schedule.forEach((entry) => {
      if (entry.type === 'exam' || entry.type === 'special') return
      const stat = stats.get(entry.code)
      if (stat) {
        stat.total++
        if (entry.type === 'CM') stat.cm++
        else if (entry.type === 'TP') stat.tp++
      }
    })

    return stats
  }, [courses, schedule])

  // Calculate totals
  const totals = useMemo(() => {
    const total = { cm: 0, tp: 0, total: 0 }
    courseStats.forEach((stat) => {
      total.cm += stat.cm
      total.tp += stat.tp
      total.total += stat.total
    })
    return total
  }, [courseStats])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Légende des Cours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {courses.map((course) => {
          const stats = courseStats.get(course.code)
          const isHighlighted = highlightedCourse === course.code

          return (
            <button
              key={course.code}
              className={cn(
                'w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left',
                'hover:bg-muted/50',
                isHighlighted && 'bg-muted ring-2 ring-primary'
              )}
              onMouseEnter={() => onCourseHover?.(course.code)}
              onMouseLeave={() => onCourseHover?.(null)}
            >
              <div
                className="w-4 h-4 rounded-sm shrink-0"
                style={{ backgroundColor: course.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{course.code}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {course.title}
                </div>
              </div>
              {stats && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {stats.cm > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[24px] px-1.5 text-[11px] font-medium bg-cell-cm/20 text-cell-cm border border-cell-cm/30">
                      {stats.cm}
                    </Badge>
                  )}
                  {stats.tp > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[24px] px-1.5 text-[11px] font-medium bg-cell-tp/20 text-cell-tp border border-cell-tp/30">
                      {stats.tp}
                    </Badge>
                  )}
                </div>
              )}
            </button>
          )
        })}

        {/* Totals */}
        <div className="border-t border-border pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Total séances</span>
            <span className="text-xs text-muted-foreground">{totals.total}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-cell-cm/10 border border-cell-cm/30">
              <div className="w-2.5 h-2.5 rounded-sm bg-cell-cm" />
              <span className="text-xs font-medium">CM</span>
              <span className="text-xs text-muted-foreground ml-auto">{totals.cm}</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-cell-tp/10 border border-cell-tp/30">
              <div className="w-2.5 h-2.5 rounded-sm bg-cell-tp" />
              <span className="text-xs font-medium">TP</span>
              <span className="text-xs text-muted-foreground ml-auto">{totals.tp}</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
