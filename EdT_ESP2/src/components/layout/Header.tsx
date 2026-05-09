import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { departementService, semestreService } from '@/services'
import { useAuth } from '@/hooks/useAuth'

interface DeptOption {
  id: number
  code: string
  nom: string
}

interface SemOption {
  id: number
  libelle: string
}

interface HeaderProps {
  department: string
  semester: string
  week?: number
  dateRange?: { start: string; end: string }
  onDepartmentChange: (dept: string) => void
  onSemesterChange: (sem: string) => void
  onWeekChange?: (week: number) => void
  showWeekNav?: boolean
}

export function Header({
  department,
  semester,
  week = 1,
  dateRange,
  onDepartmentChange,
  onSemesterChange,
  onWeekChange,
  showWeekNav = false,
}: HeaderProps) {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<DeptOption[]>([])
  const [semesters, setSemesters] = useState<SemOption[]>([])

  // Load departments and semesters from API
  useEffect(() => {
    departementService.getAll()
      .then((data) => {
        setDepartments(data)
        // Auto-select first if current selection is not in the list
        if (data.length > 0 && !data.some((d: DeptOption) => d.code === department)) {
          onDepartmentChange(data[0].code)
        }
      })
      .catch(() => setDepartments([]))

    semestreService.getAll()
      .then((data) => {
        setSemesters(data)
        // Auto-select first if current selection is not in the list
        if (data.length > 0 && !data.some((s: SemOption) => s.libelle === semester)) {
          onSemesterChange(data[0].libelle)
        }
      })
      .catch(() => setSemesters([]))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Only show dept/semester selectors for admin roles
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CHEF_DEP' ||
                  user?.role === 'CHEF_HE' || user?.role === 'CHEF_ST'

  return (
    <header className="sticky top-1 mx-2 sm:mx-4 lg:mx-6 z-30 backdrop-blur-xl bg-background/85 border border-border/40 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main header row */}
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
          {/* Logo and title with hover effect */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer">
            <div className="relative">
              <img
                src="/logo.png"
                alt="ESP Logo"
                className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary truncate transition-all duration-300 group-hover:text-primary/80">
                Ecole supérieure polytechnique
              </h1>
              <p className="text-xs sm:text-sm font-bold text-primary/70 hidden sm:block transition-colors duration-300 group-hover:text-primary">
                Gestion des Emplois du Temps
              </p>
            </div>
          </div>

          {/* Selectors with elegant styling */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme toggle with enhanced styling */}
            <div className="p-1 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-300">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Week navigation row - only shown when showWeekNav is true */}
        {showWeekNav && (
          <div className="flex h-12 sm:h-14 items-center justify-between -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-gradient-to-r from-muted/80 via-muted/50 to-muted/80 backdrop-blur-sm border-t border-border/30">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-300"
                onClick={() => onWeekChange?.(Math.max(1, week - 1))}
                disabled={week <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Semaine précédente</span>
              </Button>
              <span className="text-xs sm:text-sm font-semibold min-w-[80px] sm:min-w-[100px] text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Semaine {week}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary/10 hover:text-primary hover:scale-110 transition-all duration-300"
                onClick={() => onWeekChange?.(Math.min(18, week + 1))}
                disabled={week >= 18}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Semaine suivante</span>
              </Button>
            </div>

            {/* Date range with elegant styling */}
            {dateRange && (
              <span className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">
                <span className="hidden sm:inline">Du </span>
                <span className="text-foreground/80">{dateRange.start}</span>
                <span className="hidden sm:inline"> au </span>
                <span className="sm:hidden"> - </span>
                <span className="text-foreground/80">{dateRange.end}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
