import { Link, useLocation } from 'react-router-dom'
import {
  Calendar,
  LayoutGrid,
  BarChart3,
  CalendarDays,
  Database,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Tab configuration matching PRD
const TABS = [
  {
    id: 'emploi',
    label: 'Emploi',
    path: '/',
    icon: Calendar,
    description: 'Emploi du temps hebdomadaire',
  },
  {
    id: 'plan',
    label: 'Plan',
    path: '/plan',
    icon: LayoutGrid,
    description: 'Planning du semestre',
  },
  {
    id: 'bilan',
    label: 'Bilan',
    path: '/bilan',
    icon: BarChart3,
    description: 'Suivi de progression',
  },
  {
    id: 'calendrier',
    label: 'Calendrier',
    path: '/calendrier',
    icon: CalendarDays,
    description: 'Calendrier académique',
  },
  {
    id: 'bdd',
    label: 'BDD',
    path: '/bdd',
    icon: Database,
    description: 'Base de données',
  },
] as const

interface TabNavigationProps {
  showWeekNav?: boolean
}

export function TabNavigation({ showWeekNav = false }: TabNavigationProps) {
  const location = useLocation()

  // Determine active tab from current path
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'emploi'
    const tab = TABS.find((t) => t.path === path)
    return tab?.id || 'emploi'
  }

  const activeTab = getActiveTab()

  // Adjust top position based on whether week nav is shown
  // Header main row: h-14 (56px) mobile, h-16 (64px) desktop
  // Week nav row: h-10 (40px) mobile, h-12 (48px) desktop
  const topPosition = showWeekNav
    ? 'top-24 sm:top-28' // 56+40=96px mobile, 64+48=112px desktop
    : 'top-14 sm:top-16'

  return (
    <nav className={cn("bg-card shadow-sm sticky z-40", topPosition)}>
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-11 sm:h-12 items-center justify-center sm:justify-start overflow-x-auto scrollbar-hide">
          <div className="flex gap-0.5 sm:gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={cn(
                    'group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-esp-green text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  title={tab.description}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200',
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    )}
                  />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
