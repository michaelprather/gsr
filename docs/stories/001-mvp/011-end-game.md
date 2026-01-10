---
story_id: "011"
epic_id: "001"
title: End Game Flow
status: ready
---

# End Game Flow

## Context

When all rounds are complete, users explicitly end the game to see final results. The game can be reopened for corrections.

## Scope

### In Scope

- End game action (available when all rounds have scores)
- Final results display with winner emphasis
- Player rankings with total scores
- Reopen game action (with confirmation)
- Start new game action

### Out of Scope

- Game history/saving past games
- Sharing results

## Acceptance Criteria

**Given** all 7 rounds have scores entered
**When** the user views the game
**Then** the UI transforms: "End Game" becomes the primary action, visually prominent

**Given** not all rounds have scores
**When** viewing the end game option
**Then** it is disabled with feedback about remaining rounds

**Given** round 7 scores were just entered
**When** returning to score entry view
**Then** a clear visual cue indicates the game is ready to end (e.g., banner, highlighted action)

**Given** the game is ended
**When** viewing final results
**Then** players are ranked lowest to highest with the winner emphasized

**Given** the game is ended
**When** "Reopen Game" is pressed
**Then** a confirmation appears; if accepted, game returns to editable state

**Given** the game is ended
**When** "New Game" is pressed
**Then** current game is cleared and setup view appears

## Implementation

1. Add end game state detection and prominent action:
   - When all rounds locked, show "End Game" as primary action (not buried)
   - Consider banner or state change that signals "Game Complete"
2. Create `EndGameView.vue` for final results:
   - Winner celebration (subtle, not over the top)
   - Full rankings with scores
   - Reopen and New Game buttons
3. Reopen triggers confirmation, then sets `game.isEnded = false`
4. New Game calls `GameService.clearGame()` and navigates to setup

## Constraints

- Winner emphasis should be clear but not flashy (remember: monochrome MVP)
- Ties handled gracefully (co-winners)
