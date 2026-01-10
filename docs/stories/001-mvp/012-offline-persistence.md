---
story_id: "012"
epic_id: "001"
title: Offline Support and Resume
status: ready
---

# Offline Support and Resume

## Context

The app must work without an internet connection and preserve game state across sessions. This story ensures the full offline experience works end-to-end.

## Scope

### In Scope

- Service worker for offline asset caching
- App loads without network
- Game state survives browser close/reopen
- Resume in-progress game on app launch
- Visual indicator when offline (optional but nice)

### Out of Scope

- Sync between devices
- Cloud backup

## Acceptance Criteria

**Given** the app was previously loaded
**When** opening with no internet connection
**Then** the app loads and functions normally

**Given** a game in progress
**When** the browser is closed and reopened
**Then** the game resumes exactly where it was left

**Given** the app is on a home screen (PWA)
**When** launched offline
**Then** it opens and functions normally

**Given** round 4 was being edited
**When** the app is reopened
**Then** round 4 is displayed (not reset to round 1)

## Implementation

1. Configure Vite PWA plugin with service worker
2. Cache strategy: cache-first for assets, network-first for nothing (no API)
3. Ensure IndexedDB persistence works correctly with:
   - Game state
   - Current view/round position (optional: could derive from game state)
4. Test offline scenarios:
   - First load (requires network)
   - Subsequent loads (offline works)
   - Mid-session network loss
5. Optional: Add offline indicator in header

## Constraints

- First-ever load requires network (to cache assets)
- No data loss on unexpected browser close
