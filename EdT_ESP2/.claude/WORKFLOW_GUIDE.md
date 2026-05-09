# ESP Dashboard Development Workflow Guide

**Last Updated**: 2026-02-01

This guide explains how all the Claude Code components work together to improve your development workflow.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  PLAN    │───▶│  CODE    │───▶│  TEST    │───▶│  DEPLOY  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       ▼               ▼               ▼               ▼             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    AUTOMATION LAYER                          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  Hooks (auto-trigger)  │  Agents       │  Skills             │   │
│  │  - lint on edit        │  - Explore    │  - find-ui          │   │
│  │  - PRD reminders       │  - Plan       │  - generate-ui      │   │
│  │  - type update alert   │               │  - ui-ux-pro-max    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 KNOWLEDGE LAYER                              │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  Rules (always-on)     │  PRD (reference)                   │   │
│  │  - schedule-domain.md  │  - Page specifications              │   │
│  │  - component-patterns  │  - Component library                │   │
│  │  - CLAUDE.md          │  - Data models                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. CREATING A NEW PAGE

### Step 1: Plan the Page

```bash
# Option A: Use the explore-and-plan command
/explore-and-plan

# Option B: Ask Claude to plan
"Plan the implementation of the Emploi (schedule) page"
```

**What happens automatically:**
- Claude reads PRD Section 6 for page specs
- Reads rules/schedule-domain.md for data patterns
- Explores codebase for similar patterns
- Creates a plan following your conventions

### Step 2: Reference the PRD

For each page, check:
| Page       | PRD Section | Key Specs                        |
|------------|-------------|----------------------------------|
| Emploi     | 6.1         | 6×5 grid, cell colors, modal     |
| Plan       | 6.2         | 18-week matrix, legend panel     |
| Bilan      | 6.3         | Progress bars, sortable tables   |
| Calendrier | 6.4         | 12-month view, event highlighting|
| BDD        | 6.5         | 3 sub-tabs, search, detail panel |

### Step 3: Create Components

Follow the PRD component structure:
```
src/components/
├── schedule/      ← PRD Section 7.2
├── planning/      ← PRD Section 7.2
├── bilan/         ← PRD Section 7.2
├── calendar/      ← PRD Section 7.2
└── database/      ← PRD Section 7.2
```

### Step 4: Hooks Auto-Trigger

As you code, hooks fire automatically:

| When You Edit                        | Hook Fires           | Reminder                          |
| ------------------------------------ | -------------------- | --------------------------------- |
| `src/components/schedule/**/*.tsx`   | schedule-component   | Check PRD 6.1 for Emploi specs    |
| `src/components/planning/**/*.tsx`   | planning-component   | Check PRD 6.2 for Plan specs      |
| `src/types/**/*.ts`                  | types-change         | Update schedule-domain.md rule    |
| `src/data/**/*.json`                 | mock-data            | Ensure matches types/index.ts     |

---

## 2. BUILDING COMPONENTS

### Using UI Skills

```bash
# Find existing components
/find-ui table
/find-ui calendar
/find-ui progress bar

# Generate custom components
/generate-ui schedule grid with colored cells
/generate-ui week navigation arrows

# Design decisions
"Use ui-ux-pro-max for color palette recommendations"
```

### Component Checklist

For each component, verify:
- [ ] Matches PRD visual layout (Section 6)
- [ ] Uses correct colors from design system (PRD 4.1)
- [ ] Follows component patterns (rules/component-patterns.md)
- [ ] Has proper TypeScript types
- [ ] Handles empty/loading/error states

---

## 3. DATA & TYPES

### Type Definitions (PRD Section 9)

```bash
# When adding new types
"Check PRD Section 9 for the Course interface definition"

# When data doesn't match
"Validate mock data against types/index.ts"
```

### Mock Data Location

```
src/data/
├── courses.json          # Course metadata
├── schedule-week16.json  # Weekly schedule
├── calendar-2025-2026.json  # Academic calendar
└── progress-s3.json      # Bilan data
```

---

## 4. STYLING GUIDE

### ESP Brand Colors (PRD 4.1)

```tsx
// Primary green (ESP brand)
className="bg-green-700"           // --esp-green-800
className="text-green-500"         // --esp-green-500

// Session type colors
className="bg-blue-700"            // CM (Cours Magistral)
className="bg-green-700"           // TD (Travaux Dirigés)
className="bg-teal-700"            // TP (Travaux Pratiques)
className="bg-red-700"             // Exam
```

### Dark Theme (Default)

```tsx
// Backgrounds
className="bg-slate-950"           // Page
className="bg-slate-900"           // Cards
className="bg-slate-800"           // Nested elements

// Text
className="text-white"             // Primary
className="text-slate-300"         // Secondary
className="text-slate-500"         // Muted
```

---

## 5. QUICK COMMANDS

### Development

| Command       | Purpose              |
|---------------|----------------------|
| `pnpm dev`    | Start dev server     |
| `pnpm build`  | Build for production |
| `pnpm lint`   | Run ESLint           |
| `pnpm preview`| Preview build        |

### Claude Commands

| Command             | Purpose                        |
|---------------------|--------------------------------|
| `/explore-and-plan` | EPCT workflow for features     |
| `/sync-claude-md`   | Update CLAUDE.md with codebase |
| `/find-ui`          | Search for UI components       |
| `/generate-ui`      | Create custom components       |

---

## 6. IMPLEMENTATION ORDER

From PRD Section 11:

### Phase 1: Foundation
1. Set up project structure
2. Configure Tailwind with custom colors
3. Create type definitions
4. Import mock data

### Phase 2: Layout
5. Build Header component
6. Build TabNavigation component
7. Create _layout.tsx with routing

### Phase 3-7: Pages (in order)
- Emploi (Schedule) → Plan (Matrix) → Bilan (Progress) → Calendrier → BDD

---

## 7. TROUBLESHOOTING

### "Hook didn't fire"

Hooks only fire on `Edit` tool with matching path patterns. Check:
- File path matches pattern in hooks.json
- Using Edit tool (not Write for new files)

### "Skill not loading"

Mention the domain explicitly:
- "For this schedule component..." → loads schedule skills
- "Find a table component..." → loads find-ui skill

### "Colors don't match PRD"

Check:
1. PRD Section 4.1 for color values
2. rules/schedule-domain.md for session colors
3. Tailwind config for custom colors

### "Component structure unclear"

Reference:
1. PRD Section 7 (Component Library)
2. rules/component-patterns.md
3. Similar existing components

---

## 8. COMPLETE WORKFLOW EXAMPLE

### Example: Building the ScheduleCell Component

```bash
# 1. Check PRD specs
"Show me PRD Section 7.2 ScheduleCell Component requirements"

# 2. Find similar UI patterns
/find-ui grid cell

# 3. Check domain rules
"Read rules/schedule-domain.md for cell color logic"

# 4. Create component
"Create ScheduleCell.tsx following the PRD spec"

# 5. Hook fires reminder
# 📅 Schedule component modified!
#    Reference: docs/PRD.md Section 6.1 (Emploi Page)

# 6. Verify implementation
pnpm lint
pnpm build
```

---

**This workflow is designed to:**

1. **Keep you aligned with PRD** - Hooks remind about specifications
2. **Leverage skills** - UI search and generation tools
3. **Maintain consistency** - Rules enforce patterns
4. **Scale with project** - Structure supports all 5 pages
