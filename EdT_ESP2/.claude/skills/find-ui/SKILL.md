---
name: find-ui
description: Quick UI component search across all registries. Use /find-ui [query] to search for components. Example: /find-ui button, /find-ui sidebar, /find-ui table
allowed-tools: mcp__shadcn__search_items_in_registries, mcp__shadcn__get_project_registries, mcp__shadcn__view_items_in_registries, mcp__shadcn__get_add_command_for_items
---

# Find UI Component

Quick search across 32+ configured registries for the ESP Dashboard.

## Usage
```
/find-ui [search query]
```

## Registry Quick Reference

### By Category

| Category | Registries to Search |
|----------|---------------------|
| Core UI | @shadcn, @origin |
| Animations | @magicui, @aceternity, @animate-ui, @motion, @fancy |
| Blocks | @blocks, @shadcnblocks, @ui-layouts, @intentui, @hextaui |
| Styles | @glass-ui, @neobrutalism, @cult-ui |
| Specialized | @diceui (data/dashboards), @formcn (forms) |

### Best For ESP Dashboard

| Need | Best Registries | Components |
|------|-----------------|------------|
| Tables/Grids | @shadcn, @blocks, @diceui | data-table, table-03 |
| Tabs | @shadcn, @origin | tabs |
| Sidebar | @shadcn, @blocks | sidebar-07 |
| Stats/Cards | @blocks, @magicui | stats-03, magic-card |
| Calendar | @shadcn | calendar |
| Charts | @shadcn | chart (79 variants) |
| Forms/Selects | @shadcn, @formcn | select, dropdown-menu |

## Search Process

1. Parse query to identify component type
2. Select relevant registries from table above
3. Search with: `mcp__shadcn__search_items_in_registries`
4. Return top results with install commands

## Output Format

```markdown
## Results for "[query]"

### Top Picks
| Component | Registry | Why |
|-----------|----------|-----|
| name | @registry | reason |

### Install
pnpm dlx shadcn@latest add @registry/component
```

## Examples

```
/find-ui table           # → @shadcn, @blocks, @diceui
/find-ui tabs            # → @shadcn, @origin
/find-ui sidebar         # → @shadcn, @blocks
/find-ui calendar        # → @shadcn
/find-ui stats card      # → @blocks, @magicui
/find-ui dropdown        # → @shadcn, @origin
/find-ui schedule grid   # → @shadcn, @diceui
```
