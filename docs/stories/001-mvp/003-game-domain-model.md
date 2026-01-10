---
story_id: "003"
epic_id: "001"
title: Game Domain Model
status: ready
---

# Game Domain Model

## Context

The domain layer defines the core game structure: players, rounds, scores, and game state. This includes validation logic that enforces game rules without any UI or persistence concerns.

## Scope

### In Scope

- Player entity (name, skip status)
- Round entity (type, scores, lock status)
- Game aggregate (players, rounds, state)
- Score validation rules
- Round completion validation
- Value objects for score and round type

### Out of Scope

- UI components
- Persistence
- Score calculation (app records, doesn't calculate)

## Acceptance Criteria

**Given** a score value
**When** validating
**Then** it passes if >= 0, <= 300, and divisible by 5

**Given** scores for a round
**When** validating round completion
**Then** exactly one player must have score 0 (excluding skipped players)

**Given** a player marked "skip all future rounds"
**When** entering a subsequent round
**Then** they are automatically excluded from scoring

**Given** a locked round
**When** attempting to modify scores
**Then** the operation is rejected

## Implementation

1. Create value objects:
   - `Score` (validated numeric value: >= 0, <= 300, divisible by 5)
   - `RoundType` (enum of 7 round types with display names)
   - `RoundScore` (union type for explicit score states):
     ```typescript
     type RoundScore =
       | { type: 'pending' }              // Not yet entered
       | { type: 'entered'; value: Score } // Valid score entered
       | { type: 'skipped' }              // Player skipped this round
     ```
2. Create entities:
   - `Player` (id, name, skipFromRound: number | null)
   - `Round` (type, scores: Map<PlayerId, RoundScore>, isLocked)
3. Create `Game` aggregate:
   - players: Player[]
   - rounds: Round[] (always 7, initialized with round types)
   - isEnded: boolean
   - Note: `currentRoundIndex` is UI navigation state, not domain state—store in presentation layer
4. Domain validation functions:
   - `validateScore(value: number): Feedback`
   - `validateRoundCompletion(round: Round, players: Player[]): Feedback`

## Constraints

- No external dependencies in domain layer
- Immutable value objects
- Game aggregate enforces all invariants
