---
story_id: "005"
epic_id: "001"
title: Game Setup View
status: ready
---

# Game Setup View

## Context

Before playing, users add players to the game. This is the entry point when no game is in progress. The interface should be simple and touch-friendly.

## Scope

### In Scope

- Add player by name input
- Display list of added players
- Remove player before game starts
- Start game button (disabled until 2+ players)
- Navigation to in-progress game if one exists
- "New Game" action in secondary navigation (menu, not prominent button)
- Confirmation dialog before abandoning an in-progress game

### Out of Scope

- Player profiles or saved names
- Reordering players

## Acceptance Criteria

**Given** the app loads with no active game
**When** the setup view renders
**Then** an empty player list and add player input are shown

**Given** a player name is entered
**When** the add button is pressed
**Then** the player appears in the list and input clears

**Given** players in the list
**When** tapping remove on a player
**Then** they are removed from the list

**Given** fewer than 2 players
**When** viewing the start button
**Then** it is disabled

**Given** 2+ players added
**When** tapping start game
**Then** the game initializes and navigates to score entry

**Given** an active game exists
**When** the app loads
**Then** it navigates directly to the game view

**Given** a game is in progress
**When** the user taps "New Game"
**Then** a confirmation dialog warns that the current game will be lost

**Given** the abandon game confirmation
**When** the user confirms
**Then** the current game is cleared and setup view appears

**Given** the abandon game confirmation
**When** the user cancels
**Then** they remain in the current game

## Implementation

1. Create `SetupView.vue` in presentation/views
2. Instantiate `GameService` with repository (per @rules/vue-patterns.md: views instantiate services):
   ```typescript
   const repo = new IndexedDBGameRepository()
   const service = new GameService(repo)
   ```
3. Local reactive state for pending player list (not persisted until start)
4. Input with add button, autofocus on load
5. Player list with remove buttons
6. Start game button that calls `GameService.startGame()`
7. Router guard to redirect to game view if active game exists
8. Add "New Game" action to menu (hamburger/overflow menu, not main action bar):
   - Position: secondary, tucked away from primary actions
   - Visual treatment: no prominent styling (not a CTA button)
   - Only visible during active gameplay
9. Confirmation dialog component (`UiConfirmDialog`) for destructive action:
   - Destructive styling on confirm button
   - Clear warning about data loss
10. On confirm: call `GameService.clearGame()` and navigate to setup

## Constraints

- Touch-friendly button sizes (min 44px tap targets)
- Keyboard: Enter to add player
