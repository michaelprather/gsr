---
story_id: "006"
epic_id: "001"
title: Score Entry View
status: completed
---

# Score Entry View

## Context

The primary game interface where users enter scores for each round. This view must clearly show the current round, allow score input per player, and display validation feedback.

## Scope

### In Scope

- Current round display with round type name
- Score input for each non-skipped player
- Real-time validation feedback (increments of 5, max 300)
- Empty inputs by default (no pre-filled values)
- Proactive hint when no player has score 0 (round winner required)
- Cumulative totals per player (from locked rounds only)
- Round navigation: prev/next buttons plus tappable round indicator for direct access

### Out of Scope

- Lock/unlock functionality (story 008)
- Skip player functionality (story 007)
- Orientation-based view switching (story 010)

## Acceptance Criteria

**Given** a round in progress
**When** viewing the score entry
**Then** the round type (e.g., "2 Books") is displayed prominently

**Given** a player's score input
**When** entering a value not divisible by 5
**Then** validation feedback appears immediately

**Given** a player's score input
**When** entering a value > 300
**Then** validation feedback appears immediately

**Given** all players have entered scores
**When** no player has score 0
**Then** a proactive hint displays indicating a round winner is required

**Given** player totals displayed
**When** viewing during score entry
**Then** totals reflect only locked rounds (current round not included until locked)

**Given** round 3 is active
**When** tapping previous
**Then** round 2 is displayed (if navigable)

**Given** any round is active
**When** tapping the round indicator
**Then** a round picker allows direct navigation to any round

## Implementation

1. Create `ScoreEntryView.vue` as primary game view
2. Instantiate `GameService` with repository (per @rules/vue-patterns.md: views instantiate services)
3. Manage `currentRoundIndex` as view-local state (not domain state):
   - Initialize from first unlocked round or derive from game progress
   - Persist in route params or session storage for resume
4. Display round type from `RoundType` enum
5. Numeric input per player with:
   - Label showing player name
   - Empty input (placeholder dash or blank, not pre-filled 0)
   - Inline validation feedback
6. Proactive validation hint: when all non-skipped players have values but none is 0, show hint below inputs
7. Show cumulative total next to each player (sum of locked rounds only)
8. Round navigation: prev/next buttons plus tappable round indicator that opens picker
9. Wire to `GameService.setScore()`

## Constraints

- Validate on blur or submit, not on every keystroke
- Touch-friendly numeric inputs
- Clear visual hierarchy: round type > player scores > totals
