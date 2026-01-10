---
story_id: "011"
epic_id: "001"
title: Game Completion
status: completed
completed_date: 2026-01-10
---

# Game Completion

## Context

This story addresses several related UX concerns: ending a game to see final results, navigating between rounds with proper validation, and starting a new game. Without lock/unlock, validation gates round advancement to ensure data integrity.

## Scope

### In Scope

- Hard validation gate: require valid scores before advancing to next round
- Swipe navigation between rounds on mobile
- End game action and final results with winner emphasis
- "New Game" action accessible during gameplay
- Reopen ended game to make corrections

### Out of Scope

- Game history/saving past games
- Sharing results
- Filtering players by skip status in standings

## Acceptance Criteria

### Round Navigation & Validation

**Given** a round with invalid scores (no zero, invalid values)
**When** the user attempts to navigate to the next round
**Then** navigation is blocked and validation errors are shown inline

**Given** a round with valid scores
**When** the user swipes left or taps "Next"
**Then** the app advances to the next round

**Given** any round
**When** the user swipes right or taps "Previous"
**Then** the app navigates to the previous round (no validation required for backward navigation)

**Given** a round where all players are skipped
**When** navigating forward
**Then** the round is valid (skip-all is a legitimate complete state)

### End Game

**Given** all 7 rounds are complete (valid scores or all players skipped)
**When** the user is on round 7
**Then** "End Game" appears as a primary action

**Given** any round is incomplete
**When** viewing the game
**Then** "End Game" is not available

**Given** the user taps "End Game"
**When** confirming the action
**Then** the game enters ended state and navigates to StandingsView with winner emphasis

**Given** an ended game
**When** viewing standings
**Then** the winner (lowest score) is visually emphasized; ties show multiple winners

### New Game

**Given** a game in progress or ended
**When** accessing the menu
**Then** "New Game" option is visible

**Given** the user taps "New Game"
**When** a game has scores entered
**Then** a confirmation dialog warns about losing the current game

**Given** the confirmation is accepted
**When** the dialog closes
**Then** the game is cleared and the app navigates to setup

### Reopen Game

**Given** an ended game in standings view
**When** the user taps "Edit Scores" (or similar)
**Then** the game returns to score entry at round 7, ended state is cleared

## Implementation

1. **Round navigation validation**
   - Before advancing (next/swipe-left), validate current round:
     - All non-skipped players have scores
     - Exactly one player has score 0 (or all players skipped)
     - All scores are valid (0-300, divisible by 5)
   - Show inline validation errors if blocked
   - Backward navigation always allowed

2. **Swipe gesture support**
   - Add touch event handlers to ScoreEntryView
   - Swipe left = attempt next (with validation)
   - Swipe right = go previous
   - Keep button controls as fallbacks

3. **End game flow**
   - Show "End Game" button on round 7 when all rounds are complete
   - A round is complete if: valid scores entered, or all players skipped
   - Confirmation dialog: "End game and see final results?"
   - Set `game.isEnded = true` and persist
   - Navigate to StandingsView

4. **Winner emphasis in StandingsView**
   - When `game.isEnded`, add visual emphasis to rank 1 player(s)
   - Subtle styling: larger text, accent color, or trophy icon
   - Handle ties (multiple players at rank 1)

5. **New Game UI**
   - Add menu button (hamburger or overflow) to ScoreEntryView header
   - Menu contains "New Game" action
   - Reuse existing confirmation dialog pattern
   - On confirm: `GameService.clearGame()` → navigate to setup

6. **Reopen from ended state**
   - In StandingsView when ended, show "Edit Scores" or back arrow
   - Sets `game.isEnded = false` and navigates to ScoreEntryView

## Constraints

- Winner emphasis should be clear but not flashy (monochrome MVP)
- Ties handled gracefully (co-winners at rank 1)
- Swipe gestures must not conflict with horizontal scroll in landscape scorecard
- Validation errors appear inline, not as blocking modals
