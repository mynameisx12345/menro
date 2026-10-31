# Questions Log Template

Generates `aidlc-docs/intents/<intent-slug>/construction/UNIT-n/questions-log.md` — one
per Unit, alongside that Unit's own Construction output (never merged into
`intents/<intent-slug>/inception/units/UNIT-n/unit.md`, per this framework's own split
between "what was decided" and "what happened while building it"). Referenced by
`unit-template.md` Section 10 (where entries get created), Section 12 (which links here
rather than restating entries), and `error-handling.md` (Construction failure recovery).

**Different from `elaboration-questions.md`**: that file is Inception-side, batched into
rounds, answered async by the PO/BA via lettered multiple-choice. This file is
Construction-side — a live, synchronous "STOP and ask" during a build, answered in the
room (or the async equivalent) as it happens, not batched. Append-only: entries are never
renumbered, edited after the fact, or deleted, even once resolved.

---

# Questions Log: <intent-slug>/UNIT-n

## Q-1 — [one-line question, as actually asked]
- **Type**: STOP-and-ask (blocker, per Section 10) / One-occurrence note (a lesson not
  yet worth a permanent `PROJECT-RULES.md` line) / **Parked item resolved** (a decision
  deferred during Elaboration just became answerable during Construction — nothing went
  wrong, nothing new is being asked, this is closing a loop, not opening one)
- **Triggered by**: [what in the code/build actually surfaced this — cite `file:line`
  where applicable, not just a vague description]
- **If "Parked item resolved"**: **Resolves** `PARKED-NN` from `elaboration-questions.md`
  — cite the exact item. This didn't need to become a blocker to count; the dev simply
  learning the answer while implementing, or someone mentioning it in passing, still
  gets logged here the same as a live STOP-and-ask would.
- **Routed to**: [BA/PO / Architect/Dev / QA — per
  `similarity-consistency-checklist.md`'s "who to ask" routing; "N/A" for a
  one-occurrence note or a Parked resolution nobody needed to be actively asked]
- **Answer**: [what was actually decided — verbatim where possible, not paraphrased into
  something vaguer than what was actually said]
- **Answered by**: [name] — **Date**: [ISO date]
- **Resolution**: Resolved — Construction proceeded / Still open — Construction is
  paused pending this
- **Recurrence check** (Section 10's own trigger): does this look like it'll cost
  someone again later, not just this Unit's one-off case? Checked against
  `PROJECT-RULES.md` Section 2's inclusion test —
  [Yes, added as `[ADR/rule reference]` / No, genuinely one-off, logged here only]

<!-- Q-2, Q-3, ... — sequential, one block per entry, never renumbered or deleted -->

## If this Unit raised zero questions
Say so explicitly rather than leaving the file empty and ambiguous about whether it was
ever checked: `"No escalations or one-occurrence notes raised during Construction on
this Unit."`
