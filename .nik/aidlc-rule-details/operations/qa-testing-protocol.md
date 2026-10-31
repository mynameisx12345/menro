# QA Testing Protocol — Stage 5 (continuous, not a phase after Construction)

Governs the artifacts in `aidlc-docs/intents/<intent-slug>/testing/` — Intent-scoped,
per `multi-intent-parallel-work.md`. **None of these duplicate what
already happens per Unit** (Section 9's 9a-9d, per `unit.md`; Section 14's reviewer
checks and Section 15's disposition routing, filled in the Unit's `dev-output-check.md`)
— that per-Unit work is what makes 1-shot Construction possible and doesn't change.
These are the view *above* it: an Intent-level test strategy written before Units are
built, roll-ups aggregated as Units complete, and QA's own independent check — genuinely independent, not a re-read of the
dev's or Section 14 reviewer's self-report. Four live artifacts now, not five —
`quality-gate-signoffs/UNIT-n.md` (item 5) is retired, see below for where its function
went.

This introduces QA as a **continuous ceremony owner**, not an on-demand specialist —
present across Inception, Construction, and Operations, the same standing as BA/PO and
Architect/Dev, per this project's own governing doc (the SOFA 2.0 AI-DLC Master
Document's Roles & Responsibilities section). If a project running this engine has no
one actually staffing a QA seat, say so explicitly at Bootstrap rather than silently
generating these files as theater nobody reads — real QA involvement, or an honest
gap noted in `PROJECT-RULES.md`, never a ceremony performed for its own sake.

## 1. `test-plan.md` — written once per Intent, before Construction starts

**Trigger**: right after Stage 3 ticketing, before Construction begins on any Unit.

**Content**: a test *strategy*, not a duplicate of any Unit's own Section 9 planning —
the view above it:
- Which Units (from `unit-breakdown.md`) carry the highest test risk, and why (touches
  auth/PII, a feature-flag gate, an external integration, a migration)
- Which NFRs (from `requirements.md`/each Unit's Section 7b) need dedicated validation
  beyond what a single Unit's own 9a/9b would naturally cover
- What regression surface this Intent touches — existing coverage (unit, integration,
  the web-automation smoke/regression suite) that this Intent's changes could break

```markdown
# Test Plan: [Intent name/link]

## Risk-ranked Units
| Unit | Risk area | Why |
|---|---|---|
| UNIT-2 | auth | Modifies the permission gate on shift approval |

## NFRs requiring dedicated validation
- [NFR, which Unit(s) it spans, what "validated" looks like]

## Regression surface
- [Existing suite/area this Intent's changes could break, and how it'll be checked]
```

## 2. `test-cases.md` — a traceability index, not test code

**Trigger**: populated once per Intent, right after Stage 3 (Unit Separation) finishes
ticketing every Unit — via the generation protocol in `inception/qa-test-case-
generation.md`, covering every Unit this Intent just produced in one pass, sourced from
each Unit's own `unit.md`, not Jira's rendered copy of it. Not a separate QA ceremony —
QA's own role here is downstream: executing the resulting suite independently. Coverage
against AC is reconciled at Section 14's Exit Gate review (Test Coverage Reconciliation). A Unit added
later via a Mid-Workflow Change gets its own fallback pass at Construction time instead
(`unit-template.md` Section 9d).

**Content**: maps `user-stories.md`'s AC to the actual test that verifies it, and which
Unit owns that test. Doesn't restate test code or the detailed test case content — a
pointer, so "is this AC actually tested, and where" is answerable without opening every
Unit's own detail file.

```markdown
# Test Cases: [Intent name/link]

| Story AC | Test | Unit | Type | Detail |
|---|---|---|---|---|
| US-3 AC2 | test_change_shift_approval_gate | UNIT-2 | unit | [TC-1](test-case-details/UNIT-2.md#tc-1) |
| US-3 AC2 | test_shift_page_loads (Playwright) | UNIT-2 | web automation | [TC-2](test-case-details/UNIT-2.md#tc-2) |
| US-3 AC3 | ShiftScreenTest.givenShift_whenOpened_thenShowsSchedule (Android) | UNIT-4 | mobile automation | [TC-1](test-case-details/UNIT-4.md#tc-1) |
| US-3 AC3 | ShiftUITests.testShiftOpens (iOS) | UNIT-5 | mobile automation | [TC-1](test-case-details/UNIT-5.md#tc-1) |
```

The "Detail" column links into `testing/test-case-details/UNIT-n.md` — the actual
authored test case content (steps, preconditions, expected result), per
`inception/qa-test-case-generation.md` Phase 4. This index never duplicates that
content, only points to it.

## 3. `nfr-validation.md` — rolls up scattered per-Unit NFR checks into one view

**Trigger**: updated as each Unit with a Section 7b NFR expectation completes 9a/9b.

**Content**: Section 9b already says "if Section 7b named a specific NFR expectation...
record the real measured result" — this file is where those scattered per-Unit results
get one Intent-level home, so a reviewer sees the whole NFR picture without opening every
Unit that happened to have one.

```markdown
# NFR Validation: [Intent name/link]

| NFR | Unit | Expectation | Measured result | Status |
|---|---|---|---|---|
| Nightly job under 10 min | UNIT-5 | < 10 min | 6m40s | Pass |
```

## 4. `defect-log.md` — QA's own running log, distinct from `deferred-work.md`

**Trigger**: continuous — QA adds to this during their own independent validation pass,
and also filters relevant entries in from `deferred-work.md`.

**Content**: `deferred-work.md` (Section 15) already catches real-but-out-of-scope
findings during Construction — but it holds *anything* deferred, not only defects
(a future-feature idea, a refactor suggestion). `defect-log.md` is narrower and QA-owned:
genuine defects only, whether they came from a `deferred-work.md` entry or from QA's own
independent check of the actual test coverage — reading the tests' real assertions, not
trusting Section 12's self-reported pass/fail, same discipline as the verification-gap
check but done by a second, genuinely independent reviewer.

```markdown
# Defect Log: [Intent name/link]

| ID | Found by | Source | Severity | Status | Notes |
|---|---|---|---|---|---|
| DEF-1 | QA | deferred-work.md (UNIT-3) | Medium | Open | ... |
| DEF-2 | QA | Independent test-coverage check | Low | Fixed | Test asserted success but not the actual value |
```

## 5. `quality-gate-signoffs/UNIT-n.md` — retired

This artifact existed when QA had a live, pre-close checkpoint — the master doc's own
language, QA "does not simply accept AI's self-reported pass/fail," enforced as a
blocking gate distinct from whoever did Section 14/15's review. That checkpoint doesn't
exist in this model: QA's role moved to executing the full suite independently after a
Unit ships (not before), per `inception/qa-test-case-generation.md`'s ownership split.
A blocking artifact nobody can actually block with isn't a lighter version of the old
check — it's unused ceremony, the same category of problem as `intake/bootstrap-
protocol.md` never actually asking about QA staffing despite this file assuming QA is
staffed (identified earlier, still an open gap in its own right) — a mechanism that's
documented but never actually triggered should be retired or wired up, never left
half-alive.

**Where its function actually went**:
- "Is the right thing being tested" — now `construction/unit-template.md` Section 14's
  **Test Coverage Reconciliation**, same PR reviewer, same moment as code review, no
  second ceremony.
- "QA's own findings from independently running things" — `defect-log.md` above, which
  already explicitly covers exactly this (*"genuine defects... from QA's own independent
  check of the actual test coverage"*).

Nothing to generate here anymore — don't create this file for new Units.

## Relationship to the Intent-level gates
`gate-approval-construction.md` (Stage 4.5, Architect-signed) should not be signed
Accepted while any of this Intent's Units still has an unresolved Test Coverage
Reconciliation finding from Section 14/15 — check this explicitly, don't let the two
gates drift out of sync with each other.
