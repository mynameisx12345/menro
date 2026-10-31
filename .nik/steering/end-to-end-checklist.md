# End-to-End Flow — Quick Checklist

One-page reference for the whole Mob Elaboration → Mob Construction flow. This is the
at-a-glance version — `core-workflow.md` has the full mechanics, gate detail, and file
references; this is what to actually check off while running it live. Written for the
single-Intent case — if a batch of Intents arrived together, run Stage 0.5
(`batch-intake-ordering.md`) before this checklist starts, and Stage 3.5
(`unit-consolidation.md`) between "Same round: Test cases generated" and Mob Construction
below — see `common/multi-intent-parallel-work.md` for the full parallel-work model.

## Foundation (Draft, opt-in — skip if the project has not opted in)

- [ ] **Once per project**: Capability Register filled from evidence and confirmed with
      the architect, role map confirmed, closing question asked
      (`intake/foundation-protocol.md`)
- [ ] **Each Intent**: reconcile run at Intent load; Silent rows turned into questions,
      Conflicts into conflict items for the architect (`intake/foundation-reconcile.md`)

## Mob Elaboration

- [ ] **Intent given** → classify: new project / new module-feature / enhancement /
      bug fix / refactor (usually answerable from the Intent's own wording — ask only
      if genuinely ambiguous between two)
- [ ] **Ground**: check existing functionality + check the actual code
      (`similarity-consistency-checklist.md`) — search first, never ask "does this
      exist" blind
- [ ] **UX check** (only if UI-facing):
  - [ ] Search codebase/design-system first
  - [ ] If nothing found: ask UX/PO — "is there an existing design somewhere else
        (Figma, screenshot, prior ticket)? Paste it here" — before assuming nothing
        exists anywhere
  - [ ] If still nothing exists anywhere: propose something concrete, ask UX/PO to
        verify or correct it — don't open with a blank "design this"
- [ ] **Ask needed questions** — file-based (`elaboration-questions-format.md`), never
      in chat; each question tagged `[Surfacing]` (grounding found something the team
      didn't know) or `[Gap]` (nothing answers this)
- [ ] **Definition of Ready** reached → PO signs off (Parked items included, not hidden)
- [ ] **Generate Units** (`unit-separation-protocol.md` — testability/dependency-driven,
      not a rigid 1:1 story mapping)
- [ ] **Light approval round** on the unit-breakdown split itself, before packets get
      populated
- [ ] **Same round**: Jira ticket created per Unit (generated from `unit.md`, one
      source of truth) + developer assigned
- [ ] **Same round**: Test cases generated for every Unit (`inception/qa-test-case-
      generation.md`, once per Intent, not per Unit) — produces `testing/test-cases.md`
      + `testing/test-case-details/UNIT-n.md`; 9d below reads these, doesn't generate them

## Mob Construction (per Unit — 1-shot, entry/exit gate only)

- [ ] **Entry gate**: four checks, not three — assignment (recorded assignee matches),
      completeness (`unit.md` fully populated, no unresolved ambiguity except logged
      Parked items/Assumptions), test-plan (`testing/test-plan.md` exists), test-cases
      (`testing/test-case-details/UNIT-n.md` exists — if not, run `qa-test-case-
      generation.md`'s Phases 1-4 now as a Mid-Workflow-Change fallback, see
      `core-workflow.md` Stage 4)
- [ ] Implement per Sections 1-8
- [ ] **9a** Unit tests
- [ ] **9b** Integration tests — only if triggered (full request/response cycle,
      multi-model transaction, external integration, consumed contract)
- [ ] **9c** Manual verification in the live running app — **hard gate**, must pass
      before 9d; save the proof as `construction/UNIT-n/9c-verification*` (one or more
      screenshots/output captures), or record "N/A — no UI surface"
- [ ] **Server test script** (Draft, only if `PROJECT-RULES.md` §1 records the opt-in) —
      written at 9c when the Unit adds work that runs on a server outside a request, or
      "N/A". Running it comes after deploy and is **not** a gate for 9d or the exit gate
      (`construction/server-test-script.md`)
- [ ] **9d** Test automation — reads this Unit's already-generated `test-case-
      details/UNIT-n.md`, branched by surface:
  - [ ] Web/dashboard → this project's own generator skill, once per generated test
        case (`/web-automation` in hr-iris-core), then `/smoke-test`
  - [ ] Mobile → that repo's own generator skill, once per generated test case
        (`/ui-automation` on `hr-iris-android` `release/development` / `hr-iris-ios`
        `develop`, never `main`), smoke-tag happy paths, then that repo's `/smoke-test`
        against a local backend — the Unit closes on that run; raise a
        manual-testing-required flag, reaching the
        Jira ticket itself not just `dev-output-check.md`, only for steps automation
        can't drive (Face ID, camera, OS dialogs) or if that repo genuinely has no generator
  - [ ] Not UI-facing → not applicable
- [ ] **Self-check** (Sections 11-12, filled in `construction/UNIT-n/dev-output-check.md`)
      — every AC, every scope boundary, every 9a-9d outcome
      recorded in Section 12's result words (Verified / Not verified / N/A)
- [ ] **PR opened** (references Unit ID + Jira ticket)
- [ ] **Jira comment posted with POT** (Proof of Testing) — real evidence: test
      output/links (mobile: the local run; the DEV run follows as its own comment after
      deploy), the 9c walkthrough confirmation, or a mobile manual-testing flag for steps
      automation can't drive; ends with a commit link to each `9c-verification*` file
      (pushed first, links only)
- [ ] **Exit gate**: human review of `dev-output-check.md` + the PR/POT together
- [ ] **After deploy (mobile only, doesn't block the exit gate)**: rerun `/smoke-test`
      against DEV; append a dated "9d DEV run" line to `dev-output-check.md` and post it
      as a follow-up Jira POT comment

## What "1-shot" actually means here
The target is the **end-to-end outcome**, not a rule about round count: whatever it
takes during Elaboration — one round or five — the delivered code at the end of
Construction should be exactly what the PO asked for, with **zero developer re-prompting
after delivery to fix it**. Elaboration's multiple rounds exist *in service of* that
single correct delivery, not as a separate, less-rigorous phase.

- **Elaboration is deliberately multi-round** — because front-loading every ambiguity
  here is what makes the single Construction pass reliably correct. Rushing this to look
  "more 1-shot" would just move the correction burden onto the developer later, which is
  the exact thing this framework exists to prevent.
- **Construction runs as one pass** — entry gate once, 9a→9b→9c→9d→self-check→PR/POT,
  exit gate once. If 9c verification fails mid-pass, it gets fixed and re-verified right
  there, still inside the same pass — not shipped and corrected via a later re-prompt.
- **The actual success measure**: did the developer have to go back and ask for changes
  after Construction delivered? If yes, something upstream (usually Elaboration) left a
  gap it shouldn't have — that's the failure this framework is built to catch before it
  happens, not something to accept as normal.
