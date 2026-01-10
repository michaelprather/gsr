---
story_id: "007"
epic_id: "001"
title: Player Skip Functionality
status: completed
---

# Player Skip Functionality

## Context

Players may need to leave mid-game or miss rounds. The app supports skipping a player for a single round or all remaining rounds while keeping them visible in standings.

## Scope

### In Scope

- Skip player for current round only
- Skip player for all future rounds ("skip rest of game")
- Visual indicator for skipped players (dash: — and "Skipped" label)
- Skipped players excluded from "exactly one zero" validation
- Undo skip for current round (before lock)
- Skipped players still appear in standings with their total
- Score and skip are mutually exclusive: entering one clears the other

### Out of Scope

- Removing players entirely
- Retroactive skipping of past locked rounds

## Acceptance Criteria

**Given** a player in the current round
**When** "skip this round" is selected
**Then** their score input is replaced with "Skipped" indicator (dash: —) and they're excluded from validation

**Given** a player in the current round
**When** "skip all future rounds" is selected
**Then** they're skipped for this and all subsequent rounds

**Given** a player skipped for this round only
**When** advancing to next round
**Then** they are active again (can enter scores)

**Given** a player skipped for all future rounds
**When** advancing to next round
**Then** they remain skipped automatically

**Given** a round with all players skipped
**When** attempting to validate
**Then** validation fails (need at least one active player with score 0)

## Implementation

1. Add skip action to each player row in ScoreEntryView:
   - Tap player row or dedicated action to reveal skip options
   - Options: "Skip this round" / "Skip rest of game"
   - Score input and skip are mutually exclusive states
2. State transitions:
   - Entering a score clears any skip for that round
   - Skipping clears any entered score for that round
   - Un-skip restores empty input (not previous value)
3. Update domain `Player.skipFromRound` property
4. Modify round validation to exclude skipped players
5. Display skipped player with "Skipped" indicator (dash: —) instead of input
6. Allow un-skip for current round only (before lock)

## Constraints

- Cannot un-skip a player who chose "skip all future" for a previous round
- Skipped players' totals only include rounds they participated in
