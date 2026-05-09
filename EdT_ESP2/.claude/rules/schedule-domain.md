# ESP Dashboard - Schedule Domain Rules

**Purpose**: Domain knowledge for the academic schedule management system.

---

## Core Concepts

### Time Structure
- **Academic Year**: September → August
- **Semester**: 18 weeks each (S1-S6)
- **Week**: 6 days (Lundi-Samedi)
- **Day**: 5 time slots (periods)

### Time Slots
| Slot | Period | Time          |
|------|--------|---------------|
| 0    | P1     | 8h00 - 9h30   |
| 1    | P2     | 9h45 - 11h15  |
| 2    | P3     | 11h30 - 13h00 |
| 3    | P4     | 15h10 - 16h40 |
| 4    | P5     | 17h00 - 18h30 |

### Session Types
| Type | French Name        | Color Code | Tailwind       |
|------|--------------------|------------|----------------|
| CM   | Cours Magistral    | #1565C0    | `bg-blue-700`  |
| TD   | Travaux Dirigés    | #2E7D32    | `bg-green-700` |
| TP   | Travaux Pratiques  | #00838F    | `bg-teal-700`  |

### Special States
| State    | Color Code | Badge Text           |
|----------|------------|----------------------|
| exam     | #C62828    | "Exam" or "EXAMEN"   |
| online   | cell + badge | "En ligne"         |
| devoir   | #F9A825    | "Devoir"             |
| military | #5D4037    | "Instruction militaire" |
| club     | #7B1FA2    | "Club robotique"     |
| empty    | #37474F    | None                 |

---

## Data Models (Reference)

```typescript
// Session - One class instance
interface Session {
  id: string;
  courseCode: string;      // "IRT31"
  type: 'CM' | 'TD' | 'TP';
  day: Day;                // 0-5 (Lundi-Samedi)
  timeSlot: number;        // 0-4
  room: string;
  teacher: string;
  status?: 'exam' | 'devoir' | 'normal';
  tags?: string[];         // ["En ligne", "Club robotique"]
}

// Course - Course metadata
interface Course {
  code: string;
  title: string;
  credits: number;
  coefficient: number;
  hours: { cm: number; td: number; tp: number };
  teachers: { cm: string; td: string; tp: string };
  rooms: { cm: string; td: string; tp: string };
  color: string;
}
```

---

## Department Codes

| Code | Department                                     |
|------|------------------------------------------------|
| IRT  | Informatique, Réseaux & Télécommunication      |
| GC   | Génie Civil                                    |
| GM   | Génie Mécanique                                |
| GE   | Génie Électrique                               |

## Course Code Format

Pattern: `{Department}{Semester}{Number}`
- `IRT31` = IRT, Semester 3, Course 1
- `HE31` = Humanities, Semester 3, Course 1

---

## Component Patterns

### Schedule Cell Logic
```tsx
function getCellBackgroundColor(session: Session): string {
  // Priority order matters!
  if (session.status === 'exam') return 'var(--cell-exam)';
  if (session.tags?.includes('Instruction militaire')) return 'var(--cell-military)';
  if (session.tags?.includes('Club')) return 'var(--cell-club)';
  if (session.status === 'devoir') return 'var(--cell-devoir)';

  // Default to type color
  switch (session.type) {
    case 'CM': return 'var(--cell-cm)';
    case 'TD': return 'var(--cell-td)';
    case 'TP': return 'var(--cell-tp)';
  }
}
```

### Badge Visibility Rules
- Show "En ligne" badge when `tags.includes('En ligne')`
- Show "Exam" badge when `status === 'exam'`
- Show "Devoir" badge when `status === 'devoir'`
- Badges appear top-right of cell

### Empty Cell
- Background: `bg-slate-800/50` or `var(--cell-empty)`
- Border: subtle dashed or solid gray
- No content, fixed height

---

## Progress Calculation (Bilan)

```typescript
function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'var(--progress-complete)'; // Green
  if (percentage >= 75) return 'var(--progress-good)';      // Light green
  if (percentage >= 50) return 'var(--progress-warning)';   // Orange
  return 'var(--progress-danger)';                          // Red
}
```

---

## French UI Terms

Always use French in the UI:
- Schedule → Emploi
- Planning → Plan
- Summary → Bilan
- Calendar → Calendrier
- Database → BDD
- Teacher → Enseignant
- Room → Salle
- Subject → Matière

---

## Page-Specific Requirements

### Emploi (Schedule)
- 6×5 grid (days × slots)
- Click cell → modal with details
- Week navigation (< > arrows)
- Responsive: cards on mobile

### Plan (Matrix)
- 30×18 grid (periods × weeks)
- Legend panel (right side)
- Hover → highlight course
- Click week → navigate to Emploi

### Bilan (Progress)
- Progress bars with percentage
- Sortable columns
- Separate evaluation table
- Running totals row

### Calendrier
- 12 months grid view
- Event highlighting by type
- Event list panel
- Click event → scroll to month

### BDD (Database)
- 3 sub-tabs: Matières, Enseignants, Salles
- Search filtering
- Click row → detail panel
- Sortable columns
