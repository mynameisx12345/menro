# Test Case Generation — authored once per Intent, right after Unit Separation

Governs *how* `test-cases.md` (per `operations/qa-testing-protocol.md` item 2) actually
gets authored for every Unit in an Intent. Lives in `inception/`, not `construction/` or
`operations/`, deliberately: authored once per Intent, right after Stage 3 (Unit
Separation) finishes ticketing every Unit — not mid-Construction, and not a separate QA
ceremony owned by a different role either. Mirrors the proven 4-phase rigor an external
tool (`qa-test-design-4phase`) already uses — understanding → coverage analysis →
planning → authoring — but changes two things: the source, and when it runs.

## Why not the Jira ticket

`core-workflow.md`'s Stage 3 is explicit: *"Ticket description is generated from the
Unit's `unit.md` (Sections 0-8), not retyped — one source of truth, not two drifting
copies."* Jira is the downstream copy; `unit.md` is the original. Generating test cases
from Jira's rendered description works fine the moment a ticket is created, but a Unit
updated afterward (a Mid-Workflow Change, per `core-workflow.md`) doesn't necessarily
get pushed back into Jira's description — so grounding test-case generation in Jira risks
building against a stale copy. Same reasoning already applied to ADRs and web automation:
go to the original, not the mirror. This reasoning holds regardless of *when* test-case
generation runs — it's still `unit.md`-sourced here, just earlier than before.

**When this applies**: any ticket that already has a corresponding NIK Unit. If a ticket
has no Unit behind it (a non-NIK project, a chore with no Unit, an org not running this
framework at all), there's nothing to source from here — fall back to the Jira-sourced
flow as-is. This governs the NIK-tracked case specifically, not a wholesale replacement.

## When this runs

**The normal case**: once per Intent, at the end of Stage 3 (Unit Separation) — in the
same round as ticketing, right after every Unit's `unit.md` packet is written and the
light approval round (PASS/CONCERNS/FAIL) passes. Covers every Unit this Intent just
produced in one pass, not one invocation per Unit.

**The fallback case**: a Unit added later via a Mid-Workflow Change, after the original
batch pass already ran — that Unit's own Construction (`unit-template.md` Section 9d)
runs Phases 1-4 for just that one Unit, the same mechanics, as a fallback. This is the
only time this protocol runs mid-Construction rather than at Stage 3.

## Who runs this, and what "QE approval" actually means here

Whoever ran Stage 3's own light approval round — the same Mob that just finished
Elaboration and Unit Separation — runs all 4 phases themselves, in one pass, covering
every Unit this Intent just produced. Not per-Unit, not mid-Construction (except the
fallback case above), and no live human QE checkpoint in the middle either. "QE
approval" describes the *methodology* having been designed and vetted once (whoever
built `qa-test-design-4phase` did that work up front) — not a per-Unit review of this
specific test plan before Construction can proceed. Don't misread Phase 3 below as a
live gate; it isn't one in this model.

This means the independent check this whole area used to rely on (someone other than
the builder confirming the right things are being tested) **does not happen here** — it
happens somewhere else: Section 14's Exit Gate review, where the human reviewer
reconciles test coverage against Section 2's AC the same way they already reconcile the
code diff against it — `unit-template.md` Section 14's **Test Coverage Reconciliation**.

**Handoff note**: whoever eventually builds each Unit (`unit-template.md` Section 9d) is
often a different person/session than whoever ran this protocol at Stage 3 — especially
in a multi-Unit-Runner parallel-work setup (`common/multi-intent-parallel-work.md`). This
is fine precisely because the content is sourced from `unit.md`, not from whoever's doing
the authoring — and `unit.md` is read-only once Construction starts, so there's no
staleness gap between "authored at Stage 3" and "read during Construction weeks later."

## Phase 1 — Understanding (no test cases yet)

Read the Unit's own `unit.md` directly — not Jira's rendered description of it:
- Section 1 (Goal) — what this Unit is actually for
- Section 2 (Acceptance Criteria) — the canonical, numbered AC list this Unit was built
  against; this is what every test case ultimately maps back to
- Section 3 (Scope), especially "Explicitly out of scope" — don't generate test cases
  for behavior this Unit deliberately didn't build
- Section 6 (UX Spec), if UI-facing — the actual screen/flow behavior to verify; by this
  point the UX Governance prototype/Pattern Source work is already done
  (`ux-review-protocol.md`), so this is grounded in a real interactive mockup, not a
  description
- Section 7 (Domain Rules, NFRs) — any NFR needing dedicated validation, same as
  `operations/qa-testing-protocol.md`'s `test-plan.md` risk-ranking

## Phase 2 — Coverage analysis (no test cases yet)

Same discipline as the external 4-phase tool: positive, negative, and edge cases per
AC item; which ones carry real risk (touches auth/PII, an external integration, a
migration — cross-reference this Intent's own `test-plan.md` if one exists). Flag any AC
that's ambiguous or looks under-specified rather than guessing a test for it — same
STOP-and-ask discipline as everywhere else in this framework. Catching this now, before
any Unit's Construction has started, is strictly cheaper than catching it after a Unit
Runner has already built and manually verified a guess.

## Phase 3 — Planning

Propose the test plan — which AC maps to which test type (unit/integration/web
automation/mobile automation/manual) and why — as a visible step alongside Stage 3's
own PASS/CONCERNS/FAIL verdict (not Section 12 — that's a Construction-only artifact
that doesn't exist yet at this point). No external approval blocks this; see above for why.

For a mobile Unit, a case is **Mobile automation** when every step can be driven by that
repo's UI tests; a case that needs a system Face ID/biometric prompt, camera/face
capture, or an OS permission dialog is **Manual** — decide that here, so Construction's
Section 9d isn't the first place it's discovered. One mobile Unit = one platform, so the
case's platform is the Unit's own repo; an Intent touching both apps authors each Unit's
cases separately.

## Phase 4 — Authoring

Write the actual test cases, for every Unit this Intent just produced. Two destinations,
both committed to the repo as plain markdown — never a binary/xlsx artifact, and never
left to regeneration-on-demand:

- **`aidlc-docs/intents/<slug>/testing/test-cases.md`** (per `operations/qa-testing-
  protocol.md`) stays the lightweight, cross-Unit traceability index — Story AC → test →
  Unit → type — linking to the detail file below, not restating its content.
- **`aidlc-docs/intents/<slug>/testing/test-case-details/UNIT-n.md`** (one per Unit) —
  the actual authored content: every test case this Unit's coverage analysis produced,
  in full.

  ```markdown
  # Test Cases: <intent-slug>/UNIT-n

  ## TC-1 — <short title>
  **Maps to AC**: Section 2, AC[<n>]
  **Type**: Smoke / Regression
  **Kind**: Positive / Negative / Edge
  **Automation**: Unit / Integration / Web automation / Mobile automation / Manual
  **Preconditions**: [setup state this case needs, or "none"]
  **Steps**:
  1. [...]
  2. [...]
  **Expected result**: [...]
  ```

**Kind and negative coverage** (v3.4.0). Phase 2 already analyses positive, negative and edge cases
per AC; **Kind** makes the result visible. Every case carries one. Each AC has at least one
**Negative** case — the system refusing, rejecting or failing safely (wrong role, invalid input,
missing data, the outside system down) — or a one-line reason none applies, written in the
detail file's Phase 2 coverage notes (e.g. "AC 3 is display-only, no refusal path"). The AI sets
Kind when it writes the cases. Cases written before v3.4.0 have none, which reads as unlabelled,
not as an error.

**Why persisted, not regenerated on demand**: once automation is scaffolded from a test
case (per `unit-template.md` Section 9d), that automation is tied to this *specific*
version of it — regenerating later would silently drift the two apart, the same
one-source-of-truth problem this framework avoids everywhere else. It also preserves any
human refinement a reviewer makes after initial generation, and gives `common/one-shot-feedback.md`
a stable record to audit against instead of a re-run's best guess. Generate once (this
protocol), persist the result, regenerate only when the Unit's own AC genuinely changed
and the existing cases are actually stale — not as a routine way to "look up" coverage.

## Relationship to `/web-automation` and other automation

This protocol produces the *test case* — what should be verified, and why. It does not
itself write Playwright/XCUITest/instrumented-test code, and it must never require the
project's own automation skill to be rewritten to understand NIK's concepts (`aidlc-docs/`,
`test-cases.md`, this file). A project's skills stay exactly as portable as they were before
NIK was ever bootstrapped into that project — see `unit-template.md` Section 9d for the
actual calling convention: the Unit Runner who eventually builds this Unit (often a
different person/session than whoever authored these test cases at Stage 3 — see
"Handoff note," above) reads the already-generated test cases themselves and invokes the
project's existing automation skill once per case, passing ordinary `module`/
`description`-shaped input that skill already understands. NIK is the one that adapts to
the project's tooling, never the other way around.
