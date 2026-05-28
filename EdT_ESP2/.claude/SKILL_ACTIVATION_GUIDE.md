# Skill Activation Guide

**Problem**: Skills exist but Claude rarely uses them (~20% activation rate)
**Solution**: Optimized descriptions + forced evaluation = 84% activation rate

---

## Why Skills Don't Activate

Claude uses **pure LLM reasoning** to select skills - no algorithmic matching. The description is injected into the system prompt, and Claude decides if it's relevant. Poor descriptions = poor activation.

**Common Issues:**

| Issue                    | Impact   |
| ------------------------ | -------- |
| No "Use when..." trigger | CRITICAL |
| Too vague description    | HIGH     |
| No examples              | MEDIUM   |
| Missing keywords         | MEDIUM   |

---

## The Fix: Optimized Descriptions

### Formula

```
[What it does] + [Use when: specific triggers] + [Keywords]
```

### Rules

1. **Always third person** - Never "I can help" or "You can use"
2. **Include "Use when..."** - Explicit trigger conditions
3. **5+ trigger keywords** - Words users naturally say
4. **Examples if applicable** - Concrete usage scenarios

### Before/After Examples

**Bad:**

```yaml
description: UI components for dashboards.
```

**Good:**

```yaml
description: Find UI components across all configured registries (shadcn, magicui, blocks, etc). Use when searching for tables, grids, tabs, calendars, schedule grids, or any UI component. Covers data tables, calendar views, progress bars, badges.
```

---

## Activation Rates by Approach

| Approach               | Success Rate | Effort |
| ---------------------- | ------------ | ------ |
| No optimization        | ~20%         | -      |
| Optimized descriptions | ~50%         | Low    |
| + CLAUDE.md references | ~70%         | Medium |
| + Forced eval hook     | **84%**      | Medium |

---

## CLAUDE.md Strategy

### Should Skills Be Listed in CLAUDE.md?

**No** - Don't list skills in CLAUDE.md. Instead:

1. Write excellent skill descriptions (Claude auto-discovers)
2. Mention _concepts_ skills handle: "We use shadcn/ui components"
3. Reference skills indirectly: "See find-ui skill for component search"

### Keep CLAUDE.md Lean

| Move to Skill        | Move to Rule               | Keep in CLAUDE.md   |
| -------------------- | -------------------------- | ------------------- |
| Component guidelines | schedule-domain.md         | Tech stack          |
| Detailed patterns    | component-patterns.md      | Commands            |
| Data structures      | Already in PRD             | Key patterns        |
|                      |                            | Non-obvious gotchas |

---

## Quick Reference: Skill Description Template

```yaml
---
name: skill-name
description: |
  [One sentence: what it does].
  Use when: [trigger 1], [trigger 2], [trigger 3], or [trigger 4].
  [Optional: Covers X, Y, Z.]
---
```

**Keywords to include:**

- Action verbs: building, implementing, fixing, debugging, reviewing, optimizing
- Domain terms: the specific technologies, patterns, file types
- User intent: "help me", "how do I", "show me", "fix", "create"

---

## ESP Dashboard Skills

| Skill           | Trigger Keywords                                      |
| --------------- | ----------------------------------------------------- |
| `find-ui`       | component, table, grid, calendar, badge, progress bar |
| `generate-ui`   | create component, custom UI, build interface          |
| `ui-ux-pro-max` | design, colors, typography, styles, UX, dark theme    |

---

## Sources

- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Skill Activation Reliability Testing](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
