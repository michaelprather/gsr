---
story_id: "019"
epic_id: "002"
title: Share Game via QR Code
status: completed
completed_date: 2026-01-10
---

# Share Game via QR Code

## Context

Users playing George Street Rummy may want to share a game in progress with another device—transferring scorekeeper duties to a different phone, or allowing a second device to view the current standings. Since the app is offline-first with no backend, sharing must work via encoded data transfer.

## Scope

### In Scope

- "Share Game" action accessible from the game view
- Generate QR code containing compressed game state
- Receiving device scans QR and imports game
- Confirmation dialog when importing over an existing game (matches new game flow)
- Fallback: copyable share link for devices without camera access

### Out of Scope

- Live sync between devices (one-way, one-time transfer only)
- Cloud relay or backend services
- Bidirectional merge of game states
- Share history or multiple saved games

## Acceptance Criteria

**Given** a game in progress
**When** the user taps "Share Game"
**Then** a QR code is displayed containing the encoded game state

**Given** a generated QR code
**When** scanned by another device running the app
**Then** the game state is imported and the user is navigated to the game view

**Given** the receiving device has a game in progress
**When** a shared game is imported
**Then** the user sees the existing confirmation dialog ("This will end your current game")

**Given** the generated QR code
**When** the user taps "Copy Link"
**Then** a shareable URL is copied to the clipboard

**Given** a share URL opened on a device
**When** the app loads with encoded game data in the URL
**Then** the game is imported following the same confirmation flow

**Given** invalid or corrupted share data
**When** import is attempted
**Then** a clear error message is displayed and no game data is modified

## Implementation

1. **Serialization layer**
   - Create `GameShareService` in application layer
   - Serialize `GameDTO` to JSON
   - Compress using lz-string (or similar)
   - Base64url encode for URL safety

2. **QR generation**
   - Add qrcode library (e.g., `qrcode` or `qrcode.vue`)
   - Generate QR from share URL: `{origin}/#/import?data={encoded}`
   - Display in modal/overlay with "Copy Link" fallback

3. **Import route**
   - Add `/import` route that reads `data` query param
   - Decode → decompress → validate → hydrate via `GameMapper`
   - Reuse existing confirmation dialog component

4. **UI integration**
   - Add share icon button to game view header
   - Share modal with QR display and copy action
   - Toast confirmation on successful import

## Constraints

- Payload must fit in QR code (~2KB limit for alphanumeric)
- Estimated game state: ~1.5KB JSON → ~600 bytes compressed → ~800 bytes base64
- Must work offline (no network requests for QR generation)
- No new backend dependencies

## Open Questions

- Should the share link expire or include a timestamp? (Recommend: no expiry for simplicity)
