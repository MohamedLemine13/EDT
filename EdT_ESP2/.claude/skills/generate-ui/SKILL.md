---
name: generate-ui
description: Generate custom UI components using 21st.dev Magic AI. Use /generate-ui [description] to create new React components. Example: /generate-ui schedule grid with colored cells
allowed-tools: mcp__magic__21st_magic_component_builder, mcp__magic__21st_magic_component_inspiration, mcp__magic__21st_magic_component_refiner, mcp__magic__logo_search, Write, Edit, Read
---

# Generate UI Component

Create custom React components using 21st.dev Magic AI-powered generation.

## Usage

```
/generate-ui [component description]
```

## Examples for ESP Dashboard

```
/generate-ui weekly schedule grid with time slots and days
/generate-ui semester planning matrix with color-coded cells
/generate-ui progress tracking table with percentage bars
/generate-ui academic calendar with highlighted events
/generate-ui course database table with search and filters
/generate-ui dark mode header with department selector
/generate-ui tab navigation bar with 5 tabs
/generate-ui schedule cell with course info and type badge
```

## Tools Available

| Tool | Purpose |
|------|---------|
| `21st_magic_component_builder` | Generate new components from description |
| `21st_magic_component_inspiration` | Get inspiration from 21st.dev library |
| `21st_magic_component_refiner` | Improve existing components |
| `logo_search` | Find brand logos (SVG/TSX) |

## Generation Process

1. Parse user description
2. Create search query for 21st.dev
3. Call `21st_magic_component_builder` with:
   - message: full description
   - searchQuery: 2-4 word component type
   - absolutePathToProjectDirectory: /Users/ahmede/Documents/dev/web/esp-dashboard
   - standaloneRequestQuery: detailed requirements
4. Receive 3 component variations
5. Write selected component to project

## Project Context

- **Path**: `/Users/ahmede/Documents/dev/web/esp-dashboard`
- **Style**: shadcn new-york, Tailwind v4, neutral base
- **Components**: `src/components/` or `src/pages/`
- **TypeScript**: Strict mode
- **Theme**: ESP Green (#1B5E20, #2E7D32, #4CAF50)

## Output Integration

After generation:
1. Save to appropriate directory (src/components/)
2. Add required imports
3. Export from index if needed
4. Verify TypeScript compatibility
5. Apply ESP brand colors if needed

## Refinement

To improve an existing component:
```
/generate-ui refine src/components/ScheduleCell.tsx - add hover animation
```
