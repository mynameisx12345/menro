# Terminology Glossary

This framework's own vocabulary, defined once, in one place. Every term below is used
consistently across multiple files — if a term only means something inside one file's
own step-by-step logic (a verdict label, a checklist bullet), it's not repeated here;
that file's own context is definition enough. Each entry points to the file that's the
actual authority, so this glossary is a lookup aid, not a second copy of the rule.

Alphabetical. Cross-references use `→`.

---

**AC Reconciliation** — the exit-gate reviewer's independent walk of the diff against
`unit.md` Section 2's numbered AC, done from the code itself, not from Section 12's
self-report. → `construction/unit-template.md` Section 14.

**Activation pointer** — the line in the project's own root rules file (`CLAUDE.md` or
equivalent) that tells an AI session to load `.nik/steering/core-workflow.md`
before acting on an Elaboration/Construction request. Without it, a bare prompt like
"start construction of `<intent-slug>/UNIT-n`" has no guaranteed trigger to actually
follow this framework's mechanics — checked at Bootstrap, never silently assumed to
exist. → `intake/bootstrap-protocol.md` Step 3b.

**ADR (Architecture Decision Record)** — recorded when a confirmed, intentional
divergence from an established pattern needs to bind future Units, per the 3-part test
(divergence-possible, non-obvious, real trade-off). Goes in the project's own existing
decision-record file in its own format; only if none exists, `adr-NNN.md` in
Binds/Prevents/Rule format. → `construction/adr-protocol.md`,
`intake/project-rules-template.md` Section 3, `common/similarity-consistency-checklist.md`
item 5.

**Agent Setup** — the AI-facing files, sections, skills and permissions a project uses to
tell its AI agents how to work, organised by **role** (architecture, conventions, standing
rules, agent limits, and so on) rather than by file name. An Intent never changes it
automatically. (Draft) → `intake/capability-register.md` (Role map),
`intake/foundation-reconcile.md`.

**Aggregate-view check** — one of Stage 4.5's two checks: defects no single Unit's own
review would show because no single Unit saw the whole picture (pattern divergence
across Units, duplication, an ADR followed inconsistently). → `steering/core-workflow.md`
Stage 4.5.

**Assumption** — an Inferred gap-checklist answer, logged (never silently made) in
`elaboration-questions.md`'s Assumptions Log as a numbered, contestable statement the PO
can veto at Gate 1. → `inception/elaboration-protocol.md` Step 4.

**Batch Intake & Ordering** — Stage 0.5, runs once per list when a batch of Intents
arrives from BA/PO together (not per Intent): triages dependency vs. independence,
groups parallel-safe batches, gets the ordering confirmed, and locks in each Intent's
slug before Elaboration starts. → `intake/batch-intake-ordering.md`.

**Bolt** — one Unit's Construction cycle. This framework's unit of execution — variable
length, sized to that Unit's actual scope, not a fixed sprint. → `steering/core-workflow.md`
Stage 4; `operations/bolt-retro.md`.

**Bolt Retro** — the Process Facilitator's process-health retrospective, run once per
Intent across all of that Intent's Bolts — Gather → Analyze → (optional) Team Discussion → Decide → Finalize, ending in an explicit
Healthy / Healthy-with-follow-ups / Needs-attention verdict. Distinct from Stage 4.5's
per-Intent code-correctness check — this is about whether the *process* ran well.
→ `operations/bolt-retro.md`.

**Branch sweep** — a mechanical, pre-handoff self-check: walk every branch/condition a
diff touches, including implicit branches in any fixed set of values (an enum, a status
code, an environment string) the diff only partially special-cases. Named after this
project's own `ENV != "prod"` incident. → `construction/unit-template.md` Section 11.

**Capability Register** — the 15-row record of project-level facts (how it is built,
deployed, accessed, tested and kept safe) that extends `PROJECT-RULES.md` §1 as §1a, with a
state, evidence and owner per row. (Draft, opt-in) → `intake/capability-register.md`.

**Claims-check** — verifying the checkable claims in Section 12/the PR description
independently (does the cited test actually pass, does the cited file actually say
what's claimed) — the narrative is testimony, not evidence. → `construction/unit-template.md`
Section 14.

**Classification** (Step 0) — the first move of every Elaboration round: New project /
New module-feature / Enhancement / Bug fix / Refactor-technical. Determines which
gap-checklist categories actually matter and whether Fast path can be offered.
→ `inception/elaboration-protocol.md` Step 0.

**Coaching path** / **Fast path** — the two paces Elaboration can run at, offered once
after classification. Coaching is the full round-by-round gap-checklist (default for
High/Critical risk). Fast batches the AI's best inference into one draft for the PO to
correct in one pass — never offered on High/Critical risk. Both still clear the same
Definition of Ready bar. → `inception/elaboration-protocol.md`.

**Confidence** (tag) — High/Medium/Low, per section of `requirements.md`: how sure the
team is that section is right. A different axis from **Risk** (below) — a section can be
high-confidence and still high-risk. → `inception/elaboration-protocol.md` Step 5.

**Consistency check** — `similarity-consistency-checklist.md`, run during Step 1
grounding: does this already exist, do multiple versions disagree, is the existing one
still good, full or partial match, new-standard-or-one-off, QA stake, external/vendor
integration. Every unclear answer becomes a routed, tagged question.
→ `common/similarity-consistency-checklist.md`.

**Deferred-work.md** — the append-only, cross-Unit log for real-but-out-of-scope
findings from a Section 15 disposition ("not this Unit's problem") — logged so a
legitimate discovery doesn't evaporate or force scope creep. → `construction/unit-template.md`
Section 15.

**Definition of Done** — a Unit's own self-check before handing to human review: every
AC Verified (or its gap recorded for the reviewer), only in-scope files touched, 9a-9d outcomes recorded (9c with its proof
files), branch sweep performed, Section 12/14 filled in — all in
`construction/UNIT-n/dev-output-check.md`, never `unit.md`. → `construction/unit-template.md`
Section 11.

**Definition of Ready** — the gate that clears an Intent to proceed from Elaboration to
Unit decomposition: every gap-checklist category resolved or Parked, no open
divergent-interpretation question, UX review closed if applicable, `personas.md`/
`user-stories.md` written, PO signed off. → `inception/elaboration-protocol.md`.

**Deletion check** — verifying that removed/replaced code either had its behavior
re-established elsewhere or was deliberately retired, not silently dropped.
→ `construction/unit-template.md` Section 14.

**Entry gate** / **Exit gate** — Construction's only two approval points for a Unit.
Entry: four checks — the person building it is actually its recorded assignee in
`unit-breakdown.md`; the Unit's packet is fully populated, nothing unresolved except
logged Parked/Assumptions; the Intent's `testing/test-plan.md` exists; and the Unit's
`testing/test-case-details/UNIT-n.md` exists. Exit: independent human review per Section 14/15 — nothing in
between the two. → `steering/core-workflow.md` Stage 4.

**Escalation** — Section 10's STOP-and-ask rule: a genuine blocker (real ambiguity,
missing dependency, an irreversible action, a convention conflict) stops and asks,
logged in `questions-log.md`; a small non-consequential choice gets decided and logged
as an assumption instead. → `construction/unit-template.md` Section 10.

**Exposed (flag)** — set on a register row when a credential is readable where it should not
be (for example in version control). Sits beside the State and cannot be replaced by Waived
or Unknown; stays until the credential is removed and rotated. (Draft) →
`intake/capability-register.md`.

**Foundation** — Stage 0, part 2: the architect-led session that fills the Capability
Register from evidence, builds the role map and closes with the new-manager test. Opt-in per
project. (Draft) → `intake/foundation-protocol.md`.

**Gap question** vs **Surfacing question** — two kinds of question Elaboration can ask.
A Gap question: the Intent simply doesn't say, and nothing in the code implies an
answer. A Surfacing question: grounding found something concrete that complicates or
contradicts the Intent as written — lead with the finding, then the question. A round
with only Gap questions and zero Surfacing questions signals grounding wasn't thorough
enough. → `inception/elaboration-protocol.md`.

**Gate 1** — Inception's exit gate: PO/BA-signed approval that Elaboration is done and
Construction/ticketing may begin, recorded in `gate-approval-inception.md`.
→ `inception/gate-approval-inception-template.md`.

**Gate 1 UI Summary Package** — every interactive prototype produced anywhere in a UI-
facing Intent's Elaboration session, consolidated into one place
(`inception/ui-summary-package.html`) immediately before Gate 1 sign-off, so the PO reviews the real rendered result together, not scattered across
the session's history. Closed a previously parked idea (no UI preview existed at Gate 1
sign-off at all). → `inception/ux-review-protocol.md` Step 5.

**Gate 2** — the Intent-level Construction exit gate: Architect/Engineer-signed
approval that every Unit's own exit gate has passed and Stage 4.5's checks are clean,
recorded in `gate-approval-construction.md`. Distinct from any single Unit's own exit
gate. → `construction/gate-approval-construction-template.md`.

**Greenfield / Brownfield (UX surface)** — a per-Intent classification, distinct from
Bootstrap's one-time, project-wide greenfield/brownfield detection
(`intake/bootstrap-protocol.md` Step 2): confirms whether *this Intent's specific UI
surface* has usable design tokens/components to derive from (Brownfield) or not
(Greenfield), since a mostly-brownfield project can still have a genuinely greenfield
pocket. → `inception/ux-review-protocol.md` Step 0.

**Intent** — the raw, high-level business ask that starts everything, captured verbatim
(lightly structured under Goal/Success Criteria/Stakeholders/Constraints) in
`intent.md` before Elaboration resolves what it actually means.
→ `inception/elaboration-protocol.md` Step 1.

**Maturity (Draft / Tested / Proven)** — how much real-project evidence stands behind a
rule. New features from 3.5.0 are Draft and opt-in; a level moves up only with an evidence
entry and the NIK maintainer's sign-off; already-active rules carry the separate label
**In force, unproven**. → `common/maturity-flags.md`.

**Migration Safety Protocol** — the two-part check for a Unit's migration whose
`RunPython` step validates existing data and can legitimately raise: (1) verify the
mapping against the real target database before merge, not discovered live in CI after;
(2) on a non-transactional-DDL database (MySQL confirmed), split schema-only operations
from the risky data-validation step into separate migration files, so a failed validation
never leaves orphaned schema changes behind. → `construction/migration-safety-protocol.md`,
`construction/unit-template.md` Sections 4 and 11.

**Mob Construction** — this framework's name for the Construction ceremony: a Unit run
end-to-end in one pass (Sections 1-15), no per-stage approval in between — the actual
"1-shot" mechanism. → `steering/core-workflow.md` Stage 4.

**Mob Elaboration** — this framework's name for the Inception ceremony: the team plus AI
interrogating a raw Intent together, live, until it clears Definition of Ready.
→ `inception/elaboration-protocol.md`.

**Multi-Intent Parallel Work** — the rules that let more than one Intent be in
Elaboration or Construction at once, run by different people, entirely locally, without
collision: every Intent owns its own namespace (`aidlc-docs/intents/<slug>/`), Unit IDs
are always the full `<slug>/UNIT-n` form, and truly global artifacts (shared
architecture docs, `PROJECT-RULES.md`) live outside any Intent's own subtree.
→ `common/multi-intent-parallel-work.md`.

**Non-goal** — a mandatory (never optional) statement of what an Intent explicitly does
NOT attempt. Absence of one isn't a clean pass — it's a vacuum Construction will fill
with its own guess. A constraint that doesn't actually rule anything out is decoration,
not a requirement. → `inception/elaboration-protocol.md` Step 2.

**1-shot** — the actual target this whole framework optimizes for: zero developer
re-prompting after delivery, from Intent to working, verified code, in one pass. Not "no
back-and-forth in Elaboration" (Elaboration's multi-round nature is *in service of* this,
not separate from it) — the outcome is what's 1-shot, not the number of rounds it took
to get there. → `steering/end-to-end-checklist.md`.

**1-Shot Feedback** — the mechanism for when 1-shot fails in practice: any correction
request on a Unit already past its exit gate gets captured verbatim, traced to whichever
mechanism should have caught it, and classified NIK gap (a real framework fix, proposed
not applied silently) / Player gap (coaching feedback, not a framework change) / Both.
Logged to the global `aidlc-docs/1-shot-feedback-log.md`, and read directly by Bolt
Retro's Framework-vs-team-fault analysis. → `common/one-shot-feedback.md`.

**PARKED** — an explicitly deferred answer to an Elaboration question — a real decision
to defer, not a blank. Doesn't block Definition of Ready on its own, but every Parked
item must be listed and explicitly acknowledged at Gate 1. → `common/elaboration-questions-format.md`.

**Pattern Source Attribution** — every UI prototype carries an HTML comment citing where
its pattern actually came from (existing codebase file, a pasted UX reference, or a
named industry-standard pattern) — not just stated in chat, so the claim is checkable
from the artifact alone. Exists specifically to prevent visual hallucination.
→ `inception/ux-review-protocol.md` Step 3.

**Personas.md** — the resolved Actors/personas gap-checklist answer, written to its own
file (even in its "no new personas" form) rather than only folded into `requirements.md`.
→ `inception/elaboration-protocol.md` Step 2.

**POT (Proof of Testing)** — the actual evidence posted as a Jira comment at Closing
Actions: test run output/links, a 9c live-walkthrough confirmation, an automation run
link (web or mobile, mobile with its local and DEV runs kept separate), or a mobile
manual-testing flag for steps automation can't drive — never a restatement of Section 12.
Ends with a commit link to each `9c-verification*` file (links only, since v3.7.0).
→ `construction/unit-template.md` Section 13.

**Preservation check** — Step 3.6's claim-by-claim walk of the *original raw Intent*
against the consolidated `requirements.md`, distinct from Step 3.5's contradiction pass
between answers — catches a load-bearing detail that quietly evaporated between what
was asked and what got recorded. → `inception/elaboration-protocol.md` Step 3.6.

**PROJECT-RULES.md** — the single canonical rules file every ceremony reads. Inclusion
test: not "could this be derived," but "what does it cost when it isn't recorded" —
observed evidence only, one-occurrence-vs-recurring-or-costly. → `intake/project-rules-template.md`.

**Quality gate (QA)** — retired as a separate per-Unit artifact
(`quality-gate-signoffs/UNIT-n.md` no longer exists). The independent check it used to
provide is now Section 14/15's own **Test Coverage Reconciliation**, same reviewer, same
moment as code review — QA's remaining role is executing the suite independently
post-merge, logged to `defect-log.md`. → `construction/unit-template.md` Section 14,
`operations/qa-testing-protocol.md`.

**Mixed (row state)** — a Capability Register row whose parts are in different states
(dev Detected, production Unknown), written one line per part; the safety floor and Gate 0
look at each part. (Draft) → `intake/capability-register.md`.

**Reconcile** — at Intent load, checking the register rows an Intent touches against the
code and classing each Covered, Silent, Conflict or Unclear. (Draft) →
`intake/foundation-reconcile.md`.

**Result words** — the fixed vocabulary for Section 12 and Section 14 results (v3.4.0): **Verified**
(ran and passed, with evidence), **Not verified — reason** (couldn't run, or ran only partly; never a
pass), **N/A — reason** (doesn't apply). An AC may also be **Partial** or **Missing**; a partly built AC
is never Verified. → `construction/unit-template.md` Section 12.

**Resume-point derivation** — how a resumed Construction session figures out where a
Unit's build actually stands: read `aidlc-state.md`'s per-Unit 9a-9d checkboxes as a
hint, then confirm against what's really there (which Section 3 files changed, which
9a/9b/9d artifacts exist or are recorded N/A in `dev-output-check.md`, whether
`9c-verification*` proof exists and isn't stale — commit or modification times, per
`session-continuity.md`'s four cases — in the Unit's own repo) — the artifacts win on any
disagreement. Existence is enough for orientation; validating it (does the test actually
pass) happens naturally as the resumed work's own first action, not as
a precondition for resuming. → `common/session-continuity.md`, `construction/
unit-template.md` Section 9c.

**Reviewer Finding Disposition** — the routing for whatever Section 14 finds: back to
PO/BA (locked scope was wrong), dev fixes and rebuilds (a Construction-level detail was
wrong), trivial auto-patch, or defer (real but out of this Unit's scope, logged to
`deferred-work.md`). Never a silent "just go fix it." → `construction/unit-template.md`
Section 15.

**Risk** (level) — Low/Medium/High/Critical, for the whole Intent: how bad it is if this
goes wrong, independent of how confident the team is (see **Confidence** above). Drives
escalation posture and whether Gate 1 gets extra scrutiny. → `inception/elaboration-protocol.md`
Step 5.

**Role map** — the register's record of which existing file or section fills each Agent
Setup role, found by content and confirmed by the architect. NIK text names roles, not file
names. (Draft) → `intake/capability-register.md`.

**Seam check** — the other half of Stage 4.5: an end-to-end pass of the Intent's
original AC (from `requirements.md`, not any single Unit's subset) across the
now-integrated Units — confirming the seams between them actually work, not re-testing
each Unit again. → `steering/core-workflow.md` Stage 4.5.

**Server test script** — `construction/UNIT-n/server-test-script.md`, written at 9c when a Unit
adds work that runs on a server outside a request (a scheduled job, a command or script, a
per-server setting), for whoever has server access on each environment. Results go on the
ticket, one comment per environment; running it is not a gate. (Draft, opt-in) →
`construction/server-test-script.md`.

**Setup conflict** — an Intent that would break a rule in the register or the role-map
files. The architect settles it with one of four outcomes (rule stands / one-off exception /
recorded exception / Intent changes the rule) before Gate 1. (Draft) →
`intake/foundation-reconcile.md`, `common/similarity-consistency-checklist.md` item 8.

**Shared architecture docs** — `domain-model.md`/`logical-design.md`/`infrastructure-design.md`
in the **global** `aidlc-docs/shared/` (not nested under any Intent — see
**Multi-Intent Parallel Work** above): living, cumulative documents updated incrementally
at a Unit's own Closing Actions, never authored upfront or duplicated per-Unit or
per-Intent. → `construction/shared-architecture-docs.md`.

**Test Case Generation** — the 4-phase protocol (understanding → coverage analysis →
planning → authoring) that produces `testing/test-cases.md` + `testing/test-case-
details/UNIT-n.md`, sourced from each Unit's own `unit.md`, never Jira. Runs once per
Intent, at the end of Stage 3 (Unit Separation) — not mid-Construction — covering every
Unit the Intent just produced in one pass; a Unit added later via a Mid-Workflow Change
gets its own fallback pass at Construction time instead. → `inception/qa-test-case-
generation.md`, `construction/unit-template.md` Section 9d.

**Unit (Unit of Work)** — the actual unit of construction, cut per independent
testability and vertical slice — never a naive 1-story-per-Unit mapping. Full ID is
always `<intent-slug>/UNIT-n`. Its identity spans two folders:
`intents/<slug>/inception/units/UNIT-n/unit.md` (what was decided, read-only once
Construction starts) and `intents/<slug>/construction/UNIT-n/` (what Construction
produced while building it). → `common/unit-separation-protocol.md`.

**Unit Consolidation** — Stage 3.5: the pull-together point where parallel, locally-run
Intents (pushed via branch or handed over via Google Drive) get merged into one shared
repo state before Construction may start on any of their Units. Verifies no Unit ID
collisions, every Gate 1 actually signed, every ticket and every Unit's test cases
exist, and surfaces (rather than
silently resolves) any real conflict in `aidlc-docs/shared/`. → `common/unit-consolidation.md`.

**Verification-gap check** — asking, per changed behavior, "if this broke exactly where
it's used, would anything actually fail?" Three shapes: Regression gap (a real call
site, no test would catch it), Missing-adoption gap (a sibling site should adopt the new
behavior and doesn't, nothing flags it), Broken-verification gap (a test exists but
doesn't actually protect this — skipped, flaky, too weak). → `construction/unit-template.md`
Section 14.
