---
story_id: "009"
epic_id: "001"
title: Summary View
status: ready
---

# Summary View

## Context

During gameplay, users need a quick view of current standings. This portrait-oriented view shows player rankings by total score without emphasizing a "winner" until the game ends.

## Scope

### In Scope

- Player list sorted by total score (lowest first)
- Total score displayed per player
- Current round indicator
- Visual indicator for skipped players
- Navigation back to score entry

### Out of Scope

- Per-round breakdown (scorecard view, story 010)
- Winner emphasis (end game view, story 011)
- Orientation-based auto-switching (story 010)

## Acceptance Criteria

**Given** a game in progress
**When** viewing the summary
**Then** players are listed from lowest to highest total score

**Given** players with tied scores
**When** viewing the summary
**Then** tied players show the same rank

**Given** a player skipped for some rounds
**When** viewing the summary
**Then** they appear with a "Skipped" badge or indicator

**Given** the summary view
**When** tapping a navigation element
**Then** the user returns to score entry for current round

## Implementation

1. Create domain function `calculateRankings(game: Game): PlayerRanking[]` in `domain/services/`:
   - Sum scores per player (skipped rounds contribute 0)
   - Sort ascending (lowest score wins)
   - Assign ranks with tie handling (tied players share rank)
   - Returns array of `{ playerId, playerName, rank, total, hasSkippedRounds }`
2. Create `SummaryView.vue` in presentation/views
3. Call domain ranking function, render the result
4. Display as ordered list with rank, name, total
5. Add "Skipped" badge for players with `hasSkippedRounds` flag
6. Include "current round" badge and navigation

## Constraints

- Do not highlight "leader" or "winner" during gameplay
- Keep styling neutral and informational
