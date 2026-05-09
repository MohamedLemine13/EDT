import { useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { PageLoadingSkeleton } from "@/components/layout/LoadingSkeleton";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { AppStateContext } from "@/hooks/useAppState";
import { ThemeProvider } from "@/hooks/useTheme";
import { DataStoreProvider, useDataStore } from "@/hooks/useDataStore";
import { SetupProvider } from "@/hooks/useSetupContext";
import { AuthProvider } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import type { WeekSchedule } from "@/types";

// Mock date range for week (will be dynamic later)
function getWeekDateRange(week: number): { start: string; end: string } {
  // Base date: Week 16 starts Jan 26, 2026
  // This is simplified - real implementation would calculate properly
  const baseDate = new Date(2026, 0, 26); // Jan 26, 2026
  const weekOffset = (week - 16) * 7;
  const startDate = new Date(baseDate);
  startDate.setDate(startDate.getDate() + weekOffset);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 5); // 6 days (Mon-Sat)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

// Inner component that has access to data store
function LayoutContent() {
  const location = useLocation();
  const { schedule, setNewSchedule } = useDataStore();

  // App state with localStorage persistence
  const [department, setDepartment] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("esp-department") || "IRT";
    }
    return "IRT";
  });

  const [semester, setSemester] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("esp-semester") || "S3";
    }
    return "S3";
  });

  const [week, setWeek] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esp-week");
      return saved ? parseInt(saved, 10) : 16;
    }
    return 16;
  });

  // Persist to localStorage
  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
    localStorage.setItem("esp-department", dept);
  };

  const handleSemesterChange = (sem: string) => {
    setSemester(sem);
    localStorage.setItem("esp-semester", sem);
  };

  // Handle week change - creates new empty EDT
  const handleWeekChange = (w: number) => {
    setWeek(w);
    localStorage.setItem("esp-week", w.toString());

    // Create new empty schedule for the week
    const newSchedule: WeekSchedule = {
      semester: schedule.semester,
      week: w,
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      timeSlots: schedule.timeSlots,
      days: schedule.days,
      sessions: [], // Empty sessions for new week
    };
    setNewSchedule(newSchedule);
  };

  const isLoginPage = location.pathname === "/login";
  const dateRange = getWeekDateRange(week);

  return (
    <AppStateContext.Provider
      value={{
        department,
        semester,
        week,
        setDepartment: handleDepartmentChange,
        setSemester: handleSemesterChange,
        setWeek: handleWeekChange,
      }}
    >
      {isLoginPage ? (
        <main className="min-h-screen">
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      ) : (
        <>
          <Sidebar />
          <div className="min-h-screen bg-background lg:pl-[288px]">
            <Header
              department={department}
              semester={semester}
              week={week}
              dateRange={dateRange}
              onDepartmentChange={handleDepartmentChange}
              onSemesterChange={handleSemesterChange}
              onWeekChange={handleWeekChange}
              showWeekNav={false}
            />
            <main className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </>
      )}
    </AppStateContext.Provider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataStoreProvider>
          <SetupProvider>
            <LayoutContent />
          </SetupProvider>
        </DataStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
