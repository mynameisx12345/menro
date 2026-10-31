# UX Review — Business User Type

| Field | Value |
|---|---|
| UI-facing? | yes |
| Project state (Step 0) | Brownfield — existing map marker pattern (`L.divIcon` house pin for residents, truck pin for trucks) |
| Existing pattern reused | Resident house pin (`admin-dashboard.component.ts:showResidentMarkers()`, `collector-app.component.ts:showResidentMarkers()`) — same pin shape, different glyph/color |
| Reference source | AI-constructed and verified (Step 3) — no existing business icon found in codebase, no design system, no Figma reference provided |
| New design required? | yes — a new business icon (no existing precedent) |
| Prototype file(s) | `aidlc-docs/intents/business-user-type/inception/ui-summary-package.html` |
| Pattern source(s) cited | `<!-- Pattern Source: Existing Codebase (admin-dashboard.component.ts:showResidentMarkers — house pin shape) -->` |
| Domain pattern options presented | Single grounded proposal (minor atomic element — an icon, not a new flow) |
| Screenshot/reference requested? | yes — asked if a business icon exists (Figma/screenshot/SVG); answer: propose one |
| Design-system deviation flagged? | no — no design system exists; icon follows the existing inline-SVG `L.divIcon` pattern |

## Proposed icon

A **blue storefront pin** — same teardrop pin shape and size as the resident house pin, with a storefront glyph instead of a house glyph, and a blue fill (`#1565c0`) instead of green (`#2d6a4f`).

Rationale:
- Same shape = same visual language (it's a location pin, not a different kind of marker).
- Different color + glyph = instantly distinguishable at a glance on a busy map.
- Blue is already used in the app for "informational" markers (the route polyline is `#1565c0`), so it reads as a natural sibling to the green resident pin.
- Inline SVG, no new asset, no new dependency — matches the existing pattern exactly.

## Prototype

See `ui-summary-package.html` — an interactive `.html` showing:
- The resident house pin (green) and the business storefront pin (blue) side by side.
- A mock map with both pins placed, so the visual distinction is clear at real map scale.
- Hover/click states on both pins.

**Verify or correct:** does the blue storefront pin read as "business" to you, or should it be a different color/glyph (e.g. a building, a shop awning, a briefcase)?
