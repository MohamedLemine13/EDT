# CLAUDE.md

**ESP Dashboard** - Academic management platform for ESP (École Supérieure Polytechnique). Modern React UI to replace Google Sheets-based scheduling.

## Tech Stack

Vite, React 19, TypeScript, Generouted (file-based routing), Tailwind CSS v4, shadcn/ui (new-york), Lucide Icons

## Commands

`pnpm dev` | `pnpm build` | `pnpm lint` | `pnpm preview`

## Structure

```
src/
├── pages/           # File-based routes (generouted)
│   ├── _layout.tsx  # Main layout with header + tabs
│   ├── index.tsx    # Home / Emploi (weekly schedule)
│   ├── plan.tsx     # Semester planning matrix
│   ├── bilan.tsx    # Progress tracking
│   ├── calendrier.tsx # Academic calendar
│   └── bdd.tsx      # Course database
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── schedule/    # Schedule grid components
│   ├── planning/    # Planning matrix components
│   ├── bilan/       # Progress tracking components
│   ├── calendar/    # Calendar components
│   └── database/    # Database table components
├── hooks/           # Custom React hooks
├── lib/             # Utilities (cn, etc.)
└── data/            # Mock JSON data
```

## Design System (ESP Branding)

### Colors
```css
/* Primary - ESP Green */
--esp-green-dark: #1B5E20;
--esp-green-main: #2E7D32;
--esp-green-light: #4CAF50;
--esp-green-pale: #E8F5E9;

/* Secondary */
--esp-gold: #FFB300;

/* Session Types */
--cell-cm: #1565C0;      /* Cours Magistral - Blue */
--cell-td: #2E7D32;      /* TD - Green */
--cell-tp: #00838F;      /* TP - Teal */
--cell-exam: #C62828;    /* Exam - Red */
```

## Auto-Imports

These work without imports (via unplugin-auto-import):
- React hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
- Router: `useNavigate`, `useParams`, `useLocation`, `Link`
- Utility: `cn()` for class merging

## File-Based Routing

| File | Route |
|------|-------|
| `pages/index.tsx` | `/` |
| `pages/plan.tsx` | `/plan` |
| `pages/bilan.tsx` | `/bilan` |
| `pages/calendrier.tsx` | `/calendrier` |
| `pages/bdd.tsx` | `/bdd` |
| `pages/users/[id].tsx` | `/users/:id` |

## Skills (Use When Applicable)

| Skill | Use When |
|-------|----------|
| `find-ui` | Searching for UI components (tables, tabs, calendars) |
| `generate-ui` | Creating custom React components with 21st.dev Magic AI |
| `ui-ux-pro-max` | Design systems, color palettes, typography, UX guidelines |

## UI Registries (32+ available)

Core: `@shadcn`, `@origin`
Animations: `@magicui`, `@aceternity`, `@animate-ui`
Blocks: `@blocks`, `@shadcnblocks`, `@intentui`
Data: `@diceui`
Forms: `@formcn`

Install components:
```bash
pnpm dlx shadcn@latest add @shadcn/button
pnpm dlx shadcn@latest add @blocks/stats-03
```

## PRD Reference

See `docs/PRD.md` for complete requirements including:
- Page specifications (Emploi, Plan, Bilan, Calendrier, BDD)
- Component architecture
- Data structures (TypeScript interfaces)
- Interaction patterns

## Commands (Custom)

| Command | Purpose |
|---------|---------|
| `/explore-and-plan` | EPCT workflow for new features |
| `/sync-claude-md` | Update CLAUDE.md with codebase changes |
| `/find-ui` | Search UI components across registries |
| `/generate-ui` | Create custom components with AI |

## See Also

- PRD: `docs/PRD.md`
- Workflow: `.claude/WORKFLOW_GUIDE.md`
- Domain rules: `.claude/rules/schedule-domain.md`
- Component patterns: `.claude/rules/component-patterns.md`
- Implementation plans: `.claude/plans/`
