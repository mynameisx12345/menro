# Unit Consolidation — Stage 3.5 (between Unit Separation and Construction)

Runs once one or more Intents from the same batch (per `intake/batch-intake-ordering.md`)
have each completed their own Stage 3 (Unit Separation, tickets created). This is the
pull-together point `multi-intent-parallel-work.md` refers to: parallel, local,
uncoordinated work becomes one consolidated, shared state — **before** Construction is
allowed to start on any Unit from any of them. Owned by the Process Facilitator, as an
extension of their existing artifact-hygiene responsibility.

## Steps

1. **Collect every source.** For each Intent in this consolidation batch: pull its pushed
   branch (if it has one) and/or copy in its Drive-saved `intents/<slug>/` folder (if
   that's how it arrived) into the repo's `aidlc-docs/intents/` tree.
2. **Verify no Unit ID collisions.** Should be structurally impossible given the
   `<intent-slug>/UNIT-n` scheme — check anyway. A collision here means the slug itself
   was reused across two different Intents; fix the slug, don't rename Units around it.
3. **Confirm each Intent's Gate 1 is actually signed** — `gate-approval-inception.md`
   exists and is signed Approved (or Approved with conditions) for every Intent being
   consolidated. An Intent without a signed Gate 1 doesn't get consolidated in — it's not
   ready, regardless of how much local work exists for it.
4. **Confirm `unit-breakdown.md` tickets exist** for every Unit in every Intent being
   consolidated — Stage 3's own exit condition, re-checked here because parallel work
   means it's easy for one Intent's ticketing to have been missed while attention was on
   another.
5. **Confirm every Unit's test cases exist** — `testing/test-cases.md` plus
   `testing/test-case-details/UNIT-n.md` for every Unit in every Intent being
   consolidated (per `inception/qa-test-case-generation.md`). Same reason as step 4: a
   batch pulled from different local copies can silently drop one Intent's test-case
   output.
6. **Check `aidlc-docs/shared/` for real conflicts.** If two Intents in this batch both
   touched `domain-model.md`/`logical-design.md`/`infrastructure-design.md`, don't
   silently take the last-merged version — read both, and if they genuinely conflict
   (not just two additive edits), that's a decision for whoever owns each Intent to
   resolve together, not something to pick a winner on unilaterally.

## Exit

Only after all six steps pass does Construction (Stage 4) begin picking up tickets from
any consolidated Intent's Units. Log the consolidation itself in `audit.md` — which
Intents, which sources (branch vs. Drive), any conflict found and how it resolved — same
discipline as everything else in this framework: a real record, not a "done" checkbox.

## What this is not
Not a second Gate 1 or Gate 2 — it doesn't re-approve any Intent's scope or re-run Stage
4.5's Intent-level verification. It only confirms parallel work is safe to merge into one
shared state; the actual gates (`gate-approval-inception.md`, `gate-approval-construction.md`)
still do their own jobs at their own points in each Intent's own lifecycle.
