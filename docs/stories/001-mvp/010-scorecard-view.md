---
story_id: "010"
epic_id: "001"
title: Scorecard View
status: ready
---

# Scorecard View

## Context

A detailed grid view showing all players vs all rounds, similar to a paper scorecard. This landscape-oriented view provides full visibility into the game state.

## Scope

### In Scope

- Players as rows, rounds as columns
- Score displayed in each cell
- Skipped rounds shown as dash
- Round winner (score 0) subtly highlighted
- Total column
- Round type names accessible (tap header for full name, or include legend)
- Toggle or navigation between summary and scorecard

### Out of Scope

- Inline editing (use score entry view)
- Orientation-based auto-switching

## Acceptance Criteria

**Given** a game with scores entered
**When** viewing the scorecard
**Then** a grid displays players × rounds with all scores

**Given** a skipped round for a player
**When** viewing their cell
**Then** it displays a dash (—)

**Given** the round winner (score 0)
**When** viewing their cell
**Then** it is subtly distinguished (e.g., bold or background)

**Given** a round type abbreviation
**When** tapping the column header
**Then** the full round name is displayed (e.g., "2B" → "2 Books")

**Given** the scorecard on a narrow screen
**When** content overflows
**Then** horizontal scrolling is available

## Implementation

1. Create `ScorecardView.vue` or scorecard component
2. Build grid with:
   - Sticky player name column
   - Scrollable round columns
   - Sticky total column (optional)
3. Round type headers:
   - Abbreviations as column headers (e.g., "2B", "1B1R")
   - Tap column header to reveal full round name (tooltip or inline expansion)
   - Alternative: include legend mapping abbreviations to full names
4. Cell rendering: score, dash for skip, highlight for zero
5. Add view toggle in UI (button or tab)

## Constraints

- Horizontal scroll is acceptable for many players
- Keep text readable (don't over-compress)
