---
description: Explore codebase, create implementation plan, code, test following EPCT workflow
allowed-tools: Task, Read, Write, Edit, Grep, Glob, Bash, TodoWrite, mcp__context7__*, mcp__sequential-thinking__*
argument-hint: "[task-description]"
---

# Explore, Plan, Code, Test (EPCT) Workflow

**Core Principles**:
- Research → Planning → Implementation
- Parallel execution for efficiency
- Strategic compaction between phases

## Phase 1: EXPLORE

### Step 1: Parallel Research
Launch parallel agents:

```yaml
Agent 1 - Codebase Explorer:
  Find similar implementations and patterns
  Map file structure and integration points
  Returns: Pattern catalog with file:line refs

Agent 2 - Research Specialist (if external deps):
  Use Context7 for official docs
  Validate version compatibility
  Returns: Framework guidance
```

### Step 2: Compact Findings
Extract ONLY high-value insights.

### Expected Output
```markdown
## EXPLORATION SUMMARY

### Similar Implementations
- Feature: [name] at `[file:line]`
  Pattern: [description]

### Established Patterns
- Pattern: [name] - Usage: [where/how]

### Integration Points
- `[file:line]` - [connection point]

### Key Insights
- [Actionable insight 1]
```

---

## Phase 2: PLAN

### Step 1: Think Hard
Use `mcp__sequential-thinking__sequentialthinking`:
1. Analyze findings, identify best approach
2. Consider alternatives and tradeoffs
3. Break into implementable phases
4. Define success criteria

### Step 2: Ask Clarifying Questions
**Pause** if unclear. Ask user before continuing.

### Step 3: Document Plan
```markdown
# Implementation Plan: [Feature]

## Overview
[Goal statement]

## Phases

### Phase 1: Core
- [ ] Create `[file]` with [component]
- [ ] Implement [function]
- [ ] Verify: `pnpm lint`

### Phase 2: Integration
- [ ] Integrate with `[existing-file:line]`
- [ ] Verify: No breaking changes

## Success Criteria
- [ ] [Measurable outcome]

## Risks
- Risk: [description] → Mitigation: [strategy]
```

---

## Phase 3: CODE

### Follow Plan Systematically
- Follow existing codebase style
- Use TodoWrite to track progress
- Run `pnpm lint` after each phase
- Update checkboxes in plan

### Quality Gates
- [ ] Follows existing patterns
- [ ] Linting passes
- [ ] Type checking passes

---

## Phase 4: TEST

### Validation
```bash
pnpm lint
pnpm build
```

- If pass → Done
- If fail → Go back to planning, think hard, fix

---

## ESP Dashboard Specific

### Page Implementation Order (from PRD)
1. Foundation → Layout → Emploi → Plan → Bilan → Calendrier → BDD

### Always Check
- PRD Section 6 for page specifications
- PRD Section 7 for component library
- PRD Section 9 for data models

### Key Patterns
- Session types: CM, TD, TP (different colors)
- Days: Lundi-Samedi (6 days)
- Time slots: 5 periods
- Cell states: empty, filled, highlighted, exam, online

---

## When to Use

✅ New page implementation
✅ Complex components (ScheduleGrid, PlanningMatrix)
✅ System changes affecting multiple components

❌ Simple styling fixes
❌ Minor tweaks
❌ Single component updates
