---
story_id: "016"
epic_id: "002"
title: Toast Notifications
status: in-progress
---

# Toast Notifications

## Context

Toasts provide feedback only when the UI doesn't already convey the outcome. Score updates, lock indicators, and other in-place changes don't need toasts. Toasts are reserved for errors and confirmations where the result isn't visually apparent.

## Scope

### In Scope

- Toast notification component
- Success, error, and info variants
- Auto-dismiss with configurable duration
- Position: bottom-right (desktop), top-center (mobile)
- Stack behavior for multiple toasts

### Out of Scope

- Persistent notifications
- Action buttons within toasts

## Acceptance Criteria

**Given** an error occurs (e.g., persistence failure, unexpected state)
**When** the operation fails
**Then** an error toast displays actionable feedback

**Given** an action completes but the UI doesn't show the change
**When** feedback is needed
**Then** a toast confirms the action

**Given** multiple toasts in quick succession
**When** they are triggered
**Then** they stack appropriately without overlapping

**Given** a toast is displayed
**When** the duration elapses
**Then** it auto-dismisses with a fade animation

**Given** mobile viewport
**When** a toast appears
**Then** it displays at top-center

## Implementation

1. Create `UiToast` component with variants (error, info)
2. Create toast composable (`useToast`) for triggering from anywhere
3. Configure positioning based on viewport
4. Implement stack management (newest at bottom for desktop, top for mobile)
5. Use toasts for:
   - Errors (persistence failures, unexpected state)
   - Game cleared/abandoned confirmation
   - Any action where the outcome isn't visible in the UI

## Constraints

- Do NOT toast for changes already visible in the UI (scores, locks, skips)
- Keep toasts brief (2-3 seconds for info, longer for errors)
- Errors should be actionable or at least informative
