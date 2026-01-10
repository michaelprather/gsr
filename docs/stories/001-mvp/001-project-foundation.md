---
story_id: "001"
epic_id: "001"
title: Project Foundation
status: in-progress
---

# Project Foundation

## Context

The George Street Rummy Scorekeeper needs a Vue 3 project with proper folder structure following SPA architecture conventions. This establishes the foundation for all subsequent work.

## Scope

### In Scope

- Vue 3 + Vite project scaffolding
- TypeScript configuration
- Folder structure per SPA conventions (domain, application, infrastructure, presentation)
- Base CSS reset and monochrome theme tokens
- Mobile-first viewport configuration
- PWA manifest for home screen installation

### Out of Scope

- Service worker caching (story 012)
- Any feature implementation
- Animations or visual polish

## Acceptance Criteria

**Given** a developer clones the repository
**When** they run the dev server
**Then** a blank app renders with proper viewport scaling on mobile

**Given** the project structure
**When** reviewing the folder layout
**Then** it follows the SPA layer conventions (domain, application, infrastructure, presentation)

**Given** the CSS tokens
**When** inspecting available variables
**Then** monochrome semantic tokens exist for surfaces, borders, text, and spacing

## Implementation

1. Initialize Vue 3 + Vite + TypeScript project
2. Create folder structure:
   ```
   src/
   ├── core/
   ├── domain/
   ├── application/
   ├── infrastructure/
   └── presentation/
       ├── components/
       ├── views/
       └── composables/
   ```
3. Configure CSS with:
   - Reset/normalize
   - Monochrome semantic tokens (--surface, --border, --text, --text-muted, --space-*)
   - Mobile-first base styles
4. Add PWA manifest with app name and icons
5. Configure viewport meta tag for mobile

## Constraints

- No external UI component libraries
- CSS tokens only (no Tailwind or utility frameworks)
