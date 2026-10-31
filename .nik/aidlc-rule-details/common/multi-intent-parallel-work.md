# Multi-Intent Parallel Work

Governs how more than one Intent can be in Elaboration or Construction at the same time,
run by different people, entirely locally, without coordinating at creation time. This
only works because of one structural rule: **every Intent owns its own namespace, by
construction, not by discipline.**

## Folder structure

```
aidlc-docs/
  intents/
    <intent-slug-A>/
      inception/     intent.md, requirements.md, personas.md, user-stories.md,
                      ux-review.md, elaboration-questions.md,
                      elaboration-clarification-questions.md (only if needed),
                      gate-approval-inception.md, unit-breakdown.md,
                      ui-summary-package.html (only if needed)
        units/
          UNIT-1/unit.md
          UNIT-2/unit.md
      construction/
        UNIT-1/       questions-log.md, dev-output-check.md, ...
        UNIT-2/
        shared/       deferred-work.md, gate-approval-construction.md
                       <- Intent-scoped: shared across THIS Intent's Units,
                          not across other Intents
      testing/        test-plan.md, test-cases.md, nfr-validation.md, defect-log.md,
                      test-case-details/UNIT-n.md
      process/        bolt-retro-<bolt-id>.md
    <intent-slug-B>/
      ...
  shared/             <- TRULY global, cross-Intent — never nested under intents/
    domain-model.md, logical-design.md, infrastructure-design.md
  process/            process-health-log.md   <- global, cross-Intent
  1-shot-feedback-log.md                       <- global, cross-Intent
  intent-queue.md      <- output of Stage 0.5, `intake/batch-intake-ordering.md`
  aidlc-state.md, audit.md, PROJECT-RULES.md
```

Same tree as `steering/core-workflow.md`'s Folder Structure, which is the canonical copy
if the two ever disagree.

Two different "shared" folders exist on purpose, at different scopes — don't confuse
them:
- `aidlc-docs/intents/<slug>/construction/shared/` — this Intent's own cross-Unit
  artifacts (`deferred-work.md`, `gate-approval-construction.md`). Resets per Intent.
- `aidlc-docs/shared/` — genuinely global, cross-Intent, cumulative knowledge
  (`domain-model.md`, `logical-design.md`, `infrastructure-design.md`, per
  `construction/shared-architecture-docs.md`). Never reset, never duplicated per Intent.

## Unit IDs

A Unit's full ID is `<intent-slug>/UNIT-n`, never a bare `UNIT-n`. This is what makes
parallel, uncoordinated local generation safe — two people working on two different
Intents can never produce a colliding Unit ID, because each Intent already owns its own
namespace. `UNIT-n` alone (without the slug) is only ever shorthand *within* a single
Intent's own conversation, never the identifier recorded in a ticket, a cross-reference,
or `aidlc-state.md`.

## The handoff: repo access vs. no repo access

Once an Intent's `aidlc-docs/intents/<slug>/` subtree exists locally (through
Elaboration, and through Construction as Units complete), it needs to reach the shared
repo before Construction can start pulling tickets from it. Two paths, by whoever ran
that Intent's work:

- **Has repo access**: commit the whole `intents/<slug>/` folder to a branch (named for
  the Intent, e.g. `intent/<slug>`) and push it.
- **No repo access** (a BA/PO/SM running Elaboration without a dev environment): save
  the same `intents/<slug>/` folder structure to the team's shared Google Drive location,
  using the identical slug-named subfolder — so whoever consolidates later can map it
  onto the repo 1:1, without renaming or reorganizing anything by hand.

Neither path is "the right one" — they're both legitimate, chosen by what access the
person running that Intent actually has.

**Whoever has repo access pushes the whole Intent folder before any Unit is assigned —
this is required, not optional.** Confirmed real failure mode without it: a Unit Runner
copies the Drive folder straight into their own local `aidlc-docs/` and starts
Construction, and their own PR ends up carrying the *entire* Intent's inception docs
(every other Unit's `unit.md` included, not just theirs) — because nothing put it in the
repo first. That's not a small cosmetic issue: it looks exactly like the unrelated-files
problem `/pr-review`'s Footprint Note check exists to catch, on a PR that otherwise has
nothing wrong with it.

The fix is sequencing, not a new mechanism: once Gate 1 is signed, whoever has repo
access commits the whole `intents/<slug>/` folder (Drive-sourced or not) directly — a
small housekeeping commit, not bundled into anyone's feature work. Unit Runners are then
assigned a Unit *after* that commit exists, and simply `git pull` to get it — never copy
from Drive into their own working copy themselves. Their own Construction PR then only
ever contains their own Unit's actual diff, correctly scoped, with no exception needed
anywhere else in the framework to compensate for it.

## The real risk this doesn't eliminate

Namespacing prevents *Unit ID* collisions structurally. It does **not** prevent two
Intents genuinely touching the same domain area from producing conflicting updates to
`aidlc-docs/shared/domain-model.md` (or `logical-design.md`/`infrastructure-design.md`)
once both are consolidated together. That's a real merge conversation between whoever
ran each Intent — not a mechanical problem this structure solves, and not something to
paper over by having one Intent's update silently win. `common/unit-consolidation.md`
is where this gets checked before Construction starts.
