# Core Workflow — `.nik`

Version: see `.nik/VERSION` (the canonical source — don't restate the number here).

This is the orchestrator. Every other file in `.nik/` is a rule for one stage;
this file is what says which files load, in what order, and where the gates actually
sit. Modeled on .kiro/AI-DLC's `core-workflow.md` mechanism — same discipline (mandatory
loading order, mandatory state/audit tracking, mandatory question-file format, explicit
approval gates) — rebuilt around this project's own Mob Elaboration → Unit → Construction
shape rather than AWS's generic stage list.

## Folder Structure

Mirrors .kiro's real layout — same top-level names, our own stage shape underneath.

```
.nik/                           <- hidden engine, static rules, not per-project output
  aidlc-rule-details/
    common/          rules that apply across every stage, not one — including
                      multi-intent-parallel-work.md and unit-consolidation.md
    intake/           bootstrap + batch intake + pre-elaboration — everything
                      that runs before the ceremony convenes, including
                      batch-intake-ordering.md (Stage 0.5) and, for projects that
                      opt in (Draft), the Foundation files: capability-register.md,
                      foundation-protocol.md, foundation-reconcile.md
    inception/        Mob Elaboration rules
    construction/     Unit packet template / Construction rules
    operations/        Stage 5 rules — qa-testing-protocol.md, bolt-retro.md
                      (the name is this engine's own internal grouping; their
                      generated output splits into separate aidlc-docs/ folders
                      below, matching the governing doc's own structure)
  steering/
    core-workflow.md            <- this file, the orchestrator
    end-to-end-checklist.md     <- one-page run-it-live checklist

aidlc-docs/                            <- generated per-project, NOT pre-scaffolded
  intent-queue.md                      <- Stage 0.5 output: the ordered/grouped batch
  intents/
    <intent-slug-A>/    <- everything below is THIS Intent's own namespace —
                           see multi-intent-parallel-work.md for why this nesting
                           exists (parallel, uncoordinated local work by construction)
      inception/
        intent.md, requirements.md, personas.md, user-stories.md, ux-review.md,
        elaboration-questions.md, gate-approval-inception.md, unit-breakdown.md,
        ui-summary-package.html (UI-facing Intents with prototypes only)
        units/
          UNIT-1/unit.md    <- the Unit's DEFINITION, as generated at Unit Separation
          UNIT-2/unit.md       time — this is the packet Construction reads, not writes
          ...
      construction/
        UNIT-1/           <- what CONSTRUCTION produces while building that unit:
          questions-log.md      mid-build escalations, dev-output-check detail, PR/POT
          dev-output-check.md   record — same Unit ID as inception/units/, different
                                phase's output, never merged into one folder
          9c-verification*      proof of Section 9c's manual-verification pass — one
                                or more screenshots/output captures (e.g.
                                9c-verification.png, 9c-verification-search.png) —
                                lets a resumed session confirm 9c without re-reading
                                the whole build, per common/session-continuity.md
          server-test-script.md   Draft, opted-in projects only: written at 9c when the
                                Unit adds work that runs on a server outside a request;
                                running it is not a gate (construction/server-test-script.md)
        UNIT-2/
          ...
        shared/           <- cross-unit, but Intent-scoped, not global — resets
                           per Intent, unlike aidlc-docs/shared/ below
          deferred-work.md, gate-approval-construction.md
      testing/            <- per qa-testing-protocol.md + qa-test-case-generation.md,
                             Intent-scoped; test-cases.md/test-case-details/ are authored
                             once per Intent at the end of Stage 3 (Unit Separation), not
                             Construction and not QA's — QA owns test-plan.md/
                             nfr-validation.md/defect-log.md
        test-plan.md, test-cases.md, nfr-validation.md, defect-log.md
        test-case-details/
          UNIT-1.md, UNIT-2.md, ...   <- actual test case content, per Unit
      process/
        bolt-retro-<bolt-id>.md       <- one retro per Intent, covering all of its
                                         Bolts (a Bolt = one Unit's Construction cycle)
    <intent-slug-B>/
      ...                             <- fully self-contained, same shape as above
  shared/             <- TRULY global, cross-Intent, never nested under intents/
    domain-model.md, logical-design.md, infrastructure-design.md   <- living docs,
                       incrementally updated per shared-architecture-docs.md, never
                       written upfront or duplicated per-Unit or per-Intent
  process/
    process-health-log.md   <- GLOBAL cross-Bolt, cross-Intent pattern log (unlike
                                bolt-retro.md itself, which is Intent-scoped above)
  1-shot-feedback-log.md    <- GLOBAL, per one-shot-feedback.md — every post-delivery
                                correction request, classified NIK gap / Player gap
  aidlc-state.md
  audit.md
  PROJECT-RULES.md
```

A Unit's identity spans two folders on purpose: `intents/<slug>/inception/units/UNIT-n/unit.md`
is what Elaboration decided the Unit should be (read-only once Construction starts,
except for the STOP-and-ask escalation path back to it); `intents/<slug>/construction/UNIT-n/`
is everything Construction actually produced while building it — including Sections
11-15 of the Unit template (Definition of Done, Dev Output Check, Closing Actions,
reviewer notes), which are filled in `construction/UNIT-n/dev-output-check.md`, never
in `unit.md`. Don't collapse these
into one folder — the split is what keeps "what was decided" separate from "what
happened while building it." A Unit's full ID is always `<intent-slug>/UNIT-n` — see
`common/multi-intent-parallel-work.md` for why the slug prefix is load-bearing, not
decoration.

## MANDATORY: Loading Order (run this before doing anything else, every session)

1. Load this file in full.
2. Load every file in `.nik/aidlc-rule-details/common/` — these apply across
   every stage, not one: `similarity-consistency-checklist.md`,
   `elaboration-questions-format.md`, `unit-separation-protocol.md`,
   `error-handling.md`, `session-continuity.md`, `multi-intent-parallel-work.md`,
   `multi-repo-units.md`, `unit-consolidation.md`, `one-shot-feedback.md`,
   `maturity-flags.md`, `glossary.md`
   (consult on demand for any term used across files — not something to recite, a lookup aid).
3. Load `.nik/aidlc-rule-details/intake/bootstrap-protocol.md`,
   `.nik/aidlc-rule-details/intake/batch-intake-ordering.md` (only relevant when
   a batch of Intents just arrived — Stage 0.5, below), and
   `.nik/aidlc-rule-details/intake/pre-elaboration-checklist.md`.
   If `PROJECT-RULES.md` §1 says the project opted in to Foundation (Draft), also load
   `intake/capability-register.md`, `intake/foundation-protocol.md`,
   `intake/foundation-reconcile.md` and `intake/project-rules-template.md` (its §1a card,
   which the Unit-close register edits also use). A project with no such line does not load
   them and behaves as before.
3b. **If the user asks for Foundation by name** ("set up Foundation"), load
   `intake/capability-register.md`, `intake/foundation-protocol.md`,
   `intake/foundation-reconcile.md` and `intake/project-rules-template.md` (its §1a card),
   and run `foundation-protocol.md`. This holds in a project that was bootstrapped earlier
   and never saw the Welcome Message notice; the opt-in line is written by that run, so it
   cannot be a precondition for starting it.
4. Load only the stage-specific file(s) for whatever's about to run:
   `.nik/aidlc-rule-details/inception/*.md` for Elaboration,
   `.nik/aidlc-rule-details/construction/*.md` for Construction,
   `.nik/aidlc-rule-details/operations/*.md` for Stage 5 (QA's continuous ceremony, Bolt
   Retro) — this one runs *alongside* Construction, not only after it, per
   `qa-testing-protocol.md`'s own "continuous, not a phase after Construction."
5. Check `aidlc-docs/aidlc-state.md` (Step "State Tracking" below) — if it exists, resume
   from its recorded stage instead of starting fresh.
6. Check `PROJECT-RULES.md` (in `aidlc-docs/`, produced by bootstrap) for this specific
   project's conventions, architecture, and any confirmed-intentional deviations recorded
   as ADRs.

**Never skip straight to a stage's own file without this loading order** — a rule file
read in isolation, without the common/ files and the current state, is exactly how a
consistency check gets skipped or a Parked item gets silently dropped.

## MANDATORY: State Tracking — `aidlc-docs/aidlc-state.md`

One file per project, created by bootstrap, updated at every stage transition. Two-level
tracking within each Intent: which phase it's in, and which stage within that phase. When
more than one Intent is in flight at once (per `batch-intake-ordering.md` /
`multi-intent-parallel-work.md`), this file tracks **all of them**, each in its own
block — this file itself stays global/project-level, it's just the "Current Intent"
section that becomes plural.

```markdown
# NIK State

## Project Information
- Project Type: [Greenfield/Brownfield]
- Bootstrap completed: [ISO timestamp]

## Environment & Tooling Detected
[copied from bootstrap-protocol.md Step 7 output]

## Intent Queue
[link to aidlc-docs/intent-queue.md, if a batch is currently in flight — otherwise "N/A,
single-Intent mode"]

## Intents in Flight
One block per Intent currently anywhere between Stage 1 and Done — most projects most
of the time will have exactly one; a batch run (per Stage 0.5) can have several:

### [Intent slug]
- Intent: [short name/link to aidlc-docs/intents/<intent-slug>/inception/intent.md]
- Phase: [Bootstrap / Elaboration / Unit Separation / Consolidation / Construction / Done]
- Stage detail:
  - [ ] Pre-elaboration checklist complete
  - [ ] Intent classified (new project / new feature / enhancement / bug fix / refactor)
  - [ ] Similarity & consistency check run
  - [ ] Elaboration Round 1 questions answered
  - [ ] Elaboration Round N (if any) answered
  - [ ] UX review complete (or N/A)
  - [ ] Definition of Ready reached
  - [ ] Gate 1 (PO sign-off) recorded
  - [ ] Units separated, unit-breakdown.md written
  - [ ] Unit-breakdown split approved by the team (before packets are populated)
  - [ ] Jira ticket created + developer assigned, per Unit
  - [ ] Consolidated into shared repo state (Stage 3.5, if this Intent ran in parallel
        with others — N/A for single-Intent mode)
  - Per-Unit progress (one row per actual Unit ID — never one shared line for all of
    them, or UNIT-1's progress and UNIT-3's become indistinguishable):
    - [ ] `<intent-slug>/UNIT-1` — construction/ folder created [ ] 9a [ ] 9b [ ] 9c
          [ ] 9d [ ] self-check [ ] PR opened [ ] Jira POT posted [ ] human review
    - [ ] `<intent-slug>/UNIT-2` — construction/ folder created [ ] 9a [ ] 9b [ ] 9c
          [ ] 9d [ ] self-check [ ] PR opened [ ] Jira POT posted [ ] human review
    <!-- one row per Unit in unit-breakdown.md, added as each Unit's entry gate is
         reached — never a single flattened line covering every Unit at once -->
  - [ ] Gate 2 (gate-approval-construction.md) signed

<!-- Repeat one block per Intent in flight. Remove a block once that Intent reaches
     Done — its history lives in audit.md, not as a stale block here. -->

## Extension Configuration
[Reserved for future hard-blocking cross-cutting rules, same mechanism as .kiro's
extensions — none defined yet for this project. Add here if one is ever needed;
default is unconfigured, not silently enforced.]
```

## MANDATORY: Audit Log — `aidlc-docs/audit.md`

Append-only. Every round of questions, every answer batch, every gate approval, every
Parked item, every escalation (Section 10 STOP-and-ask) gets a line. Never summarized,
never overwritten — this is the record of what was actually asked and decided, not a
cleaned-up version of it.

```markdown
## [ISO timestamp] — [event type] — [Intent slug]
[Round N questions created | Round N answers received | Gate 1 approved by <name> |
Unit <slug>/UNIT-3 escalated: <question> | Unit <slug>/UNIT-3 Definition of Done
confirmed | Consolidated into shared repo state (Stage 3.5) | ...]
[Full content, not a summary — the actual question text, the actual answer, the actual
escalation question.]
```

The `[Intent slug]` tag on every line is what makes this one shared log legible once
more than one Intent is in flight — never omit it, even in single-Intent mode.

## MANDATORY: Welcome Message (once per project, first bootstrap only)

```markdown
# 🚀 NIK initialized

This project is now running Mob Elaboration → Unit → Construction per `.nik/`.
- Every Intent goes through Mob Elaboration before any Unit is generated.
- Questions are never asked in chat — they land in a file, per
  `elaboration-questions-format.md`.
- Units are separated by testability and dependency, not a rigid 1:1 story mapping —
  see `unit-separation-protocol.md`.
- Construction runs 1-shot per Unit: build → test → verify → self-check, asking only if
  genuinely blocked.
- Optional, Draft: Foundation writes down how this project is built, shipped, accessed and
  kept safe, so each Intent starts from a checked record. Ask for it by name to start
  (`intake/foundation-protocol.md`); nothing changes if you don't.
- Optional, Draft: Server test script — Units that add a job, command or script that runs on
  a server get step-by-step commands for whoever has server access. Ask for it by name to
  turn it on (`construction/server-test-script.md`); nothing changes if you don't.
Bootstrap findings: [architecture/rules/PM-tool/design-system/CI-CD summary from
bootstrap-protocol.md Step 7]
```

---

## STAGE 0 — Bootstrap (once per project)

Run `bootstrap-protocol.md` in full. Auto-proceeds, no approval gate on detection itself
— only asks the team what evidence genuinely couldn't settle (Step 6 of that file).
Writes `aidlc-docs/aidlc-state.md`'s initial block and `PROJECT-RULES.md`.

**Foundation (Draft, opt-in).** Bootstrap mentions it once in the Welcome Message. If the architect asks for it,
`foundation-protocol.md` runs after detection: the Capability Register is filled from
evidence and confirmed with the architect, the role map is built, and Gate 0 is widened
(that file, Step 5). If nobody asks, nothing here applies.

**Exit**: every row in "Environment & Tooling Detected" is filled or explicitly marked
none-found. Show the Welcome Message once. Proceed to Stage 1 only when a real Intent (or
a batch of them) is given — bootstrap doesn't imply an Intent exists yet.

## STAGE 0.5 — Batch Intake & Ordering (runs once per list, only when a batch arrives)

Run `batch-intake-ordering.md` in full. Skip this stage entirely when a single Intent
arrives on its own — it exists for the case a list of Intents from BA/PO discussions
shows up together, not for every Intent regardless of how it arrived.

**Exit**: `aidlc-docs/intent-queue.md` written — ordered, grouped into parallel-safe
batches vs. sequenced chains, confirmed by PO/BA/Architect, people assigned. Each
queued Intent's slug is locked in now — that's the namespace
`multi-intent-parallel-work.md` depends on, and it shouldn't drift once Stage 1 starts
using it.

## STAGE 1 — Pre-Elaboration (per Intent, before convening)

The team fills `pre-elaboration-checklist.md` before the ceremony starts. This is a
human-side step — the AI's role here is limited to confirming the checklist is complete
enough to proceed, not filling it in itself. If a section is blank and wasn't marked
N/A, flag it before Elaboration starts; don't silently proceed on a gap the team could
have closed for free.

If the project opted in to Foundation, run `intake/foundation-reconcile.md` at Intent
load, before Stage 2 starts: it checks the register rows this Intent touches against the
code and feeds Stage 2's grounding. N/A for a project without Foundation.

**Exit**: checklist filled or explicitly N/A per section (per its own Gate).

## STAGE 2 — Mob Elaboration (per Intent — the live ceremony)

Run in this exact order:

0. **Classify** (`elaboration-protocol.md` Step 0) — New project / New module-feature /
   Enhancement / Bug fix / Refactor, first move, before any grounding. Usually answerable
   from the Intent's own wording — ask only if genuinely ambiguous between two. This
   determines which gap-checklist categories in step 2 below actually carry weight for
   this specific Intent, not a formality to skip past.
1. **Grounding** (`elaboration-protocol.md` Step 1) — read the Intent, search the
   codebase, check `PROJECT-RULES.md`/ADRs, then run **`similarity-consistency-checklist.md`
   in full** (Step 1.4). This is where "does this already exist" and "do two existing
   things disagree" get resolved by AI search — never asked as a blind question. Every
   unresolved checklist item becomes a tagged question, routed to the specific seat
   (BA/PO, Architect/Dev, or QA) that checklist names — never a generic ask to "the team."
2. **Gap-checklist** (`elaboration-protocol.md` Step 2) — the 10 categories, each marked
   Answered / Inferred / Ask.
3. **UX review** (`ux-review-protocol.md`) — only if the Intent is UI-facing. Runs
   alongside step 2, not after it.
4. **Write the question file** (`elaboration-questions-format.md`) — never asked in
   chat. Every question tagged **[Surfacing]** (grounding found something the team
   didn't know) or **[Gap]** (nothing answers this, nothing to surface). If a round
   comes back all-Gap and zero-Surfacing, that's a signal the grounding pass wasn't
   thorough enough, not that the Intent was unusually clear — go back and search harder
   before asking again.
5. **Wait for the team's answers** — filled together, live, as a group. No cross-role
   conflict resolution needed (the team agrees one answer per question) — but a
   genuinely undecided question gets **`PARKED`**, not left blank, not forced to a
   guess. Per `elaboration-questions-format.md`'s file cap: at most two question files
   per Intent, ever (`elaboration-questions.md` + optionally
   `elaboration-clarification-questions.md`) — however many rounds it takes, file count
   doesn't grow past two.
6. **Contradiction/ambiguity pass** (Step 3.5) — mandatory before folding anything into
   `requirements.md`.
7. **Definition of Ready** — every category Answered, Inferred-and-logged, or Parked;
   UX review closed if applicable; PO signs off, Parked list included in the sign-off,
   not hidden from it.

**Optional deeper-scrutiny pass, High/Critical risk Intents only**: before Gate 1
sign-off, offer (don't force) a pre-mortem or red-team pass on `requirements.md` — "if
this turns out wrong, what's the most likely way, and did we actually check for it?"
Only for Intents Step 5's risk level marked High/Critical; running this routinely on
Low-risk Intents is exactly the kind of ceremony this framework exists to avoid. Any
proposed change from this pass needs explicit accept/reject, same as everything else —
nothing gets altered silently.

**Zero findings is a signal to re-check, not a clean bill of health.** A genuine
adversarial pass against a High/Critical-risk Intent finding *nothing* wrong is unusual
enough to be suspicious on its own — more often it means the pass didn't dig, not that
the Intent is bulletproof. Don't record "no concerns" and move on; look again before
accepting a truly empty result.

**Exit**: `requirements.md` written (consolidated answers, confidence tags, Assumptions
Log, Parked/Deferred Items section), Gate 1 signed per
`gate-approval-inception-template.md` into
`aidlc-docs/intents/<intent-slug>/inception/gate-approval-inception.md`, and recorded
in `aidlc-state.md` (a pointer to the signed file, not a duplicate of it).

## STAGE 3 — Unit Separation (end of Elaboration, before Construction)

Run `unit-separation-protocol.md` in full. Not a 1:1 story-to-Unit mapping — split by
independent testability and vertical slice, use dependency chains as split points, merge
only trivially-small tightly-coupled stories. The configured size signal (from
`PROJECT-RULES.md`, default 3 days if unset) triggers exactly one routed question to
Architect/Dev when crossed — never an automatic split.

**Exit**: `unit-breakdown.md` written — one row per Unit, each with its full ID
(`<intent-slug>/UNIT-n`), source story/stories, dependencies, and a link to its
`unit.md` packet — instantiated from the rule template
(`aidlc-rule-details/construction/unit-template.md`) but written to
`aidlc-docs/intents/<intent-slug>/inception/units/UNIT-n/unit.md`, since this is
Elaboration's output (the Unit's definition), not something Construction produces.
Construction reads it from there; what Construction generates while building goes in
`aidlc-docs/intents/<intent-slug>/construction/UNIT-n/` instead — see Folder Structure
above.

**One light approval round before Construction starts** (borrowed from .kiro's Units
Generation gate, condensed to a single pass rather than a separate plan+approve cycle):
show the team the proposed `unit-breakdown.md` — the split itself, not yet the filled
`unit.md` packets — and confirm it before populating each Unit's full detail. Catching a
wrong split here is cheap; catching it after five `unit.md` packets are fully written is
not. This is one round, not a new ceremony — if the team's fine with the split, this
takes seconds, not a form to fill out.

**Check traceability across the full chain before presenting the split**: every
`requirements.md` item appears in `user-stories.md` (nothing lost in the derivation),
every `user-stories.md` AC maps to at least one Unit's Section 2 AC, and every Unit
traces back to something actually in `user-stories.md`/`requirements.md` (no Unit doing
work nobody asked for). Flag orphans anywhere in that chain — don't just check that
Units exist, check that they're the *right* Units.

**Two more checks on the split itself, per `unit-separation-protocol.md` criteria 3 and
5**: no Unit's "Depends on" field points to a Unit sequenced after it (a forward
reference means the sequence or the split is wrong, not just the dependency); and no
three-or-more Units repeatedly modify the same file without a genuine reason for the
split (a feedback loop, risk mitigation, a context-size limit) — an unjustified overlap
routes back to Architect/Dev as one question, not an automatic consolidation.

**Give an explicit verdict, not just approve/reject**:
- **PASS** — split and traceability both clean, proceed straight to ticketing below.
- **CONCERNS** — minor gaps (a borderline split call, a small traceability gap); list
  them, ask the team whether to proceed anyway or fix first — their call, not a block.
- **FAIL** — a real orphan or a split that doesn't hold up; name what's wrong and which
  file fixes it (`unit-separation-protocol.md` for a bad split, back to Stage 2 for a
  traceability gap that traces to a genuine Elaboration miss) — don't proceed to
  ticketing on a FAIL.

**Same round also settles ticketing**: for each approved Unit, create its Jira ticket
(via the Atlassian MCP connector — read/write under the connected user's own
permissions, per `bootstrap-protocol.md`'s PM-tool detection) and assign a developer.
Ticket description is generated from the Unit's `unit.md` (Sections 0-8), not retyped —
one source of truth, not two drifting copies. Record each Unit's ticket key and assignee
back into `unit-breakdown.md` before Construction starts on any of them.

**Same round: Test Case Generation (once per Intent).** Run `inception/qa-test-case-
generation.md`'s Phases 1-4 for every Unit just separated and ticketed above — one pass
covering the whole Intent, not one invocation per Unit. Produces `testing/test-cases.md`
and `testing/test-case-details/UNIT-n.md` for every Unit, committed alongside everything
else Stage 3 just produced. This is what Stage 4's Entry Gate checks for before any
Unit's Construction may begin.

## STAGE 3.5 — Unit Consolidation (only when Intents ran in parallel, per batch)

Skip entirely in single-Intent mode — proceed straight to Stage 4. Run
`unit-consolidation.md` in full whenever this Intent was part of a batch (per Stage 0.5)
that ran alongside others, whether run locally by different people, pushed via branch,
or handed over via Google Drive per `multi-intent-parallel-work.md`.

**Exit**: every source pulled into the shared `aidlc-docs/intents/` tree, no Unit ID
collisions, every consolidated Intent's Gate 1 confirmed signed, every Unit's ticket
confirmed to exist, **every Unit's test cases confirmed to exist** (`testing/test-cases.md`
+ `testing/test-case-details/UNIT-n.md`, per `inception/qa-test-case-generation.md` —
same consolidation risk as tickets: a batch pulled from different local copies could
otherwise silently drop one Intent's test-case output), and any real conflict in
`aidlc-docs/shared/` (domain-model.md/logical-design.md/infrastructure-design.md)
surfaced and resolved between the Intents' owners — not silently overwritten. Logged in
`audit.md`. Only after this may Construction begin picking up tickets from any of the
consolidated Intents' Units.

## STAGE 4 — Construction (per Unit — entry/exit gate only, not per-stage)

**Entry gate**: four checks, not three.
1. **Assignment check** — confirm the person about to build this Unit is actually its
   recorded assignee in `unit-breakdown.md`. This matters specifically because a Unit
   folder can travel on its own (per `multi-intent-parallel-work.md`) — someone building
   from a copied folder with no other context has no other way to know whether this
   ticket is really theirs, or whether another dev, working from their own copy of the
   same Intent folder, is already building it. If the assignee doesn't match (or isn't
   recorded), stop and confirm before writing any code — don't proceed on the assumption
   that having the folder implies the assignment.
2. **Completeness check** — the Unit's `unit.md` (from `unit-template.md`) is fully
   populated — every section resolved, no unresolved ambiguity carried in except
   explicitly logged Parked items (Section 8b) and Assumptions (Section 8). If
   Construction discovers a consistency question Elaboration didn't catch, or a Parked
   item turns out to actually matter, that's `unit-template.md` Section 10's
   STOP-and-ask — never a silent guess.
3. **Test-plan check** — this Intent's `testing/test-plan.md` already exists (per
   `operations/qa-testing-protocol.md` item 1, written once per Intent right after Stage
   3 ticketing). If it doesn't, **write it before this Unit's own Construction begins** —
   confirmed by direct experience that this step gets silently skipped otherwise: a
   sentence in a different file nobody's actively re-reading at this exact moment isn't
   a real enforcement point, this entry gate is.
4. **Test-cases check** — this Unit's own `testing/test-case-details/UNIT-n.md` (and the
   Intent's shared `testing/test-cases.md` index) already exist (per `inception/qa-test-
   case-generation.md`, authored once per Intent at the end of Stage 3, covering every
   Unit Separation produced). If they don't — most likely this Unit was added later via
   a Mid-Workflow Change, after the original batch pass already ran — **run `qa-test-
   case-generation.md`'s Phases 1-4 now, for this Unit alone, before Construction
   begins.** Same enforcement reasoning as the test-plan check: a step that only exists
   as an instruction inside Section 9d is exactly the kind of thing that gets silently
   skipped — a real incident this project already had (leave-approval/UNIT-1 shipped
   with no `testing/` folder at all). This entry gate is the actual enforcement point.

Run in order, no per-stage approval in between (this is the actual "1-shot" mechanism):

0. **Create `aidlc-docs/intents/<intent-slug>/construction/UNIT-n/` immediately, before
   any implementation** — and initialize both files inside it, not just one:
   - `dev-output-check.md` — header + `Status: In Progress`; it's where Sections 11-15
     get filled in later (Section 12 onward), never `unit.md`.
   - `questions-log.md` — header, initialized with `"No escalations or one-occurrence
     notes raised during Construction on this Unit"` (per
     `questions-log-template.md`'s own fallback), replaced with real entries only if
     Section 10 actually fires.
   Both, not just one — otherwise the same ambiguity Step 0 exists to prevent for the
   folder itself just reappears one level down: nothing would distinguish "this Unit
   genuinely raised zero questions" from "this Unit's questions were never logged."
   This is the visible, on-disk proof Construction has actually started on this Unit —
   not decoration: without it, nothing distinguishes "Construction hasn't started" from
   "Construction ran without following this sequence at all." Update
   `aidlc-state.md`'s per-Unit row (below) to reflect this at the same time.
1. Implement per Sections 1-8.
2. **9a** Unit tests.
3. **9b** Integration tests — only if triggered (full request/response cycle,
   multi-model transaction, external integration call, or a consumed contract).
4. **9c** Manual verification in the live running app — **hard gate**, must pass before
   9d starts. Never automate on top of an unverified feature.
5. **9d** Test automation — reads this Unit's already-generated test cases (authored
   once per Intent at the end of Stage 3, per `inception/qa-test-case-generation.md`;
   confirmed present by this Entry Gate's own test-cases check above, or generated now
   as the Mid-Workflow-Change fallback if this Unit arrived after that batch pass ran),
   then automation branched by surface — web (invoke this project's own generator
   skill, e.g. `/web-automation`, once per generated test case; then
   `@pytest.mark.smoke`, `/smoke-test`) / mobile (the Unit's own repo's generator skill,
   `/ui-automation` on `hr-iris-android` `release/development` / `hr-iris-ios`
   `develop`, once per generated test case; then `@SmokeTest` / `SmokeTestPlan`, and
   that repo's `/smoke-test` against a local backend — the Unit closes on that run, and
   the DEV run is added after deploy as its own proof (`unit-template.md` 9d step 4);
   flag manual-testing-required on the Jira ticket only for steps automation can't drive,
   or for a mobile repo with genuinely no generator) / not applicable (no UI surface).
6. Section 11/12 self-check — every AC, every scope boundary, every 9a-9d outcome
   recorded in Section 12's result words (Verified / Not verified / N/A), not waved through.
7. **Section 13 closing actions**: open the PR (referencing the Unit ID and its Jira
   ticket), then post a Jira comment with **POT (Proof of Testing)** — real evidence
   (test output, run links — for mobile, the local run now and the DEV run as a follow-up
   comment after deploy — the 9c walkthrough confirmation, or a mobile manual-testing
   flag for steps automation can't drive), not a restatement of what Section 12 already
   says. The POT ends with a commit link to each `9c-verification*` file, pushed before
   posting — links only, no images uploaded (Section 13).

**Exit gate**: human review of the completed `dev-output-check.md` (Sections 11-15 —
Section 12's Dev Output Check above all) and the PR/POT from Section 13, per Section 14's reviewer discipline — reconcile the diff against Section 2's
AC independently of Section 12's own claim, and verify at least the checkable claims
too, don't just read Section 12 and approve. Whatever Section 14 turns up routes per
Section 15 (back to PO / dev fixes and rebuilds / trivial patch / defer to
`deferred-work.md`) — a finding is never just "go fix it" without asking where its root
cause actually sits. This is the only other approval point in Construction — entry and
exit, nothing in between.

## STAGE 4.5 — Intent-Level Verification (once all of an Intent's Units are Done)

Each Unit verifies its own Acceptance Criteria in isolation (Section 9/11/12). Nothing
checks that the Units actually compose into the Intent's original goal once all of them
ship — a real gap, not a hypothetical one: HRIS-1392-1562 alone was dozens of separate
Units/PRs that had to work *together* as one Change Shift feature.

**Once every Unit for an Intent is marked Done**, two checks, not one:

1. **Seam check** — walk through the Intent's original Acceptance Criteria (from
   `requirements.md`, not any single Unit's subset) as an actual end-to-end pass across
   the now-integrated Units. Not re-testing each Unit again — confirming the seams
   between them work.
2. **Aggregate-view check** — the defects no single Unit's own review would show because
   no single Unit saw the whole picture: do two Units that should follow the same
   pattern actually agree (pattern divergence between Units built at different times)?
   Is there duplication across Units that a per-Unit review wouldn't catch? Did the
   consistency-check ADRs from Elaboration actually get followed once multiple Units
   touched the same area?

**Give an explicit verdict — never let it default silently**:
- **Accepted** — both checks clean.
- **Accepted with open items** — minor gaps found; log them as follow-up, don't block
  the Intent on them, but they're recorded, not silently dropped.
- **Rejected** — a real seam or aggregate-level defect. Don't mark the Intent Done;
  route back to whichever Unit(s) need rework.
An Intent with no explicit verdict recorded is **not accepted** — never silently treated
as accepted just because its last Unit's PR merged. QA owns this pass, per
`qa-testing-protocol.md` (Stage 5, below) — whoever closes the last Unit is responsible
for triggering it explicitly.

The verdict gets signed per `gate-approval-construction-template.md` into
`aidlc-docs/intents/<intent-slug>/construction/shared/gate-approval-construction.md` —
this is the Intent-level Gate 2, distinct from each Unit's own exit gate (Section 14/15,
including its Test Coverage Reconciliation).

**Exit**: Intent marked Done in `aidlc-state.md` only after `gate-approval-construction.md`
is signed Accepted or Accepted-with-open-items — never automatically when the last
Unit's checkbox ticks.

## STAGE 5 — Testing / Process (continuous, runs alongside Stages 2-4, not after)

Two ceremony owners, each continuous across every phase, not a single after-the-fact
phase:

- **QA** — per `qa-testing-protocol.md`. `test-plan.md` written once per Intent before
  Construction starts; `nfr-validation.md` rolls up as each Unit completes 9a/9b;
  `defect-log.md` runs continuously (QA's own independent check from running the suite,
  plus filtered `deferred-work.md` entries). `test-cases.md`/`test-case-details/` are
  *not* QA-owned roll-ups — they're authored once per Intent at the end of Stage 3 (Unit
  Separation), per `inception/qa-test-case-generation.md`, not mid-Construction and not
  a separate QA ceremony. QA has no live, per-Unit blocking
  checkpoint in this model — their check is Section 14/15's own **Test Coverage
  Reconciliation** (same PR reviewer, same moment as code review), and QA's independent
  execution of the suite happens after merge, on their own schedule, not as a gate.
- **Process Facilitator** — per `bolt-retro.md` (retrospective, run once per Intent
  across its Bolts — a Bolt is one Unit's Construction cycle) and `process-health-log.md`
  (the running cross-Bolt pattern log Bolt Retro's Finalize phase feeds).

`gate-approval-construction.md` (Stage 4.5) should not be signed Accepted while any
Unit under that Intent still has an unresolved Test Coverage Reconciliation finding from
its own Section 14/15 — the two gates must stay in sync, not drift independently.

If a project running this engine has no one actually staffing a QA seat, say so
explicitly at Bootstrap and note the gap in `PROJECT-RULES.md` — generating these files
with no one behind them is ceremony, not the real thing this stage exists for.

---

## Escalation (applies at every stage)

- Conflict between this file and a specific stage file: the stage file wins for its own
  stage's detail, this file wins for sequencing/gating. A genuine contradiction between
  the two gets logged in `aidlc-docs/audit.md` and resolved before continuing, not
  silently picked one way.
- Anything not covered by any file here: treat as a scope question for the PO/Architect,
  per the Initiation Document's change-control process — not a judgment call to make
  alone.

## Mid-Workflow Changes

Something changes mid-flight — a Unit needs redoing after its ticket already exists, a
Parked item turns out to matter and forces a rethink, the team wants to restart
Elaboration on an already-approved Intent. Don't handle this ad hoc; classify the change
scope first, since that determines who needs to be involved, not just what gets edited.

**If the trigger is specifically a correction request on a Unit that already passed its
exit gate** — already delivered, not mid-flight — run `common/one-shot-feedback.md`
first, alongside this classification, not instead of it: diagnose *why* the fix is
needed (NIK gap vs. Player gap) here, then classify and execute the fix itself through
whichever severity below actually applies.

- **Minor** — a single Unit's detail changes, nothing else depends on it yet. The
  developer/Architect on that Unit can make the call directly, log it in `audit.md`,
  proceed.
- **Moderate** — the change affects `unit-breakdown.md` itself (splitting, merging, or
  reordering Units) or a ticket that's already assigned. Needs PO + Architect/Dev
  agreement, not a unilateral edit — same light-approval-round pattern as the original
  Unit-breakdown sign-off in Stage 3.
- **Major** — the change affects `requirements.md` itself (the Intent's own scope
  changed) or invalidates Gate 1's sign-off. Goes back through Stage 2 properly — this
  isn't a patch, it's re-elaborating, and should be treated with the same rigor as the
  first pass, not rushed because "most of it still applies."

Whatever the scope: state the actual change as an explicit before → after with a reason,
the same discipline as everything else in this framework — never just "we decided to
change it" with no record of what or why. Log in `audit.md`, update `aidlc-state.md` to
reflect which stage is now actually current, and don't let downstream artifacts silently
drift out of sync with the change.

## Known Gaps (say so, don't paper over it)

- ~~`PROJECT-RULES.md` template~~ — **closed**, see `intake/project-rules-template.md`.
- ~~`gate-approval-inception.md`, `gate-approval-construction.md` templates~~ — **closed**,
  see `inception/gate-approval-inception-template.md` and
  `construction/gate-approval-construction-template.md`.
- ~~`questions-log.md` template~~ — **closed**, see
  `construction/questions-log-template.md`.
- ~~Stage 5 (Testing/Process)~~ — **closed**, see `operations/qa-testing-protocol.md`
  (QA) and `operations/bolt-retro.md` (Process Facilitator).
- Extension Configuration mechanism exists in the state format but nothing populates it
  yet — first real use will define the pattern, not this file guessing at one.
- ~~Mid-workflow change handling~~ — **closed**, see "Mid-Workflow Changes" above.
- ~~No consolidated terminology glossary~~ — **closed**, see `common/glossary.md`.
- ~~UI preview at Mob Elaboration sign-off (Gate 1)~~ — **closed** (v2.0.0), see
  `inception/ux-review-protocol.md` Steps 3 and 5. Resolved exactly the open question
  that parked this: a real rendered mock, never a described wireframe — mandatory
  interactive `.html` prototypes (device-shell wrapped for mobile), consolidated into a
  Gate 1 UI Summary Package the PO reviews before sign-off.
- ~~Mobile test-automation scaffolding skill~~ — **closed** (v3.3.0). `hr-iris-android`
  and `hr-iris-ios` each now have a generator (`/ui-automation`) alongside their runner
  (`/smoke-test`) and a shared `test-accounts` contract, built under each repo's own
  `.claude/skills/`, not inside `.nik`. `construction/unit-template.md` Section 9d Branch
  2 now invokes them the same way Branch 1 invokes `/web-automation`.
- **Bootstrap never checks whether an automation-generator skill exists at all** — related
  to the (now closed) mobile gap above but broader: `intake/bootstrap-protocol.md` doesn't check, for *any*
  repo it's run against, whether something like `/web-automation` (generate) actually
  exists alongside a runner like `/smoke-test` (run). Right now `construction/unit-
  template.md` Section 9d just assumes one does. Idea, not yet built: Bootstrap should
  detect this per-repo and record it in `PROJECT-RULES.md` — if no generator skill is
  found, say so explicitly rather than silently assuming one exists, and note that test
  *cases* still get generated at Stage 3 regardless (`qa-test-case-generation.md` doesn't
  depend on this), just that no automation gets scaffolded from them until a generator
  exists for that repo. Parked at Antero's request — pick up later.
- **Bootstrap never asks whether a QA seat is staffed** — Stage 5 above and
  `operations/qa-testing-protocol.md` both say an unstaffed QA seat should be stated
  explicitly at Bootstrap and noted in `PROJECT-RULES.md`, but
  `intake/bootstrap-protocol.md` has no step that asks. Until it does, raise it manually
  at Bootstrap rather than assuming QA is staffed.
- **Cosmetic: question-file heading levels are inverted** — in
  `common/elaboration-questions-format.md`'s File Structure, each `## Question N` sits at
  a higher heading level than the `### Category` it belongs to. Left as-is on purpose:
  changing it would change the format of question files teams already fill in, and
  parsing relies on `[Answer]:` tags, not headings.
