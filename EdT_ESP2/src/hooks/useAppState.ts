import { createContext, useContext } from 'react'

// App state context for sharing department/semester/week across pages
export interface AppState {
  department: string
  semester: string
  week: number
  setDepartment: (dept: string) => void
  setSemester: (sem: string) => void
  setWeek: (week: number) => void
}

export const AppStateContext = createContext<AppState | null>(null)

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
