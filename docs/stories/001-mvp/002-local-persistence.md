---
story_id: "002"
epic_id: "001"
title: Local Persistence Layer
status: in-progress
---

# Local Persistence Layer

## Context

Game state must persist across browser refreshes and work entirely offline. A storage abstraction allows the domain to remain framework-agnostic while infrastructure handles IndexedDB specifics.

## Scope

### In Scope

- IndexedDB-based game state storage
- Repository interface in domain layer
- Infrastructure implementation
- Save and load operations for complete game state

### Out of Scope

- Multiple saved games (single active game only)
- Game history
- Cloud sync

## Acceptance Criteria

**Given** a game in progress
**When** the browser is refreshed
**Then** the game state is restored exactly as it was

**Given** no prior game exists
**When** loading game state
**Then** null is returned (not an error)

**Given** game state is saved
**When** the browser is closed and reopened
**Then** the game state persists

## Implementation

1. Define `GameRepository` interface in domain:
   ```typescript
   interface GameRepository {
     save(game: Game): Promise<void>
     load(): Promise<Game | null>
     clear(): Promise<void>
   }
   ```
2. Create `GameMapper` in infrastructure for persistence transformation:
   ```typescript
   class GameMapper {
     toDTO(game: Game): GameDTO        // Domain → persistence format
     toDomain(dto: GameDTO): Game      // Persistence format → domain
   }
   ```
3. Implement `IndexedDBGameRepository` in infrastructure:
   - Uses `GameMapper` for hydration/dehydration
   - Stores `GameDTO`, not domain `Game` directly
4. Use single object store with fixed key for active game
5. Handle IndexedDB availability gracefully (fallback messaging if unavailable)

## Constraints

- Domain layer must not import IndexedDB directly
- Repository must be injectable for testing
