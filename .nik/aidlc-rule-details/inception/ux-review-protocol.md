# Mob Elaboration — UX Review Protocol

## Purpose
Defines when AI must pull in the UX seat, request a screenshot/reference, and check an
Intent's UI surface against the existing design system before it clears elaboration.
Exists so "1-shot" Units never arrive at Construction with an undecided visual design —
and, since UX governance (v2.0.0), so Gate 1 sign-off is never a pure text-AC review:
every UI-facing Intent that needs new design produces a real, interactive mockup the Mob
actually reacted to, not a described layout taken on faith. This closes a previously
parked idea (`steering/core-workflow.md`'s own "Known Gaps" history) that needed exactly
this decision — real rendered mock vs. described wireframe — before it was buildable.

## Trigger — is this Intent UI-facing at all?
Treat as UI-facing if the Intent mentions (directly or by clear implication) any of:
page, screen, dashboard, modal, table, form, filter, button, panel, card, chart, list —
or names an existing UI module/template. If none of these appear and the Intent is
purely backend/data/integration, skip this protocol entirely and say so explicitly in
`requirements.md` ("No UX surface — backend-only Intent").

## Step 0 — Project State Kickoff Check (always first, before drafting anything)
Before any mockup work starts, explicitly announce and confirm with the Mob which state
this Intent's *specific UI surface* is in:
- **Greenfield** — no usable design tokens/component library exist yet for this surface.
- **Brownfield** — existing codebase UI (templates, components, a token set) exists to
  derive from.

This is not re-running Bootstrap's own detection (`intake/bootstrap-protocol.md` Step 5
already recorded the project-wide design-system finding in `PROJECT-RULES.md`) — it's
confirming that finding still applies to *this Intent's* surface specifically. A mostly-
brownfield project can still have a genuinely greenfield pocket (a new module with no
visual analog and nothing in the existing token set that covers it) — don't assume the
project-level default always applies uniformly. State the classification plainly
("This Intent's UI surface is Brownfield — deriving from `change_shift_approvals.html`"
or "Greenfield — no existing token/component covers this") and get an explicit
Mob acknowledgment before Step 1. Record it in `ux-review.md` (Step 4's table, below).

## Step 1 — Search before assuming new design (Brownfield Priority 1)
If Step 0 found **Brownfield**, this is Priority 1 — exhausted before any fallback.
Before asking anyone anything, AI must:
1. Grep the app's existing templates for a screen covering the same or an adjacent
   module.
2. Check the design-system source of truth (component library / token set — confirm the
   current canonical link in `PROJECT-RULES.md`; do not guess at one) for an existing
   component matching what's implied.
3. Report the result as one of:
   - **Existing pattern found** — cite file/component; propose reuse, no new design work,
     no prototype needed (Step 3 doesn't apply — there's nothing new to react to).
   - **Partial match** — an existing component covers most of it; name the delta. If
     the delta is small/low-risk (e.g. one more column on an existing table), note it
     and proceed without a prototype. If the delta is itself risky to guess (a
     multi-column filter, a non-trivial modal flow, "like X but different" with the
     difference unnamed), this falls to Step 3 for the delta specifically.
   - **Genuinely new** — nothing comparable exists; this needs real UX design, not reuse,
     and falls through to Brownfield Priority 2 (Step 3, below) — never straight to
     improvising a look with no grounding.

## Step 2 — When code-search comes up empty: ask before assuming nothing exists
Step 1 only searches the codebase and the design-system source of truth — it can't see
a Figma file, a screenshot from a prior conversation, or something living only in a
ticket. A code-search miss is not proof nothing exists anywhere. So when Step 1 comes
back **"Genuinely new,"** don't jump straight to proposing something new:

1. **Ask UX/PO directly**: "Nothing found in the codebase for this — is there an
   existing design somewhere else (Figma, a screenshot, a prior ticket)? If so, paste
   it here."
2. **If a screenshot/reference gets pasted**: treat it the same as an "Existing pattern
   found" result from Step 1 — cite it, note where it actually came from (Figma link,
   "pasted by UX," whichever), proceed. No prototype needed — a real reference already
   exists.
3. **Only if the team confirms nothing exists anywhere** — not in the codebase, not in
   Figma, not in anyone's head — does this move to Step 3 below.

## Step 3 — Nothing exists anywhere: mandatory interactive HTML prototype, then verify
Once Step 1/2 establish that *new design is actually needed* (Genuinely new, or a risky
Partial-match delta) — not for a clean direct reuse or low-risk delta, those skip this
step entirely — what gets shown to the Mob is always a working, interactive prototype.
**One format, no exceptions: self-contained `.html`.** No static images, no wireframes,
no text-only descriptions as the deliverable:

- **Web**: a single self-contained `.html` file — markup, CSS, and JS all inline, no
  build step, no dev server — opens directly in a browser and is actually interactive
  (clicks, toggles, form states). Not a flat image of what it would look like.
- **Mobile**: an `.html` prototype rendered inside an interactive mobile device shell
  (status bar, notch/home-indicator framing, visible touch/toggle states), using
  mobile-native interaction patterns where the surface calls for them — bottom sheets,
  tab bars, floating action buttons — not a desktop layout narrowed to a phone-sized
  viewport. This is a real, separate build effort per Intent, not a checkbox — budget
  for it accordingly.

This prototype is **disposable Elaboration-stage scaffolding, not Construction code** —
it exists to get a real reaction fast, not to be imported wholesale later. Construction
may reference it for layout/behavior, but Section 6a's actual component work in
`unit-template.md` is the real implementation, built to this project's real conventions.

**Greenfield Token Binding**: if Step 0 found Greenfield, the prototype must bind to
explicit design tokens resolved *before* Gate 1 — colors, spacing, type scale, whatever
this project's token mechanism is. If a needed component has no token/precedent at all,
construct it using industry UX standards, grounded directly in this Intent's own Mob
Elaboration context (its domain, its users, its actual Acceptance Criteria) — not a
generic template unrelated to what this Intent is actually for.

**Brownfield Priority 2**: the fallback for a Step 1 "Genuinely new" result is the same
industry-standard-grounded construction, bound to the *project's existing* tokens/
component conventions (not a greenfield palette) — Priority 1 (reuse/adapt what exists)
must be genuinely exhausted first; Priority 2 is a fallback, not a default.

**Domain Context Grounding & Pattern Suggestions**: whenever either path above requires
inventing something with no existing precedent, anchor the fallback strictly to this
application's actual domain — read it from `PROJECT-RULES.md`/`codebase-briefing.md`
(e.g. "Enterprise HRIS / Workforce Management"), not a generic SaaS assumption. Scale how
many domain-native pattern options get presented to the materiality of the decision, not
a fixed count every time:
- **A new interaction *pattern or flow*** the user will learn and repeat across the app
  (how bulk approval works, a multi-step wizard, a review-and-decide flow) — present
  **2–5 domain-native options** (e.g., side approval drawers, split-pane review views,
  batch action toolbars, inline expandable rows, multi-step wizard modals) for the Mob
  to evaluate and pick from before finalizing. Don't pad to a round number if fewer
  genuinely-distinct options exist — a forced 5th weak option is worse than three good
  ones.
- **A minor, atomic new element** (a badge style, a tooltip, an icon-only button) — one
  well-reasoned, domain-grounded proposal is enough; still cite the domain reasoning,
  skip the multi-option comparison. The downside of guessing wrong here is small and
  cheap to correct at the verify step below.

**Pattern Source & Metadata Attribution**: every prototype produced under this protocol
— Priority 1 reuse, Priority 2/Greenfield fallback, or a pasted real reference — states
its origin out loud to the Mob, and carries it in the file itself as an HTML comment, so
the source is traceable from the artifact alone, not just this session's chat history:
```html
<!-- Pattern Source: Existing Codebase (dashboard/templates/change_shift_approvals.html) -->
<!-- Pattern Source: UX-Provided Reference (Figma, link or "pasted by UX" + date) -->
<!-- Pattern Source: Industry Standard (Enterprise HRIS - Side Approval Drawer) -->
```
This applies to every prototype, not only the industry-standard-fallback case — full
traceability is the point, not just flagging the riskiest source.

Once a prototype exists (any path above):
1. Show it to PO/UX and ask them to **verify or correct it** — "is this right, or should
   it look like X instead?" — rather than "what should this look like?" Reacting to a
   concrete, interactive proposal surfaces disagreement faster than answering an open
   question does, and faster than reacting to a static description would.
2. If the team has no time/no one to react right now: that's a **Parked** item (per
   `elaboration-questions-format.md`), not a blank left hanging — log it as deferred,
   not silently skipped.

## Step 4 — Record the finding
Every UI-facing Intent gets a `ux-review.md` with:

| Field | Value |
|---|---|
| UI-facing? | yes/no |
| Project state (Step 0) | Greenfield / Brownfield, for this Intent's surface specifically |
| Existing pattern reused | file/component reference, or "none" |
| Reference source | codebase (Step 1) / pasted by UX — Figma, screenshot, prior ticket (Step 2) / AI-constructed and verified (Step 3) |
| New design required? | yes/no — if yes, Priority 1 exhausted first (Brownfield) or token gap (Greenfield); if no, why (direct reuse / low-risk delta) |
| Prototype file(s) | path(s) to the interactive `.html` (web) / device-shell `.html` (mobile) produced, or "none needed" + reason |
| Pattern source(s) cited | the `Pattern Source` comment content for each prototype, or the existing-file reference for direct reuse |
| Domain pattern options presented | the 2–5 options shown for a new flow/pattern (and which the Mob picked), "single grounded proposal" for a minor element, or "N/A — no new component" |
| Screenshot/reference requested? | yes/no, and whether received |
| Design-system deviation flagged? | yes/no — anything departing from tokens/patterns |

## Step 5 — Pre-Gate 1 UI Package Compilation
Immediately before Gate 1 sign-off is initiated (not at some later point, and never
skipped even if it feels redundant with Step 4's own per-finding table): gather every
mockup/prototype produced anywhere in this Intent's Elaboration session — across every
`ux-review.md` entry, if more than one UI surface was touched — into one consolidated
**Gate 1 UI Summary Package**, saved as
`aidlc-docs/intents/<intent-slug>/inception/ui-summary-package.html`: a single place the
PO can open and see every prototype this Intent is about to be signed off against,
together, not scattered across the session's history. This is what actually closes the
previously-parked "UI preview at Gate 1" idea — the signer sees the real, interactive result, not a text AC review alone.

## Gate
`requirements.md` cannot reach Definition of Ready (see `elaboration-protocol.md`) while
a UI-facing Intent still has an unresolved "Genuinely new, no reference provided" row,
**and** Gate 1 sign-off cannot be initiated for a UI-facing Intent until Step 5's UI
Summary Package has been compiled and shown to the PO (if this Intent produced any
prototypes at all — an Intent whose UX review resolved entirely via direct reuse has
nothing to compile, and that's fine, say so explicitly rather than forcing an empty
package).

## Seat guidance (BA / PO / UX, who asks whom)
- BA drives the functional gap-checklist (elaboration-protocol.md).
- UX drives this protocol specifically — the BA should defer UI-surface questions to
  the UX seat rather than improvising them, and the UX seat should defer functional
  scope questions back to the BA. Keeps each seat's questions credible to what they'd
  actually know to ask in real life.
- PO answers both, and is the only one who can approve "Genuinely new" as in-scope for
  this Intent rather than deferring it to a separate design spike, and is who Step 5's
  UI Summary Package is ultimately compiled for.
