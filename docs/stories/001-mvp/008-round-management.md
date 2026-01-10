---
story_id: "008"
epic_id: "001"
title: Round Lock and Unlock
status: ready
---

# Round Lock and Unlock

## Context

Once scores are finalized for a round, users lock it to prevent accidental changes. Locked rounds can be unlocked if corrections are needed, with a confirmation to prevent mistakes.

## Scope

### In Scope

- Lock round action (requires valid scores)
- Visual distinction for locked vs unlocked rounds
- Unlock round with confirmation dialog
- Locked rounds are read-only
- Skip round action (lock with all null scores)

### Out of Scope

- Batch lock/unlock
- Auto-lock on navigation

## Acceptance Criteria

**Given** a round with valid scores (exactly one zero, all valid)
**When** lock is pressed
**Then** the round becomes read-only

**Given** a round with invalid scores
**When** lock is pressed
**Then** validation feedback is shown and lock is prevented

**Given** a locked round
**When** viewing score inputs
**Then** inputs are disabled/read-only with visual indicator

**Given** a locked round
**When** unlock is pressed
**Then** a confirmation dialog appears

**Given** unlock confirmation is accepted
**When** the dialog closes
**Then** the round becomes editable again

**Given** a round where no one played
**When** "skip round" is pressed
**Then** round is locked with null scores for all players

## Implementation

1. Add lock/unlock button to ScoreEntryView
2. Lock button validates via domain before locking
3. Implement confirmation dialog component (UiConfirmDialog)
4. Locked state: disable inputs, show lock icon, muted styling
5. Add "skip entire round" option for rare cases
6. Wire to `GameService.lockRound()` and `unlockRound()`

## Constraints

- Navigation between rounds is always allowed (users can view any round)
- Locking a round requires valid scores; navigation does not
- Unlock confirmation must be explicit (not just a toggle)
