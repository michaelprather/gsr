---
story_id: "017"
epic_id: "002"
title: App Icon and Favicon
status: ready
---

# App Icon and Favicon

## Context

The PWA currently uses placeholder icons. As part of visual polish, the app requires a branded icon that appears in the browser tab, home screen, and app launcher. The icon should use a playing card motif to reinforce the app's purpose.

## Scope

### In Scope

- Custom SVG icon design featuring playing card imagery
- Favicon (favicon.ico, 32x32 minimum)
- PWA icons (192x192, 512x512 PNG)
- Apple touch icon (180x180)
- Update manifest and HTML references as needed

### Out of Scope

- Animated icons
- Platform-specific adaptive icons (Android XML, iOS asset catalogs)
- Marketing materials or splash screens

## Acceptance Criteria

**Given** the browser tab
**When** the app is open
**Then** the favicon displays a recognizable card motif at small sizes

**Given** the PWA manifest
**When** the app is installed to home screen
**Then** the 192x192 and 512x512 icons display correctly

**Given** iOS Safari
**When** adding to home screen
**Then** the apple-touch-icon displays the branded icon

**Given** the icon at all sizes
**When** viewed on various backgrounds (light and dark)
**Then** the icon remains legible with appropriate contrast

**Given** the icon design
**When** reviewed alongside the visual theme (story 013)
**Then** colors and style are cohesive with the app's palette

## Implementation

1. Design custom SVG icon:
   - Playing card motif (single card, ace, or stylized deck)
   - Simple shapes that scale down clearly
   - Use app color palette from visual theme
   - Consider both light and dark backgrounds

2. Generate raster assets:
   - favicon.ico (16x16, 32x32 multi-resolution)
   - icon-192.png
   - icon-512.png
   - apple-touch-icon.png (180x180)

3. Update `index.html`:
   - Verify favicon reference
   - Add/update apple-touch-icon reference

4. Update `manifest.webmanifest`:
   - Verify icon paths and sizes
   - Consider adding `purpose: maskable` variant if design supports it

## Constraints

- Icon must be recognizable at 16x16 pixels (favicon)
- Design should coordinate with visual theme colors established in story 013
- No external dependencies for icon generation (commit final assets)

## Design Notes

Playing card options to consider:
- Single ace of spades (classic, universally recognized)
- Fanned cards suggesting a hand
- Abstract card corner with pip and rank
- Stylized deck/stack silhouette

Recommend testing at actual sizes before finalizing.
