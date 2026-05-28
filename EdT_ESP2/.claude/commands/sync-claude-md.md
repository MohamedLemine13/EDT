---
allowed-tools: Bash(git:*), Read, Write, Glob, Grep, Edit, Task
description: Analyze codebase changes and update CLAUDE.md with current state
---

# Sync CLAUDE.md Memory File

Update CLAUDE.md to reflect current codebase state. **Goal: Minimal context for maximum utility.**

## Philosophy: What Claude Actually Needs

CLAUDE.md should answer: "What do I need to know to write code here that I can't discover by reading files?"

- **Patterns** (how things connect) > **Details** (what files exist)
- **Conventions** (how to do things) > **Inventory** (what exists)
- **Gotchas** (what's non-obvious) > **Documentation** (what's obvious)

## Analysis Phase

Launch 2 agents in parallel using Task tool with subagent_type='Explore':

1. **Architecture Delta**
   - NEW page routes in `src/pages/`
   - NEW component directories
   - NEW hooks or utilities
   - REMOVED directories

2. **Breaking Changes**
   - Major dependency updates
   - Renamed patterns or conventions
   - New architectural requirements

## What CLAUDE.md Must Contain (Essential Only)

### 1. Identity (2-3 lines)

```markdown
**ESP Dashboard** - Academic management platform for ESP. Modern React UI to replace Google Sheets scheduling.
```

### 2. Tech Stack (NO versions unless breaking)

```markdown
Vite, React 19, TypeScript, Generouted, Tailwind CSS v4, shadcn/ui, Lucide Icons
```

### 3. Commands (one-liners only)

```markdown
`pnpm dev` | `pnpm build` | `pnpm lint` | `pnpm preview`
```

### 4. Structure (top-level only)

```markdown
src/: pages/ (routes) | components/ (by feature) | hooks/ | lib/ | data/ | types/
```

### 5. Patterns (HOW to do things)

- Import conventions: `@/components/ui`, `@/hooks`
- Component structure: layout → schedule → planning → bilan → calendar → database
- State access: useState for UI, props for data flow

### 6. Domain Model (types that matter)

- Session, Course, TimeSlot - one line each
- Only include if understanding structure is non-obvious

### 7. Non-Obvious Gotchas

- Colors: CM=blue, TD=green, TP=teal, exam=red
- Days: 6 days (includes Saturday)
- Generouted: file-based routing

## What MUST NOT Be in CLAUDE.md

| Exclude           | Why                            | Alternative              |
| ----------------- | ------------------------------ | ------------------------ |
| Version numbers   | Discoverable from package.json | Omit                     |
| File paths        | Discoverable via Glob/Grep     | Omit                     |
| Code snippets     | Read from actual files         | Omit                     |
| Full PRD content  | Already in docs/PRD.md         | Reference only           |
| Component details | Read from components           | Omit                     |
| Data structures   | Already in types/index.ts      | One-line summaries only  |

## Target Metrics

| Metric   | Target  | Current |
| -------- | ------- | ------- |
| Lines    | 80-120  | Check   |
| Tokens   | <1,500  | Check   |
| Sections | 5-7     | Check   |

**If CLAUDE.md exceeds 120 lines, it has too much detail.**

## Update Process

1. Read current CLAUDE.md
2. For each section ask: "Can Claude discover this by reading code?"
   - YES → Delete it
   - NO → Keep it (condensed)
3. Check for redundancy between sections
4. Verify line count is 80-120

## Rules Files Maintenance

Also check and update `.claude/rules/` files:

### schedule-domain.md

Trigger: Changes in `src/types/` or `src/data/`

- New session types?
- New time slots?
- Data structure changes?

### component-patterns.md

Trigger: Changes in `src/components/`

- New shared patterns?
- New UI conventions?

## Output

Report:
- CLAUDE.md: lines before → after
- Rules updated: which files and why
- Warnings: any rules that may be stale
