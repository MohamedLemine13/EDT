/**
 * Data Store Hook
 * Central data management with localStorage persistence for demo purposes
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

// Import types from central types file
import type {
  Course,
  Teacher,
  Room,
  Session,
  WeekSchedule,
} from '@/types'

// Re-export types for convenience
export type { Course, Teacher, Room, Session, WeekSchedule }

// Import default data
import defaultCoursesData from '@/data/courses.json'
import defaultTeachersData from '@/data/teachers.json'
import defaultRoomsData from '@/data/rooms.json'
import defaultScheduleData from '@/data/schedule-week16.json'

// localStorage keys
const STORAGE_KEYS = {
  courses: 'esp-data-courses',
  teachers: 'esp-data-teachers',
  rooms: 'esp-data-rooms',
  schedule: 'esp-data-schedule',
} as const

// Helper to safely parse JSON from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

// Helper to save to localStorage
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// Data Store Context
interface DataStoreContextValue {
  // Data
  courses: Course[]
  teachers: Teacher[]
  rooms: Room[]
  schedule: WeekSchedule

  // Course CRUD
  addCourse: (course: Course) => void
  updateCourse: (code: string, updates: Partial<Course>) => void
  deleteCourse: (code: string) => void

  // Teacher CRUD
  addTeacher: (teacher: Teacher) => void
  updateTeacher: (id: string, updates: Partial<Teacher>) => void
  deleteTeacher: (id: string) => void

  // Room CRUD
  addRoom: (room: Room) => void
  updateRoom: (id: string, updates: Partial<Room>) => void
  deleteRoom: (id: string) => void

  // Session CRUD
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  deleteSession: (id: string) => void

  // Sheet management
  setNewSchedule: (schedule: WeekSchedule) => void

  // Utility
  resetToDefaults: () => void
  hasChanges: boolean
}

const DataStoreContext = createContext<DataStoreContextValue | null>(null)

// Provider component
interface DataStoreProviderProps {
  children: ReactNode
}

export function DataStoreProvider({ children }: DataStoreProviderProps) {
  // Initialize state from localStorage or defaults
  const [courses, setCourses] = useState<Course[]>(() =>
    loadFromStorage(STORAGE_KEYS.courses, defaultCoursesData.courses as Course[])
  )

  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    loadFromStorage(STORAGE_KEYS.teachers, defaultTeachersData.teachers as Teacher[])
  )

  const [rooms, setRooms] = useState<Room[]>(() =>
    loadFromStorage(STORAGE_KEYS.rooms, defaultRoomsData.rooms as Room[])
  )

  const [schedule, setSchedule] = useState<WeekSchedule>(() =>
    loadFromStorage(STORAGE_KEYS.schedule, defaultScheduleData as WeekSchedule)
  )

  // Track if there are changes from defaults
  const [hasChanges, setHasChanges] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.courses) !== null ||
      localStorage.getItem(STORAGE_KEYS.teachers) !== null ||
      localStorage.getItem(STORAGE_KEYS.rooms) !== null ||
      localStorage.getItem(STORAGE_KEYS.schedule) !== null
    )
  })

  // Course CRUD
  const addCourse = useCallback((course: Course) => {
    setCourses((prev) => {
      const updated = [...prev, course]
      saveToStorage(STORAGE_KEYS.courses, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const updateCourse = useCallback((code: string, updates: Partial<Course>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c.code === code ? { ...c, ...updates } : c))
      saveToStorage(STORAGE_KEYS.courses, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const deleteCourse = useCallback((code: string) => {
    setCourses((prev) => {
      const updated = prev.filter((c) => c.code !== code)
      saveToStorage(STORAGE_KEYS.courses, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  // Teacher CRUD
  const addTeacher = useCallback((teacher: Teacher) => {
    setTeachers((prev) => {
      const updated = [...prev, teacher]
      saveToStorage(STORAGE_KEYS.teachers, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const updateTeacher = useCallback((id: string, updates: Partial<Teacher>) => {
    setTeachers((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      saveToStorage(STORAGE_KEYS.teachers, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const deleteTeacher = useCallback((id: string) => {
    setTeachers((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      saveToStorage(STORAGE_KEYS.teachers, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  // Room CRUD
  const addRoom = useCallback((room: Room) => {
    setRooms((prev) => {
      const updated = [...prev, room]
      saveToStorage(STORAGE_KEYS.rooms, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    setRooms((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      saveToStorage(STORAGE_KEYS.rooms, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== id)
      saveToStorage(STORAGE_KEYS.rooms, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  // Session CRUD
  const addSession = useCallback((session: Session) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        sessions: [...prev.sessions, session],
      }
      saveToStorage(STORAGE_KEYS.schedule, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        sessions: prev.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }
      saveToStorage(STORAGE_KEYS.schedule, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSchedule((prev) => {
      const updated = {
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== id),
      }
      saveToStorage(STORAGE_KEYS.schedule, updated)
      setHasChanges(true)
      return updated
    })
  }, [])

  // Set new schedule (for creating new sheets)
  const setNewSchedule = useCallback((newSchedule: WeekSchedule) => {
    setSchedule(newSchedule)
    saveToStorage(STORAGE_KEYS.schedule, newSchedule)
    setHasChanges(true)
  }, [])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.courses)
    localStorage.removeItem(STORAGE_KEYS.teachers)
    localStorage.removeItem(STORAGE_KEYS.rooms)
    localStorage.removeItem(STORAGE_KEYS.schedule)

    // Reset state to defaults
    setCourses(defaultCoursesData.courses as Course[])
    setTeachers(defaultTeachersData.teachers as Teacher[])
    setRooms(defaultRoomsData.rooms as Room[])
    setSchedule(defaultScheduleData as WeekSchedule)
    setHasChanges(false)
  }, [])

  const value: DataStoreContextValue = {
    courses,
    teachers,
    rooms,
    schedule,
    addCourse,
    updateCourse,
    deleteCourse,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addRoom,
    updateRoom,
    deleteRoom,
    addSession,
    updateSession,
    deleteSession,
    setNewSchedule,
    resetToDefaults,
    hasChanges,
  }

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
}

// Hook to use the data store
export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider')
  }
  return context
}

// Generate unique IDs
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
