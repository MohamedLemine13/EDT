# EduManager - Frontend Product Requirements Document
## Complete Technical & Functional Specification

---

**Document Version:** 2.0
**Last Updated:** February 1, 2026
**Author:** Ahmed (ahmedeabdat@gmail.com)
**Status:** Ready for Development
**Target Audience:** Junior to Mid-level Frontend Developers

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Glossary & Terminology](#2-glossary--terminology)
3. [Technical Stack & Setup](#3-technical-stack--setup)
4. [Design System](#4-design-system)
5. [Application Architecture](#5-application-architecture)
6. [Page Specifications](#6-page-specifications)
7. [Component Library](#7-component-library)
8. [State Management](#8-state-management)
9. [Data Models & Types](#9-data-models--types)
10. [User Stories & Acceptance Criteria](#10-user-stories--acceptance-criteria)
11. [Implementation Guide](#11-implementation-guide)
12. [Testing Requirements](#12-testing-requirements)
13. [Accessibility Requirements](#13-accessibility-requirements)
14. [Performance Requirements](#14-performance-requirements)
15. [Error Handling](#15-error-handling)
16. [Future Considerations](#16-future-considerations)

---

# 1. Project Overview

## 1.1 Background

**ESP (École Supérieure Polytechnique)** is an engineering school in Mauritania that trains high-level engineers. The school currently uses **Google Sheets** to manage:
- Weekly class schedules (Emploi du temps)
- Semester planning
- Course progress tracking
- Academic calendar

### The Problem
The Google Sheets system has several limitations:
- **No real-time collaboration** - Multiple editors cause conflicts
- **Poor mobile experience** - Hard to view on phones
- **Manual data entry** - Prone to errors
- **No data validation** - Easy to make mistakes
- **Limited visualization** - Hard to see patterns and conflicts

### The Solution
**EduManager** is a modern web application that replaces Google Sheets with a purpose-built interface. This PRD covers the **frontend UI only** - a proposal/demo to show stakeholders what the final product could look like.

## 1.2 Project Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **Replicate functionality** | Match all current Google Sheets features | All 5 tabs working |
| **Improve UX** | Better navigation, clearer visuals | Positive stakeholder feedback |
| **Mobile-friendly** | Works on phones and tablets | Responsive on all breakpoints |
| **Demonstrate concept** | Show what's possible | Approval to proceed |

## 1.3 Scope

### In Scope (What We're Building)
- ✅ 5 main pages (Emploi, Plan, Bilan, Calendrier, BDD)
- ✅ Responsive UI (desktop + mobile)
- ✅ Interactive components (click, hover, navigation)
- ✅ Mock data (JSON files)
- ✅ Dark theme UI
- ✅ ESP branding colors

### Out of Scope (NOT Building Now)
- ❌ Backend API
- ❌ Database
- ❌ User authentication
- ❌ Real data persistence
- ❌ Multi-tenant features
- ❌ Drag-and-drop editing
- ❌ PDF/Excel export (functional)

## 1.4 Target Users

For this demo, we build a **universal view** (admin perspective). Future versions will have role-specific views.

| Role | What They See | Future Version |
|------|---------------|----------------|
| **Admin** | Everything - all departments, all data | v1 (current) |
| **Teacher** | Their own courses and schedule | v2 |
| **Student** | Their group's schedule only | v2 |

---

# 2. Glossary & Terminology

## 2.1 French Terms Used in the App

| French Term | English Translation | Description |
|-------------|---------------------|-------------|
| **Emploi** | Schedule/Timetable | Weekly class schedule |
| **Plan** | Planning | Semester-wide planning matrix |
| **Bilan** | Summary/Report | Progress tracking dashboard |
| **Calendrier** | Calendar | Academic year calendar |
| **BDD** | Database (Base de Données) | Reference data tables |
| **Matière** | Subject/Course | An academic course |
| **Semestre** | Semester | S1-S6 (6 semesters total) |
| **Semaine** | Week | Week number (1-18 per semester) |
| **Cours Magistral (CM)** | Lecture | Large group lecture |
| **Travaux Dirigés (TD)** | Tutorial | Small group exercises |
| **Travaux Pratiques (TP)** | Lab/Practical | Hands-on lab work |
| **Enseignant** | Teacher | Instructor |
| **Salle** | Room | Classroom |
| **Devoir** | Assignment | Homework/test |
| **Examen** | Exam | Final examination |
| **Rattrapage** | Retake | Make-up exam |
| **En ligne** | Online | Remote/virtual class |
| **Effectué** | Completed | Done/finished |
| **Prévu** | Planned | Scheduled |
| **Crédits** | Credits | Course credit hours |
| **Coefficient** | Coefficient | Weight in GPA calculation |
| **Vacances** | Vacation | School break |
| **Soutenance** | Defense | Thesis/project presentation |
| **PFE** | Final Year Project | Projet de Fin d'Études |
| **Jour férié** | Holiday | Public holiday |

## 2.2 Technical Terms

| Term | Description |
|------|-------------|
| **Time Slot** | A specific time period (e.g., 8h00-9h30) |
| **Session** | One instance of a class (course + time + room + teacher) |
| **Cell** | One box in the schedule grid |
| **Matrix** | The semester planning grid (weeks × periods) |
| **Badge** | Small label showing status (e.g., "En ligne", "Exam") |

## 2.3 Department Codes

| Code | Full Name |
|------|-----------|
| **IRT** | Informatique, Réseaux & Télécommunication |
| **GC** | Génie Civil |
| **GM** | Génie Mécanique |
| **GE** | Génie Électrique |

## 2.4 Course Code Format

Course codes follow this pattern: `{Department}{Semester}{Number}`

Examples:
- `IRT31` = IRT department, Semester 3, Course 1
- `HE31` = Humanities (Humanités), Semester 3, Course 1
- `PIE` = Special project (Projet Industriel en Entreprise)

---

# 3. Technical Stack & Setup

## 3.1 Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 19.x | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Build Tool** | Vite | 7.x | Fast development |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Routing** | Generouted | 1.x | File-based routing |
| **UI Components** | shadcn/ui | latest | Pre-built components |
| **Icons** | Lucide React | latest | Icon library |

## 3.2 Project Structure

```
esp-dashboard/
├── docs/
│   └── PRD.md                    # This document
│
├── public/
│   └── favicon.ico               # App icon
│
├── src/
│   ├── components/
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── schedule/             # Emploi page components
│   │   │   ├── ScheduleGrid.tsx
│   │   │   ├── ScheduleCell.tsx
│   │   │   ├── TimeSlotHeader.tsx
│   │   │   ├── DayRow.tsx
│   │   │   ├── WeekNavigator.tsx
│   │   │   └── SessionModal.tsx
│   │   │
│   │   ├── planning/             # Plan page components
│   │   │   ├── PlanningMatrix.tsx
│   │   │   ├── PlanningCell.tsx
│   │   │   ├── WeekHeader.tsx
│   │   │   ├── PeriodRow.tsx
│   │   │   └── CourseLegend.tsx
│   │   │
│   │   ├── bilan/                # Bilan page components
│   │   │   ├── ProgressTable.tsx
│   │   │   ├── ProgressRow.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── EvaluationTable.tsx
│   │   │   └── StatsSummary.tsx
│   │   │
│   │   ├── calendar/             # Calendrier page components
│   │   │   ├── AcademicCalendar.tsx
│   │   │   ├── MonthGrid.tsx
│   │   │   ├── DateCell.tsx
│   │   │   ├── EventList.tsx
│   │   │   └── EventBadge.tsx
│   │   │
│   │   ├── database/             # BDD page components
│   │   │   ├── DataTable.tsx
│   │   │   ├── CourseTable.tsx
│   │   │   ├── TeacherTable.tsx
│   │   │   ├── RoomTable.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── TableHeader.tsx
│   │   │   └── DetailPanel.tsx
│   │   │
│   │   └── ui/                   # Shared UI components
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Dropdown.tsx
│   │       ├── Modal.tsx
│   │       ├── Tabs.tsx
│   │       ├── Tooltip.tsx
│   │       └── Input.tsx
│   │
│   ├── data/                     # Mock JSON data
│   │   ├── courses.json
│   │   ├── schedule-week16.json
│   │   ├── calendar-2025-2026.json
│   │   └── progress-s3.json
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useSchedule.ts
│   │   ├── useCalendar.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── lib/                      # Utility functions
│   │   ├── utils.ts
│   │   ├── dateUtils.ts
│   │   └── colorUtils.ts
│   │
│   ├── pages/                    # Route pages (Generouted)
│   │   ├── _layout.tsx           # Root layout
│   │   ├── index.tsx             # Redirect to /emploi
│   │   ├── emploi.tsx            # Weekly schedule
│   │   ├── plan.tsx              # Semester planning
│   │   ├── bilan.tsx             # Progress tracking
│   │   ├── calendrier.tsx        # Academic calendar
│   │   └── bdd.tsx               # Database
│   │
│   ├── styles/                   # Global styles
│   │   └── globals.css
│   │
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   │
│   ├── main.tsx                  # App entry point
│   └── vite-env.d.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 3.3 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Code editor (VS Code recommended)

### Installation Steps

```bash
# 1. Navigate to project folder
cd esp-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint

## 3.4 Coding Standards

### File Naming
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ScheduleCell.tsx` |
| Hooks | camelCase with "use" prefix | `useSchedule.ts` |
| Utilities | camelCase | `dateUtils.ts` |
| Types | PascalCase | `Session`, `Course` |
| Constants | UPPER_SNAKE_CASE | `TIME_SLOTS` |

### Component Structure
```tsx
// 1. Imports (grouped)
import { useState } from 'react';           // React
import { Button } from '@/components/ui';   // Internal
import type { Session } from '@/types';     // Types

// 2. Types/Interfaces
interface Props {
  session: Session;
  onClick?: () => void;
}

// 3. Component
export function ScheduleCell({ session, onClick }: Props) {
  // 3a. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 3b. Derived values
  const backgroundColor = getColorForType(session.type);

  // 3c. Handlers
  const handleClick = () => {
    onClick?.();
  };

  // 3d. Render
  return (
    <div
      className="..."
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* content */}
    </div>
  );
}
```

### Import Aliases
Use `@/` for src folder imports:
```tsx
// ✅ Good
import { Button } from '@/components/ui/Button';
import { Session } from '@/types';

// ❌ Bad
import { Button } from '../../../components/ui/Button';
```

---

# 4. Design System

## 4.1 Color Palette

### Primary Colors (ESP Brand)
```css
/* Use these CSS variables in your components */

:root {
  /* Primary Green - ESP Brand Color */
  --esp-green-900: #1B5E20;  /* Darkest - Headers, important text */
  --esp-green-800: #2E7D32;  /* Dark - Primary buttons, links */
  --esp-green-700: #388E3C;  /* Medium - Hover states */
  --esp-green-600: #43A047;  /* Light - Active states */
  --esp-green-500: #4CAF50;  /* Lighter - Accents */
  --esp-green-100: #E8F5E9;  /* Lightest - Backgrounds */

  /* Secondary Gold - Accent Color */
  --esp-gold-500: #FFB300;   /* Primary gold */
  --esp-gold-300: #FFE082;   /* Light gold */
  --esp-gold-100: #FFF8E1;   /* Pale gold */
}
```

### Dark Theme Colors
```css
:root {
  /* Background Colors */
  --bg-primary: #0a0a0a;     /* Main background */
  --bg-secondary: #121212;   /* Card background */
  --bg-tertiary: #1E1E1E;    /* Elevated surfaces */
  --bg-hover: #2D2D2D;       /* Hover states */

  /* Border Colors */
  --border-default: #2D2D2D;
  --border-hover: #3D3D3D;
  --border-focus: #4CAF50;

  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  --text-muted: #757575;
  --text-disabled: #5C5C5C;
}
```

### Session Type Colors
```css
:root {
  /* Course Types */
  --cell-cm: #1565C0;        /* Cours Magistral - Blue */
  --cell-td: #2E7D32;        /* Travaux Dirigés - Green */
  --cell-tp: #00838F;        /* Travaux Pratiques - Teal */

  /* Special States */
  --cell-exam: #C62828;      /* Exam - Red */
  --cell-online: #7CB342;    /* En ligne - Light Green */
  --cell-devoir: #F9A825;    /* Devoir - Gold/Amber */

  /* Activities */
  --cell-military: #5D4037;  /* Instruction militaire - Brown */
  --cell-club: #7B1FA2;      /* Club activities - Purple */

  /* Empty/Default */
  --cell-empty: #37474F;     /* Empty slot - Dark Gray */
}
```

### Semantic Colors
```css
:root {
  /* Status Colors */
  --status-success: #4CAF50;
  --status-warning: #FF9800;
  --status-error: #F44336;
  --status-info: #2196F3;

  /* Progress Colors */
  --progress-complete: #4CAF50;    /* 100% */
  --progress-good: #8BC34A;        /* 75-99% */
  --progress-warning: #FF9800;     /* 50-74% */
  --progress-danger: #F44336;      /* <50% */
}
```

## 4.2 Typography

### Font Family
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Font Sizes
| Name | Size | Line Height | Use Case |
|------|------|-------------|----------|
| `text-xs` | 12px | 16px | Cell labels, badges |
| `text-sm` | 14px | 20px | Secondary text, table cells |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Subheadings |
| `text-xl` | 20px | 28px | Section titles |
| `text-2xl` | 24px | 32px | Page titles |
| `text-3xl` | 30px | 36px | Hero text |

### Font Weights
| Name | Weight | Use Case |
|------|--------|----------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, buttons |
| `font-semibold` | 600 | Headings |
| `font-bold` | 700 | Emphasis |

## 4.3 Spacing

### Base Unit
All spacing uses a 4px base unit. Use Tailwind classes:

| Class | Pixels | Use Case |
|-------|--------|----------|
| `p-1` | 4px | Tight padding |
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Medium padding |
| `p-4` | 16px | Standard padding |
| `p-6` | 24px | Large padding |
| `p-8` | 32px | Section padding |

### Component Spacing
| Component | Padding | Gap |
|-----------|---------|-----|
| Card | `p-4` (16px) | - |
| Table Cell | `px-3 py-2` | - |
| Schedule Cell | `p-2` (8px) | - |
| Button | `px-4 py-2` | - |
| Section | `p-6` (24px) | `gap-4` |

## 4.4 Border Radius

| Class | Radius | Use Case |
|-------|--------|----------|
| `rounded-sm` | 4px | Badges |
| `rounded` | 6px | Buttons, inputs |
| `rounded-md` | 8px | Cards |
| `rounded-lg` | 12px | Modals |
| `rounded-xl` | 16px | Large cards |
| `rounded-full` | 9999px | Circles, pills |

## 4.5 Shadows

```css
/* Elevation levels */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.3);
```

## 4.6 Breakpoints (Responsive Design)

| Name | Min Width | Devices |
|------|-----------|---------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Usage Example
```tsx
<div className="
  grid
  grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-5   /* Desktop: 5 columns */
">
```

## 4.7 Z-Index Scale

| Level | Value | Use Case |
|-------|-------|----------|
| Base | 0 | Normal content |
| Dropdown | 10 | Dropdowns |
| Sticky | 20 | Sticky headers |
| Fixed | 30 | Fixed elements |
| Modal Backdrop | 40 | Modal overlay |
| Modal | 50 | Modal content |
| Tooltip | 60 | Tooltips |
| Toast | 70 | Notifications |

---

# 5. Application Architecture

## 5.1 Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [Logo]  [Department ▼]  [Semester ▼]     [Week Nav]        │
├─────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                              │
│  [Emploi] [Plan] [Bilan] [Calendrier] [BDD]                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                     PAGE CONTENT                             │
│                                                              │
│                   (varies by tab)                            │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 5.2 Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  JSON Files  │────▶│  React State │────▶│  Components  │
│  (Mock Data) │     │  (useState)  │     │  (UI)        │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ localStorage │
                     │ (Preferences)│
                     └──────────────┘
```

## 5.3 Component Hierarchy

```
App
└── _layout.tsx
    ├── Header
    │   ├── Logo
    │   ├── DepartmentSelector
    │   ├── SemesterSelector
    │   └── WeekNavigator (only on Emploi)
    │
    ├── TabNavigation
    │   └── TabButton (×5)
    │
    └── <Outlet /> (Page Content)
        │
        ├── emploi.tsx
        │   └── ScheduleGrid
        │       ├── TimeSlotHeader
        │       └── DayRow (×6)
        │           └── ScheduleCell (×5)
        │               └── SessionModal (on click)
        │
        ├── plan.tsx
        │   ├── PlanningMatrix
        │   │   ├── WeekHeader (×18)
        │   │   └── PeriodRow (×30)
        │   │       └── PlanningCell
        │   └── CourseLegend
        │
        ├── bilan.tsx
        │   ├── ProgressTable
        │   │   └── ProgressRow (×n)
        │   │       └── ProgressBar
        │   ├── EvaluationTable
        │   └── StatsSummary
        │
        ├── calendrier.tsx
        │   ├── AcademicCalendar
        │   │   └── MonthGrid (×12)
        │   │       └── DateCell (×~30)
        │   └── EventList
        │
        └── bdd.tsx
            ├── TabSelector
            ├── SearchBar
            ├── DataTable
            │   └── TableRow (×n)
            └── DetailPanel
```

---

# 6. Page Specifications

## 6.1 Emploi (Weekly Schedule)

### Purpose
Display the weekly class schedule in a grid format, showing all sessions for a specific week.

### Visual Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Département Informatique Réseaux & Télécommunication (IRT)              │
├─────────────────────────────────────────────────────────────────────────┤
│ Semestre: S3          Semaine: 16         26-janv.-26 au 31-janv.-26   │
│                                                      [◀ Prev] [Next ▶]  │
├──────────┬───────────┬─────────────┬─────────────┬───────────┬─────────┤
│          │ 8h00-9h30 │ 09h45-11h15 │ 11h30-13h00 │15h10-16h40│17h00-18h│
├──────────┼───────────┼─────────────┼─────────────┼───────────┼─────────┤
│          │┌─────────┐│┌───────────┐│┌───────────┐│┌─────────┐│┌───────┐│
│  Lundi   ││ IRT33   │││  IRT34    │││  IRT37    │││ IRT38   │││ IRT38 ││
│          ││ TP  104 │││  TD  104  │││  TP  104  │││TD  [En] │││TD [En]││
│          ││ Hafedh  │││  El Aoun  │││  El Aoun  │││ Elhacen │││Elhacen││
│          │└─────────┘│└───────────┘│└───────────┘│└─────────┘│└───────┘│
├──────────┼───────────┼─────────────┼─────────────┼───────────┼─────────┤
│  Mardi   │    ...    │     ...     │     ...     │    ...    │   ...   │
├──────────┼───────────┼─────────────┼─────────────┼───────────┼─────────┤
│ Mercredi │    ...    │     ...     │     ...     │    ...    │   ...   │
├──────────┼───────────┼─────────────┼─────────────┼───────────┼─────────┤
│  Jeudi   │    ...    │     ...     │     ...     │    ...    │   ...   │
├──────────┼───────────┼─────────────┼─────────────┼───────────┼─────────┤
│ Vendredi │    ...    │     ...     │     ...     │    ...    │   ...   │
├──────────┼───────────┼─────────────┼─────────────┼───────────┼─────────┤
│  Samedi  │    ...    │     ...     │             │           │         │
└──────────┴───────────┴─────────────┴─────────────┴───────────┴─────────┘
```

### Schedule Cell Detail
```
┌────────────────────────────────────┐
│ IRT33  │  TP  │  104  │ [En ligne] │  ← Top row: Code, Type, Room, Badge
├────────────────────────────────────┤
│ Théorie des langages               │  ← Course title (can wrap)
│ et compilation                     │
├────────────────────────────────────┤
│ 👤 Hafedh                          │  ← Teacher with icon
└────────────────────────────────────┘
```

### Cell Color Rules
| Condition | Background Color | Badge |
|-----------|------------------|-------|
| Type = CM | `#1565C0` (Blue) | None |
| Type = TD | `#2E7D32` (Green) | None |
| Type = TP | `#00838F` (Teal) | None |
| Status = exam | `#C62828` (Red) | "Exam" or "EXAMEN" |
| Status = online | Cell color + badge | "En ligne" (green badge) |
| Has "Devoir" tag | `#F9A825` (Gold) | "Devoir" |
| Is military | `#5D4037` (Brown) | "Instruction militaire" |
| Is club | `#7B1FA2` (Purple) | "Club robotique" |
| Empty slot | `#37474F` (Dark Gray) | None |

### Interactions

| User Action | Expected Behavior |
|-------------|-------------------|
| Click on cell | Open modal with full session details |
| Hover on cell | Slight brightness increase, cursor: pointer |
| Click "Prev" arrow | Load previous week (week - 1) |
| Click "Next" arrow | Load next week (week + 1) |
| Change semester dropdown | Load week 1 of selected semester |

### Session Modal Content
When user clicks a cell, show modal with:
```
┌──────────────────────────────────────┐
│  IRT33 - Théorie des langages    [X] │
│  et compilation                      │
├──────────────────────────────────────┤
│  Type:      TP (Travaux Pratiques)   │
│  Horaire:   8h00 - 9h30              │
│  Salle:     104                      │
│  Enseignant: Hafedh                  │
│  Statut:    Planifié                 │
│                                      │
│  Crédits: 2    Coefficient: 2        │
├──────────────────────────────────────┤
│               [Fermer]               │
└──────────────────────────────────────┘
```

### Mobile Layout (< 768px)
- Show one day at a time with horizontal swipe
- Or vertical list view (all slots for one day stacked)
- Day selector at top

---

## 6.2 Plan (Semester Planning Matrix)

### Purpose
Show the full semester at a glance - which courses are scheduled for which weeks.

### Visual Layout
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Plan du Semestre S3                                                          │
├────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┤
│        │ S1   │ S2   │ S3   │ S4   │ S5   │ ...  │ S18  │      │   LÉGENDE  │
│        │6/10  │13/10 │20/10 │27/10 │3/11  │      │ 2/2  │      │            │
├────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤ ■ IRT31    │
│ LUNDI  │      │      │      │      │      │      │      │      │ ■ IRT32    │
│   P1   │CM-31 │CM-31 │TD-32 │      │ EXAM │      │      │      │ ■ IRT33    │
│   P2   │TD-33 │TD-33 │TD-33 │CM-34 │      │      │      │      │ ■ IRT34    │
│   P3   │TP-35 │TP-35 │TP-35 │TP-35 │      │      │      │      │ ■ IRT35    │
│   P4   │      │      │      │      │      │      │      │      │ ■ IRT36    │
│   P5   │      │      │      │      │      │      │      │      │ ■ IRT37    │
├────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤ ■ IRT38    │
│ MARDI  │      │      │      │      │      │      │      │      │ ■ PIE      │
│   P1   │      │      │      │      │      │      │      │      │            │
│   P2   │      │      │      │      │      │      │      │      │ NB séances │
│   ...  │      │      │      │      │      │      │      │      │ CM: 44     │
├────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤ TD: 44     │
│  ...   │      │      │      │      │      │      │      │      │ TP: 56     │
│        │      │      │      │      │      │      │      │      │ Total: 144 │
└────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴────────────┘
```

### Cell Content Format
- `CM-31` = Cours Magistral for IRT31
- `TD-33` = Travaux Dirigés for IRT33
- `TP-35` = Travaux Pratiques for IRT35
- Red background = Exam week
- Yellow border = Current week

### Legend Panel Content
```
┌─────────────────────┐
│      LÉGENDE        │
├─────────────────────┤
│ ■ IRT31 Dev JEE     │  ← Color box + code + short name
│ ■ IRT32 Intel. Art. │
│ ■ IRT33 Théorie Lg. │
│ ■ IRT34 Comm. Num.  │
│ ■ IRT35 Arch. Ordi. │
│ ■ IRT36 Rés. Mob.   │
│ ■ IRT37 Rés. Opér.  │
│ ■ IRT38 IoT         │
│ ■ PIE   Projet      │
├─────────────────────┤
│    NB SÉANCES       │
├─────────────────────┤
│ CM:    44           │
│ TD:    44           │
│ TP:    56           │
│ ─────────────       │
│ Total: 144          │
└─────────────────────┘
```

### Interactions

| User Action | Expected Behavior |
|-------------|-------------------|
| Hover on cell | Show tooltip with course name + teacher |
| Click on cell | Highlight all cells for same course |
| Click on week header | Navigate to that week in Emploi |
| Click legend item | Toggle highlight for that course |
| Hover legend item | Dim all other courses |

### Mobile Layout
- Horizontal scroll for matrix
- Fixed left column (days)
- Legend moves to collapsible bottom sheet

---

## 6.3 Bilan (Progress Tracking)

### Purpose
Track how many sessions have been completed vs planned for each course.

### Visual Layout
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Bilan S3                                    Période: 2-févr au 7-févr-26   │
├────────┬────────────────────────┬──────────────┬──────────────┬────────────┤
│ Code   │ Matière                │     CM       │     TD       │     TP     │
│        │                        │Prév│Eff│  %  │Prév│Eff│  %  │Prév│Eff│ % │
├────────┼────────────────────────┼────┼───┼─────┼────┼───┼─────┼────┼───┼────┤
│ IRT31  │ Développement JEE      │ 6  │ 5 │ 83% │ 6  │ 4 │ 67% │ 12 │12│100%│
│        │ ████████░░             │    │   │     │    │   │     │    │  │    │
├────────┼────────────────────────┼────┼───┼─────┼────┼───┼─────┼────┼───┼────┤
│ IRT32  │ Intelligence artif.    │ 5  │ 4 │ 80% │ 5  │ 5 │100% │ 6  │ 5│ 83%│
│        │ ████████░░             │    │   │     │    │   │     │    │  │    │
├────────┼────────────────────────┼────┼───┼─────┼────┼───┼─────┼────┼───┼────┤
│  ...   │         ...            │... │...│ ... │... │...│ ... │... │..│ ...│
├────────┴────────────────────────┼────┼───┼─────┼────┼───┼─────┼────┼───┼────┤
│                           TOTAL │ 44 │42 │ 95% │ 44 │42 │ 95% │ 56 │53│ 95%│
└─────────────────────────────────┴────┴───┴─────┴────┴───┴─────┴────┴───┴────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ Évaluations                                                                │
├────────┬────────────────────────┬────────────┬────────────┬────────────────┤
│ Code   │ Enseignant             │   Devoir   │   Examen   │   Rattrapage   │
├────────┼────────────────────────┼────────────┼────────────┼────────────────┤
│ IRT31  │ Abderrahmane           │     0      │     0      │       0        │
├────────┼────────────────────────┼────────────┼────────────┼────────────────┤
│ IRT34  │ El Aoun                │     1 ✓    │     1 ✓    │       0        │
├────────┼────────────────────────┼────────────┼────────────┼────────────────┤
│ IRT35  │ Sass                   │     1 ✓    │     0      │       0        │
├────────┼────────────────────────┼────────────┼────────────┼────────────────┤
│  ...   │         ...            │    ...     │    ...     │      ...       │
└────────┴────────────────────────┴────────────┴────────────┴────────────────┘
```

### Progress Bar Component
```
Percentage >= 100%: ██████████ Green (#4CAF50)
Percentage >= 75%:  ████████░░ Light Green (#8BC34A)
Percentage >= 50%:  █████░░░░░ Orange (#FF9800)
Percentage < 50%:   ███░░░░░░░ Red (#F44336)
```

### Column Definitions

| Column | Description | Format |
|--------|-------------|--------|
| Code | Course code | "IRT31" |
| Matière | Course name | Full name |
| Prév (Prévu) | Planned sessions | Number |
| Eff (Effectué) | Completed sessions | Number |
| % | Completion rate | Percentage |

### Interactions

| User Action | Expected Behavior |
|-------------|-------------------|
| Click table header | Sort by that column |
| Click row | Expand to show week-by-week breakdown |
| Hover progress bar | Show exact numbers in tooltip |
| Change period dropdown | Update data for selected period |

### Mobile Layout
- Cards instead of table rows
- Progress bars below each card
- Horizontal scroll for evaluation table

---

## 6.4 Calendrier (Academic Calendar)

### Purpose
Show the full academic year with important dates highlighted.

### Visual Layout
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Calendrier Académique 2025 / 2026                                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  SEPTEMBRE 2025                    │  PLANNING GÉNÉRAL DES COURS           │
│  Lu  Ma  Me  Je  Ve  Sa  Di        │                                       │
│   1   2   3   4   5   6   7        │                                       │
│   8   9  10  11  12  13  14        │                                       │
│  15  16  17  18  19  20  21        │                                       │
│  22  23  24  25  26  27  28        │                                       │
│  29  30                            │                                       │
│                                    │                                       │
│  OCTOBRE 2025                      │  ● Début des cours S1 et S3           │
│  Lu  Ma  Me  Je  Ve  Sa  Di        │    le 6 octobre 2025                  │
│       1   2   3   4   5   6        │                                       │
│  [7]  8   9  10  11  12  13        │  ← Day 7 highlighted (course start)   │
│  14  15  16  17  18  19  20        │                                       │
│  21  22  23  24  25  26  27        │                                       │
│  28  29  30  31                    │                                       │
│                                    │                                       │
│  NOVEMBRE 2025                     │  ● 25/11 : Fête des forces armées     │
│  Lu  Ma  Me  Je  Ve  Sa  Di        │  ● 28/11 : Fête de l'indépendance     │
│                   1   2            │                                       │
│   3   4   5   6   7   8   9        │                                       │
│  10  11  12  13  14  15  16        │                                       │
│  17  18  19  20  21  22  23        │                                       │
│ [24][25] 26  27 [28] 29  30        │  ← Days 25, 28 highlighted            │
│                                    │                                       │
│  ... (continues for all 12 months)                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

### Date Cell States

| State | Visual | Color |
|-------|--------|-------|
| Normal | Plain number | White text |
| Weekend | Dimmed | Gray text |
| Today | Circle outline | Green border |
| Course Start | Filled square | Green background |
| Holiday | Filled square | Yellow background |
| Vacation | Range highlight | Light blue |
| Exam Period | Range highlight | Light red |
| Religious | Filled square | Gold background |

### Event List Panel

```
┌─────────────────────────────────────┐
│      ÉVÉNEMENTS IMPORTANTS          │
├─────────────────────────────────────┤
│ 📅 6 Oct - Début des cours S1/S3    │
│ 🎉 25 Nov - Fête des forces armées  │
│ 🎉 28 Nov - Fête de l'indépendance  │
│ 🏖️ 20 Déc - Vacances (2 semaines)   │
│ 📝 12 Jan - Examens S1/S3           │
│ 📅 16 Fév - Début des cours S2/S4   │
│ 🌙 19 Mar - Al Fitr                 │
│ 🎉 1 Mai - Fête du travail          │
│ 🎉 25 Mai - Fête de l'UA            │
│ 🌙 27 Mai - Al Adha                 │
│ 📝 1 Juin - Examens S2/S4           │
│ 🎓 28 Juin - Cérémonie fin d'année  │
└─────────────────────────────────────┘
```

### Event Type Icons

| Type | Icon | Color |
|------|------|-------|
| course_start | 📅 | Green |
| holiday | 🎉 | Yellow |
| vacation | 🏖️ | Blue |
| exam | 📝 | Red |
| soutenance | 🎓 | Purple |
| religious | 🌙 | Gold |

### Interactions

| User Action | Expected Behavior |
|-------------|-------------------|
| Hover on highlighted date | Show event name in tooltip |
| Click on date | Show event details in sidebar |
| Click on event in list | Scroll to that month |
| Change year selector | Load different academic year |

### Mobile Layout
- Single column of months
- Events shown below each month
- Sticky month header while scrolling

---

## 6.5 BDD (Course Database)

### Purpose
Reference data lookup for courses, teachers, and rooms.

### Visual Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Base de Données                                    🔍 [Rechercher...]      │
├────────────────────────────────────────────────────────────────────────────┤
│ [Matières]  [Enseignants]  [Salles]               ← Sub-tabs              │
├────────┬───────────────────────────┬────────┬───────┬──────────────────────┤
│ Code   │ Titre                     │ Crédit │ Coef. │   Volume Horaire     │
│        │                           │        │       │  CM  │  TD  │  TP    │
├────────┼───────────────────────────┼────────┼───────┼──────┼──────┼────────┤
│ IRT31  │ Développement JEE         │   3    │   3   │   6  │   6  │  12    │
├────────┼───────────────────────────┼────────┼───────┼──────┼──────┼────────┤
│ IRT32  │ Intelligence artificielle │   2    │   2   │   5  │   5  │   6    │
├────────┼───────────────────────────┼────────┼───────┼──────┼──────┼────────┤
│ IRT33  │ Théorie des langages...   │   2    │   2   │   5  │   5  │   6    │
├────────┼───────────────────────────┼────────┼───────┼──────┼──────┼────────┤
│  ...   │           ...             │  ...   │  ...  │ ...  │ ...  │  ...   │
└────────┴───────────────────────────┴────────┴───────┴──────┴──────┴────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ Détails: IRT31 - Développement JEE                                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Enseignants:                          Salles:                             │
│    CM: Abderrahmane                      CM: 104                           │
│    TD: Abderrahmane                      TD: 104                           │
│    TP: Abderrahmane                      TP: Labo IRT                      │
│                                                                            │
│  Crédits: 3          Coefficient: 3          Volume Total: 24h             │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Sub-Tab Contents

**Matières Tab:**
| Column | Description |
|--------|-------------|
| Code | Course code |
| Titre | Full course name |
| Crédit | Credit hours |
| Coef. | Coefficient (GPA weight) |
| CM/TD/TP | Hours per type |

**Enseignants Tab:**
| Column | Description |
|--------|-------------|
| Nom | Teacher name |
| Département | Department |
| Matières | List of courses taught |
| Email | Contact email |

**Salles Tab:**
| Column | Description |
|--------|-------------|
| Code | Room code |
| Nom | Room name |
| Capacité | Seating capacity |
| Équipements | Equipment list |

### Interactions

| User Action | Expected Behavior |
|-------------|-------------------|
| Type in search | Filter table in real-time |
| Click column header | Sort ascending/descending |
| Click row | Show detail panel below table |
| Switch sub-tab | Show different data table |
| Clear search | Reset table to show all |

### Mobile Layout
- Card-based layout
- Search at top (sticky)
- Detail panel as bottom sheet

---

# 7. Component Library

## 7.1 Layout Components

### Header Component
```tsx
// File: src/components/layout/Header.tsx

interface HeaderProps {
  department: string;
  semester: string;
  week?: number;
  onDepartmentChange: (dept: string) => void;
  onSemesterChange: (sem: string) => void;
  onWeekChange?: (week: number) => void;
  showWeekNav?: boolean;
}

// Departments list
const DEPARTMENTS = ['IRT', 'GC', 'GM', 'GE'];

// Semesters list
const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
```

### TabNavigation Component
```tsx
// File: src/components/layout/TabNavigation.tsx

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const TABS: Tab[] = [
  { id: 'emploi', label: 'Emploi', icon: Calendar, path: '/emploi' },
  { id: 'plan', label: 'Plan', icon: LayoutGrid, path: '/plan' },
  { id: 'bilan', label: 'Bilan', icon: BarChart, path: '/bilan' },
  { id: 'calendrier', label: 'Calendrier', icon: CalendarDays, path: '/calendrier' },
  { id: 'bdd', label: 'BDD', icon: Database, path: '/bdd' },
];
```

## 7.2 Schedule Components

### ScheduleCell Component
```tsx
// File: src/components/schedule/ScheduleCell.tsx

interface ScheduleCellProps {
  session: Session | null;
  course?: Course;
  onClick?: (session: Session) => void;
  isHighlighted?: boolean;
}

// States:
// - Empty (no session)
// - Filled (has session)
// - Highlighted (on hover or selection)

// Styling logic:
function getCellBackgroundColor(session: Session, course: Course): string {
  if (session.status === 'exam') return 'var(--cell-exam)';
  if (session.tags?.includes('Instruction militaire')) return 'var(--cell-military)';
  if (session.tags?.includes('Club')) return 'var(--cell-club)';

  switch (session.type) {
    case 'CM': return 'var(--cell-cm)';
    case 'TD': return 'var(--cell-td)';
    case 'TP': return 'var(--cell-tp)';
    default: return course.color;
  }
}
```

### SessionModal Component
```tsx
// File: src/components/schedule/SessionModal.tsx

interface SessionModalProps {
  session: Session;
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

// Content to display:
// - Course code and name
// - Session type (full name)
// - Time slot (start - end)
// - Room
// - Teacher
// - Status
// - Credits and coefficient
```

## 7.3 UI Components

### Badge Component
```tsx
// File: src/components/ui/Badge.tsx

interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

// Variants:
// - default: Gray background
// - success: Green background (for "En ligne")
// - warning: Yellow/Gold background (for "Devoir")
// - danger: Red background (for "Exam")
// - info: Blue background
```

### ProgressBar Component
```tsx
// File: src/components/bilan/ProgressBar.tsx

interface ProgressBarProps {
  value: number;      // 0-100
  max?: number;       // Default 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Color logic:
function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'var(--progress-complete)';
  if (percentage >= 75) return 'var(--progress-good)';
  if (percentage >= 50) return 'var(--progress-warning)';
  return 'var(--progress-danger)';
}
```

### Tooltip Component
```tsx
// File: src/components/ui/Tooltip.tsx

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // ms before showing
}
```

### Modal Component
```tsx
// File: src/components/ui/Modal.tsx

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// Features:
// - Click outside to close
// - ESC key to close
// - Focus trap
// - Backdrop overlay
```

---

# 8. State Management

## 8.1 Application State

```typescript
// File: src/types/state.ts

interface AppState {
  // Navigation
  selectedDepartment: string;  // Default: 'IRT'
  selectedSemester: string;    // Default: 'S3'
  currentWeek: number;         // Default: 16

  // UI State
  activeTab: TabId;
  isModalOpen: boolean;
  selectedSession: Session | null;

  // Filters
  searchQuery: string;
  selectedCourseFilter: string | null;
}
```

## 8.2 State Location

| State | Where to Store | Why |
|-------|----------------|-----|
| Department, Semester | URL params or localStorage | Persist across sessions |
| Current Week | URL params | Shareable links |
| Active Tab | URL path | React Router handles this |
| Modal Open | Component state | Temporary UI state |
| Selected Session | Component state | Temporary UI state |
| Search Query | Component state | No need to persist |

## 8.3 Custom Hooks

### useSchedule Hook
```typescript
// File: src/hooks/useSchedule.ts

function useSchedule(semester: string, week: number) {
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load schedule data from JSON
    loadSchedule(semester, week)
      .then(setSchedule)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [semester, week]);

  return { schedule, loading, error };
}
```

### useLocalStorage Hook
```typescript
// File: src/hooks/useLocalStorage.ts

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

---

# 9. Data Models & Types

## 9.1 Complete Type Definitions

See file: `src/types/index.ts` (already created)

## 9.2 Data Validation

### Course Validation
```typescript
function isValidCourse(data: unknown): data is Course {
  if (typeof data !== 'object' || data === null) return false;

  const course = data as Record<string, unknown>;

  return (
    typeof course.code === 'string' &&
    typeof course.title === 'string' &&
    typeof course.credits === 'number' &&
    typeof course.coefficient === 'number' &&
    isValidHours(course.hours) &&
    isValidTeachers(course.teachers) &&
    isValidRooms(course.rooms)
  );
}
```

### Session Validation
```typescript
function isValidSession(data: unknown): data is Session {
  if (typeof data !== 'object' || data === null) return false;

  const session = data as Record<string, unknown>;

  return (
    typeof session.id === 'string' &&
    typeof session.courseCode === 'string' &&
    isValidSessionType(session.type) &&
    isValidDay(session.day) &&
    typeof session.timeSlot === 'number' &&
    session.timeSlot >= 0 &&
    session.timeSlot <= 4
  );
}
```

---

# 10. User Stories & Acceptance Criteria

## 10.1 Emploi Page Stories

### US-E1: View Weekly Schedule
**As a** user
**I want to** see the weekly class schedule
**So that** I know what classes are happening when

**Acceptance Criteria:**
- [ ] Grid displays 6 days (Monday-Saturday) as rows
- [ ] Grid displays 5 time slots as columns
- [ ] Each cell shows course code, type, room, and teacher
- [ ] Cells are color-coded by course type
- [ ] Empty slots are visually distinct (gray)
- [ ] Header shows department, semester, week number, and date range

### US-E2: Navigate Between Weeks
**As a** user
**I want to** move between different weeks
**So that** I can see past and future schedules

**Acceptance Criteria:**
- [ ] "Previous" button loads the previous week
- [ ] "Next" button loads the next week
- [ ] Week number and date range update accordingly
- [ ] First week of semester shows "no previous" state
- [ ] Last week of semester shows "no next" state

### US-E3: View Session Details
**As a** user
**I want to** click on a session to see full details
**So that** I can get more information about the class

**Acceptance Criteria:**
- [ ] Clicking a cell opens a modal
- [ ] Modal shows: course name, type, time, room, teacher, credits
- [ ] Modal can be closed by clicking X, clicking outside, or pressing ESC
- [ ] Modal has smooth open/close animation

### US-E4: Identify Special Sessions
**As a** user
**I want to** easily identify exams, online classes, and special events
**So that** I can prepare accordingly

**Acceptance Criteria:**
- [ ] Exam sessions have red background and "Exam" badge
- [ ] Online sessions have "En ligne" green badge
- [ ] Devoir sessions have gold background and "Devoir" badge
- [ ] Military instruction has brown background
- [ ] Club activities have purple background

## 10.2 Plan Page Stories

### US-P1: View Semester Overview
**As a** user
**I want to** see all 18 weeks at once
**So that** I can understand the semester structure

**Acceptance Criteria:**
- [ ] Matrix shows 18 columns (one per week)
- [ ] Rows are grouped by day, with periods (P1-P5) under each day
- [ ] Each cell shows abbreviated course code
- [ ] Cells are color-coded to match course colors in legend

### US-P2: View Course Legend
**As a** user
**I want to** see a legend explaining the colors
**So that** I can understand what each color means

**Acceptance Criteria:**
- [ ] Legend panel shows all courses with their colors
- [ ] Legend shows session count totals (CM, TD, TP)
- [ ] Hovering over legend item highlights that course in matrix
- [ ] Clicking legend item toggles course highlight

### US-P3: Navigate to Specific Week
**As a** user
**I want to** click a week header to jump to that week's schedule
**So that** I can quickly see details for a specific week

**Acceptance Criteria:**
- [ ] Clicking week header navigates to Emploi page
- [ ] Emploi page loads with the clicked week selected
- [ ] Transition is smooth and URL updates

## 10.3 Bilan Page Stories

### US-B1: View Progress Summary
**As a** user
**I want to** see how many sessions have been completed
**So that** I can track course progress

**Acceptance Criteria:**
- [ ] Table shows all courses with planned vs completed counts
- [ ] Progress bar visualizes completion percentage
- [ ] Colors indicate status (green=100%, yellow=75%+, orange=50%+, red=<50%)
- [ ] Total row shows overall statistics

### US-B2: Sort Progress Table
**As a** user
**I want to** sort the table by different columns
**So that** I can find specific information quickly

**Acceptance Criteria:**
- [ ] Clicking column header sorts by that column
- [ ] First click sorts ascending, second click sorts descending
- [ ] Sort indicator (arrow) shows current sort column and direction
- [ ] Sorting is instant (no loading state)

### US-B3: View Evaluation Status
**As a** user
**I want to** see which evaluations have been completed
**So that** I can track exam and assignment status

**Acceptance Criteria:**
- [ ] Evaluation table shows Devoir, Examen, Rattrapage columns
- [ ] Completed evaluations show checkmark (✓)
- [ ] Numbers show count of completed evaluations
- [ ] Table is separate from progress table

## 10.4 Calendrier Page Stories

### US-C1: View Academic Year Calendar
**As a** user
**I want to** see the full academic year on one page
**So that** I can see all important dates at a glance

**Acceptance Criteria:**
- [ ] All 12 months displayed (September to August)
- [ ] Each month shows correct day layout
- [ ] Weekends are visually dimmed
- [ ] Current day (if visible) has special indicator

### US-C2: Identify Important Dates
**As a** user
**I want to** see highlighted dates for events
**So that** I know what's happening when

**Acceptance Criteria:**
- [ ] Course start dates highlighted in green
- [ ] Holidays highlighted in yellow
- [ ] Vacation periods highlighted in blue
- [ ] Exam periods highlighted in red
- [ ] Religious holidays highlighted in gold

### US-C3: View Event Details
**As a** user
**I want to** see details about events
**So that** I understand what each highlighted date means

**Acceptance Criteria:**
- [ ] Event list panel shows all events chronologically
- [ ] Each event shows date, icon, and title
- [ ] Hovering over highlighted date shows tooltip with event name
- [ ] Clicking event scrolls to that month

## 10.5 BDD Page Stories

### US-D1: Browse Courses
**As a** user
**I want to** see a list of all courses
**So that** I can find course information

**Acceptance Criteria:**
- [ ] Table shows all courses for selected semester
- [ ] Columns: Code, Title, Credits, Coefficient, Hours
- [ ] Data matches actual course database
- [ ] Table is scrollable if many courses

### US-D2: Search Courses
**As a** user
**I want to** search for specific courses
**So that** I can quickly find what I'm looking for

**Acceptance Criteria:**
- [ ] Search input at top of page
- [ ] Typing filters table in real-time
- [ ] Search matches code, title, and teacher name
- [ ] Clear button resets search
- [ ] "No results" message when nothing matches

### US-D3: View Course Details
**As a** user
**I want to** see full details for a course
**So that** I can see teachers and room assignments

**Acceptance Criteria:**
- [ ] Clicking row expands detail panel
- [ ] Detail shows teachers for CM, TD, TP
- [ ] Detail shows rooms for CM, TD, TP
- [ ] Only one course can be expanded at a time

### US-D4: Switch Data Views
**As a** user
**I want to** switch between courses, teachers, and rooms
**So that** I can view different types of data

**Acceptance Criteria:**
- [ ] Three tabs: Matières, Enseignants, Salles
- [ ] Each tab shows appropriate table
- [ ] Search filters apply to current tab only
- [ ] Tab state persists during session

---

# 11. Implementation Guide

## 11.1 Development Order

Follow this order for easiest development:

### Phase 1: Foundation (Days 1-2)
1. Set up project structure (folders, files)
2. Configure Tailwind with custom colors
3. Create type definitions
4. Import mock data

### Phase 2: Layout (Days 3-4)
5. Build Header component
6. Build TabNavigation component
7. Create _layout.tsx with routing
8. Style global elements

### Phase 3: Emploi Page (Days 5-7)
9. Build ScheduleGrid component
10. Build ScheduleCell component
11. Build TimeSlotHeader component
12. Build DayRow component
13. Build WeekNavigator component
14. Build SessionModal component
15. Assemble emploi.tsx page

### Phase 4: Plan Page (Days 8-9)
16. Build PlanningMatrix component
17. Build PlanningCell component
18. Build CourseLegend component
19. Assemble plan.tsx page

### Phase 5: Bilan Page (Days 10-11)
20. Build ProgressTable component
21. Build ProgressBar component
22. Build EvaluationTable component
23. Build StatsSummary component
24. Assemble bilan.tsx page

### Phase 6: Calendrier Page (Days 12-13)
25. Build MonthGrid component
26. Build DateCell component
27. Build EventList component
28. Assemble calendrier.tsx page

### Phase 7: BDD Page (Days 14-15)
29. Build DataTable component
30. Build SearchBar component
31. Build DetailPanel component
32. Assemble bdd.tsx page

### Phase 8: Polish (Days 16-17)
33. Add loading states
34. Add error handling
35. Responsive testing
36. Accessibility review
37. Performance optimization

## 11.2 Step-by-Step: Building ScheduleCell

Here's an example of how to build a component from scratch:

### Step 1: Create the file
```bash
touch src/components/schedule/ScheduleCell.tsx
```

### Step 2: Define props interface
```tsx
import type { Session, Course } from '@/types';

interface ScheduleCellProps {
  session: Session | null;
  course?: Course;
  onClick?: (session: Session) => void;
}
```

### Step 3: Build basic structure
```tsx
export function ScheduleCell({ session, course, onClick }: ScheduleCellProps) {
  // Handle empty cell
  if (!session) {
    return (
      <div className="h-20 bg-slate-800/50 rounded-md border border-slate-700/50" />
    );
  }

  return (
    <div
      className="h-20 rounded-md p-2 cursor-pointer"
      onClick={() => onClick?.(session)}
    >
      {/* Content goes here */}
    </div>
  );
}
```

### Step 4: Add content sections
```tsx
return (
  <div className="...">
    {/* Header row: Code, Type, Room, Badge */}
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold">{session.courseCode}</span>
      <span>{session.type}</span>
      <span>{session.room}</span>
      {session.tags?.includes('En ligne') && (
        <Badge variant="success" size="sm">En ligne</Badge>
      )}
    </div>

    {/* Course title */}
    <div className="text-sm mt-1 line-clamp-2">
      {course?.title}
    </div>

    {/* Teacher */}
    <div className="text-xs text-slate-300 mt-1">
      👤 {session.teacher}
    </div>
  </div>
);
```

### Step 5: Add dynamic styling
```tsx
function getCellStyle(session: Session): string {
  const baseClasses = "h-20 rounded-md p-2 cursor-pointer transition-all";

  // Determine background color
  let bgColor = "bg-slate-700";

  if (session.status === 'exam') {
    bgColor = "bg-red-700";
  } else if (session.type === 'CM') {
    bgColor = "bg-blue-700";
  } else if (session.type === 'TD') {
    bgColor = "bg-green-700";
  } else if (session.type === 'TP') {
    bgColor = "bg-teal-700";
  }

  return `${baseClasses} ${bgColor} hover:brightness-110`;
}
```

### Step 6: Add hover state
```tsx
const [isHovered, setIsHovered] = useState(false);

return (
  <div
    className={getCellStyle(session)}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    onClick={() => onClick?.(session)}
  >
    {/* ... */}
  </div>
);
```

### Step 7: Export and test
```tsx
// At bottom of file
export default ScheduleCell;
```

Test in isolation before using in parent component.

---

# 12. Testing Requirements

## 12.1 Manual Testing Checklist

### Emploi Page
- [ ] All 6 days display correctly
- [ ] All 5 time slots display correctly
- [ ] Cell colors match session type
- [ ] Badges appear for special sessions
- [ ] Click opens modal with correct data
- [ ] Week navigation works both directions
- [ ] Empty cells are visually distinct

### Plan Page
- [ ] All 18 weeks display as columns
- [ ] All periods display as rows
- [ ] Cells show correct course codes
- [ ] Legend shows all courses
- [ ] Hover highlights work
- [ ] Click navigates to Emploi

### Bilan Page
- [ ] Progress table shows correct percentages
- [ ] Progress bars have correct colors
- [ ] Sorting works on all columns
- [ ] Evaluation table shows checkmarks
- [ ] Totals are calculated correctly

### Calendrier Page
- [ ] All 12 months display
- [ ] Events are highlighted correctly
- [ ] Event list shows all events
- [ ] Tooltips work on highlighted dates
- [ ] Dates are accurate for 2025/2026

### BDD Page
- [ ] Course table shows all courses
- [ ] Search filters correctly
- [ ] Detail panel shows correct info
- [ ] Sub-tabs switch correctly
- [ ] Sorting works

### General
- [ ] Tab navigation works
- [ ] Header dropdowns work
- [ ] Responsive on mobile (test at 375px width)
- [ ] No console errors
- [ ] All links work

## 12.2 Browser Testing

Test on these browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Chrome on Android
- Safari on iOS

## 12.3 Responsive Testing

Test at these breakpoints:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1440px, 1920px

---

# 13. Accessibility Requirements

## 13.1 WCAG 2.1 AA Compliance

### Color Contrast
- Text must have 4.5:1 contrast ratio against background
- Large text (18px+) must have 3:1 contrast ratio
- Use WebAIM Contrast Checker to verify

### Keyboard Navigation
- All interactive elements must be focusable
- Focus order must be logical (top to bottom, left to right)
- Focus indicators must be visible
- Modal must trap focus

### Screen Reader Support
- All images must have alt text
- Tables must have proper headers
- Buttons must have accessible names
- Modals must announce when opened

## 13.2 Implementation

### Focus Styles
```css
/* Add visible focus indicators */
:focus-visible {
  outline: 2px solid var(--esp-green-500);
  outline-offset: 2px;
}
```

### Accessible Schedule Cell
```tsx
<button
  role="gridcell"
  aria-label={`${course.title}, ${session.type}, ${session.room}, avec ${session.teacher}`}
  className="..."
  onClick={() => onClick?.(session)}
>
  {/* content */}
</button>
```

### Accessible Modal
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">{title}</h2>
  {/* content */}
</div>
```

---

# 14. Performance Requirements

## 14.1 Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Total Bundle Size | < 500KB (gzipped) |
| Page Switch Time | < 100ms |

## 14.2 Optimization Techniques

### Code Splitting
```tsx
// Lazy load pages
const EmploiPage = lazy(() => import('./pages/emploi'));
const PlanPage = lazy(() => import('./pages/plan'));
```

### Memoization
```tsx
// Memoize expensive components
const ScheduleCell = memo(function ScheduleCell({ session, course, onClick }: Props) {
  // ...
});

// Memoize computed values
const sortedCourses = useMemo(() => {
  return [...courses].sort((a, b) => a.code.localeCompare(b.code));
}, [courses]);
```

### Image Optimization
- Use SVG for icons (Lucide React)
- Lazy load images below the fold
- Use appropriate image formats

---

# 15. Error Handling

## 15.1 Error States

### Data Loading Error
```tsx
function SchedulePage() {
  const { schedule, loading, error } = useSchedule(semester, week);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger l'emploi du temps"
        retry={() => window.location.reload()}
      />
    );
  }

  return <ScheduleGrid schedule={schedule} />;
}
```

### Empty State
```tsx
function CourseTable({ courses }: Props) {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<FileX />}
        title="Aucune matière trouvée"
        description="Essayez de modifier votre recherche"
      />
    );
  }

  return (
    <table>
      {/* ... */}
    </table>
  );
}
```

### Not Found
```tsx
// 404 page for invalid routes
function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4">Page non trouvée</p>
      <Link to="/emploi" className="mt-8 btn btn-primary">
        Retour à l'emploi du temps
      </Link>
    </div>
  );
}
```

## 15.2 Error Messages (French)

| Error Type | Message |
|------------|---------|
| Data loading | "Impossible de charger les données" |
| Network | "Erreur de connexion réseau" |
| Not found | "Page non trouvée" |
| Empty search | "Aucun résultat trouvé" |
| Invalid input | "Veuillez vérifier votre saisie" |

---

# 16. Future Considerations

## 16.1 Phase 2: Backend Integration

When backend is ready:
- Replace JSON imports with API calls
- Add loading states for async data
- Implement error handling for API failures
- Add authentication flow

## 16.2 Phase 3: Full Features

Future features to plan for:
- Drag-and-drop scheduling
- Real-time conflict detection
- Teacher payment calculations
- PDF/Excel export
- Push notifications
- Multi-language support

## 16.3 Technical Debt to Address

- Add unit tests
- Add E2E tests
- Set up CI/CD pipeline
- Add Storybook for component documentation
- Implement proper caching

---

# Appendix A: Quick Reference

## A.1 File Templates

### New Page Template
```tsx
// src/pages/example.tsx

import { PageContainer } from '@/components/layout/PageContainer';

export default function ExamplePage() {
  return (
    <PageContainer title="Example">
      {/* Page content */}
    </PageContainer>
  );
}
```

### New Component Template
```tsx
// src/components/example/ExampleComponent.tsx

interface ExampleProps {
  // Define props
}

export function ExampleComponent({ ...props }: ExampleProps) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

## A.2 Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## A.3 Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Document End**

*Last updated: February 1, 2026*
