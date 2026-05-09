# ESP Dashboard - Component Patterns

**Purpose**: Shared patterns and conventions for building components.

---

## File Structure

```
src/components/
├── layout/           # App shell components
│   ├── Header.tsx
│   ├── TabNavigation.tsx
│   └── PageContainer.tsx
│
├── schedule/         # Emploi page
│   ├── ScheduleGrid.tsx
│   ├── ScheduleCell.tsx
│   ├── TimeSlotHeader.tsx
│   ├── DayRow.tsx
│   ├── WeekNavigator.tsx
│   └── SessionModal.tsx
│
├── planning/         # Plan page
│   ├── PlanningMatrix.tsx
│   ├── PlanningCell.tsx
│   └── CourseLegend.tsx
│
├── bilan/            # Bilan page
│   ├── ProgressTable.tsx
│   ├── ProgressBar.tsx
│   └── EvaluationTable.tsx
│
├── calendar/         # Calendrier page
│   ├── AcademicCalendar.tsx
│   ├── MonthGrid.tsx
│   └── EventList.tsx
│
├── database/         # BDD page
│   ├── DataTable.tsx
│   ├── SearchBar.tsx
│   └── DetailPanel.tsx
│
└── ui/               # shadcn/ui components
    └── (auto-generated)
```

---

## Component Template

```tsx
// 1. Imports (grouped)
import { useState } from 'react';           // React
import { Button } from '@/components/ui';   // Internal UI
import type { Session } from '@/types';     // Types

// 2. Types/Interfaces
interface Props {
  session: Session;
  onClick?: () => void;
}

// 3. Component
export function ComponentName({ session, onClick }: Props) {
  // 3a. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 3b. Derived values
  const backgroundColor = getColorForType(session.type);

  // 3c. Handlers
  const handleClick = () => onClick?.();

  // 3d. Render
  return (
    <div className="..." onClick={handleClick}>
      {/* content */}
    </div>
  );
}
```

---

## Styling Conventions

### Tailwind Classes Order
1. Layout: `flex`, `grid`, `block`
2. Position: `relative`, `absolute`
3. Size: `w-*`, `h-*`, `min-*`, `max-*`
4. Spacing: `p-*`, `m-*`, `gap-*`
5. Typography: `text-*`, `font-*`
6. Colors: `bg-*`, `text-*`, `border-*`
7. Effects: `shadow-*`, `opacity-*`
8. Interactivity: `hover:*`, `focus:*`, `cursor-*`
9. Responsive: `md:*`, `lg:*`

### Dark Theme (Default)
```tsx
// Background layers
<div className="bg-slate-950">           // Page background
  <div className="bg-slate-900">         // Card background
    <div className="bg-slate-800">       // Nested element
    </div>
  </div>
</div>

// Text colors
<span className="text-white">            // Primary text
<span className="text-slate-300">        // Secondary text
<span className="text-slate-500">        // Muted text
```

### Borders
```tsx
<div className="border border-slate-700">      // Default
<div className="border border-slate-600">      // Hover
<div className="border-2 border-green-500">    // Focus/Active
```

---

## Interactive States

### Hover
```tsx
className="hover:bg-slate-700 hover:brightness-110 transition-colors"
```

### Focus (Accessibility)
```tsx
className="focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
```

### Active/Selected
```tsx
className="bg-green-600 border-green-500"
```

### Disabled
```tsx
className="opacity-50 cursor-not-allowed pointer-events-none"
```

---

## Grid Patterns

### Schedule Grid (Emploi)
```tsx
<div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1">
  {/* First column: Day labels */}
  {/* 5 columns: Time slots */}
</div>
```

### Planning Matrix
```tsx
<div className="grid grid-cols-[auto_repeat(18,minmax(40px,1fr))] gap-px overflow-x-auto">
  {/* First column: Period labels */}
  {/* 18 columns: Weeks */}
</div>
```

### Calendar Month
```tsx
<div className="grid grid-cols-7 gap-1">
  {/* 7 columns: days of week */}
</div>
```

---

## Modal Pattern

```tsx
// Using shadcn/ui Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="bg-slate-900 border-slate-700">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## Badge Component Usage

```tsx
// Session type badges
<Badge variant="default">{session.type}</Badge>

// Status badges
<Badge variant="destructive">Exam</Badge>
<Badge variant="success">En ligne</Badge>
<Badge variant="warning">Devoir</Badge>
```

---

## Responsive Breakpoints

```tsx
// Mobile first approach
<div className="
  grid-cols-1           // Mobile: single column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-5        // Desktop: 5 columns
">
```

### Mobile Adaptations
- Schedule: Show one day at a time with day selector
- Tables: Convert to card layout
- Matrix: Horizontal scroll with fixed first column

---

## Auto-Imports Available

These work without importing (via unplugin-auto-import):
- `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
- `useNavigate`, `useParams`, `useLocation`, `Link`
- `cn()` for class merging

---

## Accessibility Checklist

- [ ] All interactive elements have `aria-label` when text isn't visible
- [ ] Color is not the only indicator (use icons/text too)
- [ ] Focus indicators are visible (ring-2)
- [ ] Modal traps focus
- [ ] Tables have proper `<th>` headers
- [ ] Contrast ratio ≥ 4.5:1 for text
