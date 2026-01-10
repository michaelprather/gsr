---
story_id: "004"
epic_id: "001"
title: Game Application Service
status: ready
---

# Game Application Service

## Context

The application layer orchestrates game operations, coordinating between domain logic and persistence. This service is the single entry point for all game mutations.

## Scope

### In Scope

- GameService with all game operations
- Automatic persistence after mutations
- Operation validation before execution

### Out of Scope

- UI state management
- Reactive bindings (handled by presentation layer)

## Acceptance Criteria

**Given** valid player names
**When** starting a new game
**Then** a game is created with 7 rounds and persisted

**Given** a valid score
**When** setting a player's score for a round
**Then** the score is recorded and game is persisted

**Given** an invalid operation (e.g., modifying locked round)
**When** attempting the operation
**Then** a ValidationError is thrown with appropriate feedback

## Implementation

1. Create `GameService` class:
   ```typescript
   class GameService {
     constructor(private readonly repo: GameRepository) {}

     async startGame(playerNames: string[]): Promise<Game>
     async loadGame(): Promise<Game | null>
     async setScore(playerId: string, roundIndex: number, score: number): Promise<Game>
     async skipPlayer(playerId: string, roundIndex: number, allFuture: boolean): Promise<Game>
     async lockRound(roundIndex: number): Promise<Game>
     async unlockRound(roundIndex: number): Promise<Game>
     async endGame(): Promise<Game>
     async reopenGame(): Promise<Game>
     async clearGame(): Promise<void>
   }
   ```
2. Each mutation validates via domain, applies change, persists, returns updated game
3. Throw `ValidationError` with `Feedback` for invalid operations

## Constraints

- Service is stateless
- All mutations persist immediately
- Domain validation happens before persistence
