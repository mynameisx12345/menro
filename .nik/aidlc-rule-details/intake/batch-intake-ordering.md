# Batch Intake & Ordering — Stage 0.5

Runs **once per list**, not per Intent — before any individual Elaboration begins. Input
is a batch of raw Intents from BA/PO discussions, handed over together. This is the
triage pass that decides what runs now, what waits, and what runs in parallel — not a
judgment call any single Elaboration session should make for itself mid-flight.

## Process

1. **Ingest the list as given** — whatever form it arrives in (informal notes, ticket
   titles, one-liners). Don't demand it be pre-formatted; that's this stage's job to
   produce, not require as input.
2. **Lightweight pre-check per Intent** — not full Step 0 classification (that's each
   Intent's own Elaboration's job), just enough to order correctly:
   - **Dependency**: does this Intent need something another Intent in this same batch
     produces (a schema, an API, a decision)? Name it if so.
   - **Obvious risk signal**: does it touch auth, PII, a production data change, an
     external integration — enough to flag "don't hand this to someone's first solo
     run," without doing the full risk-level workup Step 5 will do later.
3. **Group into parallel-safe batches vs. sequenced chains** — Intents with no real
   dependency on each other are parallel-safe; a dependency chain gets ordered, not
   parallelized, regardless of how many people are available.
4. **Present the ordering for confirmation** — this is a light approval round with
   PO/BA/Architect, not a unilateral AI decision. State the reasoning (why this grouping,
   why this order), not just the resulting list.
5. **Assign people to Intents** — a human call, not AI's, once the ordering is confirmed.

## Output

`aidlc-docs/intent-queue.md` — one row per Intent, the durable record of this triage:

```markdown
| Intent | Slug | Assigned to | Depends on | Parallel group | Status |
|---|---|---|---|---|---|
| Change shift eye-icon | change-shift-eye-icon | Lester | — | A | In Elaboration |
| Leave balance sync fix | leave-balance-sync-fix | Miguel | — | A | In Elaboration |
| OT approval flow | ot-approval-flow | — | change-shift-eye-icon | B | Waiting |
```

Each Intent's `slug` here is the same one its `aidlc-docs/intents/<slug>/` folder uses
(per `common/multi-intent-parallel-work.md`) — decide the slug now, once, so it doesn't
drift between this queue and the actual folder generated later.

## What this is not
Not a re-litigation of scope — that's Elaboration's job, per Intent, once it actually
starts. This stage only orders and groups; it doesn't resolve ambiguity, doesn't ask
gap-checklist questions, and doesn't produce `requirements.md` for anything.
