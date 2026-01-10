---
story_id: "018"
epic_id: "002"
title: Help Section
status: ready
---

# Help Section

## Context

New players may not know George Street Rummy rules or how scoring works. A help section provides quick reference for gameplay rules, scoring, and app usage without requiring external lookup or interrupting a game in progress.

## Scope

### In Scope

- Accessible help button/link from main screens
- Rules overview (basic gameplay, going out, laying down)
- Scoring reference (card values, bonus/penalty points)
- Brief app usage guide (how to start a game, record scores)

### Out of Scope

- Interactive tutorials or walkthroughs
- Video content
- Printable rule sheets
- Community/external links

## Acceptance Criteria

**Given** any main screen (home, game)
**When** looking for help
**Then** a help button or link is visible and accessible

**Given** the help section
**When** viewing rules content
**Then** core gameplay rules are explained clearly and concisely

**Given** the help section
**When** viewing scoring content
**Then** card values and special scoring rules are listed

**Given** mobile viewport
**When** reading help content
**Then** text is readable and scrollable without horizontal overflow

**Given** a game in progress
**When** accessing help
**Then** returning to the game does not lose state

## Implementation

1. Add help route/modal accessible from header or navigation
2. Structure content sections:
   - How to Play (brief overview)
   - Scoring (card values table, bonuses, penalties)
   - Using the App (quick start guide)
3. Style consistently with visual theme (story 013)
4. Ensure content is scannable (headers, bullets, short paragraphs)

## Content Outline

### How to Play
- Objective: be first to go out by laying down all cards
- Turn structure: draw, optional lay down, discard
- Going out: requirements and timing

### Scoring
- Card values: face cards, aces, number cards
- Caught cards (penalty for cards in hand when opponent goes out)
- Bonus points (if any special rules apply)

### Using the App
- Starting a new game
- Adding players
- Recording round scores
- Viewing game history

## Constraints

- Content must be self-contained (no external dependencies)
- Language should be accessible to players unfamiliar with card game terminology
- Help should load quickly without blocking UI

