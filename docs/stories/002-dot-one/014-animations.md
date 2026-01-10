---
story_id: "014"
epic_id: "002"
title: Animations and Transitions
status: completed
completed_date: 2026-01-10
---

# Animations and Transitions

## Context

Subtle animations improve perceived quality and help users understand state changes. This story adds motion design that enhances clarity without slowing down the scoring workflow.

## Scope

### In Scope

- Page/view transitions
- List item animations (add/remove players)
- Score update feedback
- Loading states
- Button press feedback

### Out of Scope

- Game-ending celebration (separate story)
- Sound effects

## Acceptance Criteria

**Given** navigation between views
**When** transitioning
**Then** a subtle fade or slide animation occurs

**Given** a player is added to the list
**When** the list updates
**Then** the new item animates in smoothly

**Given** a score is saved
**When** the value commits
**Then** subtle feedback confirms the action

**Given** animations enabled
**When** using the app
**Then** interactions feel responsive (animations < 300ms)

## Implementation

1. Define animation tokens:
   - Duration scale (--duration-fast, --duration-normal)
   - Easing functions
2. Add Vue transition components for:
   - Route changes
   - List mutations
   - Conditional content
3. Implement micro-interactions:
   - Button press scale
   - Input focus transitions
4. Respect `prefers-reduced-motion` media query

## Constraints

- Animations must not block user input
- Respect accessibility preferences for reduced motion
- Keep total animation time under 300ms
