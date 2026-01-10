---
story_id: "013"
epic_id: "002"
title: Visual Theme and Color System
status: ready
---

# Visual Theme and Color System

## Context

The MVP uses monochrome wireframe styling. This story establishes a cohesive color palette, refined typography, and visual hierarchy that makes the app feel polished and intentional.

## Scope

### In Scope

- Color palette (primary, accent, semantic colors)
- Typography scale refinement
- Surface and shadow system
- Button, input, and card styling
- Consistent spacing and rhythm

### Out of Scope

- Dark mode (roadmap item)
- Custom themes
- Animations (separate story)

## Acceptance Criteria

**Given** the updated theme
**When** viewing any screen
**Then** colors, typography, and spacing feel cohesive and intentional

**Given** interactive elements
**When** viewing buttons and inputs
**Then** they have clear visual states (default, hover, focus, disabled)

**Given** the color palette
**When** reviewing accessibility
**Then** text meets WCAG AA contrast requirements

## Implementation

1. Define color tokens:
   - Primary/accent for actions
   - Success/warning/error for feedback
   - Neutral scale for surfaces and text
2. Refine typography:
   - Size scale (--text-xs through --text-xl)
   - Weight usage guidelines
3. Update component styles:
   - Buttons with proper state styling
   - Inputs with focus rings
   - Cards/surfaces with subtle shadows
4. Audit all screens for consistency

## Constraints

- Maintain mobile-first sizing
- Colors should work in bright outdoor light (card game context)
