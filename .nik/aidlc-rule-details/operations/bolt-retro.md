# Bolt Retro — Process Facilitator's Retrospective

Reviews an Intent's completed Bolts (each Bolt is one Unit's Construction cycle)
together, once per Intent, for **process health** — not code correctness (that's Stage
4.5's seam/aggregate-view check, already done per-Intent) and not individual Unit quality
(that's each Unit's own Section 12). This is the one level up: did the framework itself
work well across these Bolts, or did something about *how* the team ran it need fixing
before the next one.

Every finding carries a source — a specific Intent, Unit, escalation, or `audit.md`
entry. A claim you can't point at is not a finding; drop it. Same discipline as the
claims-check at Construction's exit gate, applied here to the process itself.

## Phase 1 — Gather
Enumerate what this Intent's Bolts actually produced and how it went, from what's
already on record — don't re-interview the team for facts the artifacts already carry:
- The Intent, its risk level, and its Stage 4.5 verdict
- Every Section 10 escalation across every Unit — what triggered it, how it resolved
- Every Parked item — did it get un-parked, or is it still sitting open
- Any PROJECT-RULES.md additions during this Intent's Bolts, and what prompted each one
- Unit size signal: how many Units crossed the configured threshold, and what happened
  when they did (split, or confirmed-large-and-proceeded per
  `unit-separation-protocol.md`)
- Every `1-shot-feedback-log.md` entry from this Intent's Bolts — a Unit that needed a
  post-delivery correction, already classified NIK gap / Player gap / Both per
  `one-shot-feedback.md`. This is the actual evidence for the Framework-vs-team-fault
  angle below, not something to re-derive from memory.

## Phase 2 — Analyze
Three angles, each grounded in Phase 1's evidence, not impression:

- **Recurring friction** — the same kind of escalation firing on more than one Unit in this
  Intent is a process gap, not three unrelated incidents. Did grounding keep missing the
  same category of thing? Did the same consistency-check item keep coming back unclear?
- **Cadence check** — did Elaboration rounds run long relative to what Step 0's
  classification predicted? Did Fast path get chosen and then need to fall back to
  Coaching mid-round (a sign Fast path was offered somewhere it shouldn't have been)?
- **Framework-vs-team-fault** — read straight from this Intent's `1-shot-feedback-log.md`
  entries: how many were NIK gaps (a real fix belongs in `.nik/aidlc-rule-details/`) vs.
  Player gaps (belongs in individual feedback, not a framework change) vs. Both. A NIK
  gap that only happened once in this Intent is still worth fixing if the fix is cheap and
  clearly correct — but don't propose a framework change for a single Player-gap
  incident; that's exactly the pattern this split exists to prevent.

## Phase 3 — Team Discussion (opt-in, not forced)
Skip by default. Run it when the Facilitator or the team wants to talk through a finding
together rather than just read the report — agents/roles speak only to findings with a
source, same rule as everything else here.

## Phase 4 — Decide
- **Action items** — specific, owned, and aimed at the actual cause found in Phase 2:
  a rule-file edit, a PROJECT-RULES.md addition, or a note for the next Intent's
  pre-elaboration checklist. Proposed here, not auto-applied — the Facilitator decides
  what actually gets changed.
- **Verdict, explicit, never silently defaulted**:
  - **Healthy** — no recurring friction, cadence matched expectation.
  - **Healthy with follow-ups** — minor friction found, action items logged, doesn't
    block starting the next Intent.
  - **Needs attention before next Intent** — a real, recurring gap; the action items here
    should land before the next Intent's Construction starts, not just get filed for someday.

## Phase 5 — Finalize
Write the retro to `aidlc-docs/intents/<intent-slug>/process/bolt-retro-{bolt-id}.md` —
Intent-scoped, since it covers one Intent's Bolts. Update the **global**
`aidlc-docs/process/process-health-log.md` (append-only, same discipline as `audit.md`,
and deliberately not nested under any single Intent — per
`common/multi-intent-parallel-work.md`) with this retro's verdict and action items, so a
pattern across *multiple* Intents is visible to whoever reads
that log next. A single Intent's retro shows one data point; the log is what turns "this
happened once" into "this keeps happening," across the whole project, not just one
Intent's own history.
