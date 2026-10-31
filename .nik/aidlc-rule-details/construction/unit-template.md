# UNIT-<n>: <slug>

> This file is the entire brief a developer (human or AI) needs to implement this Unit
> in one pass. It is produced at Stage 3 (Unit Separation), after Mob Elaboration has
> already resolved ambiguity — nothing here should require guessing. If something
> genuinely isn't covered, STOP and ask; do not infer silently (see Section 10).

## 0. Traceability
- Source Intent: [link to intent.md]
- Source user story: [link to user-stories.md, story ID]
- Depends on: [other Unit IDs, or "none"]
- Blocks: [other Unit IDs, or "none"]
- Repo: [which repo this Unit's code actually changes — default is the home repo this
  Intent's `aidlc-docs/` lives in; name it explicitly only when this Unit targets a
  different one (e.g. a mobile repo). See `common/multi-repo-units.md` if so — Section 3's
  file list is relative to *this* repo, and this repo's own `.claude/` rules/conventions/
  automation apply, never the home repo's by default.]
- Risk level: [Low / Medium / High / Critical — the Intent's risk level from
  `requirements.md` (`elaboration-protocol.md` Step 5), copied here so this packet stays
  self-sufficient. Section 13's ship-skill recommendation reads it from here.]

## 1. Goal (one paragraph)
[What this Unit does and why, in plain language]

## 2. Acceptance Criteria (Given/When/Then, numbered)
1. **Given** [precondition] **When** [action] **Then** [expected outcome] **And**
   [additional criteria, if any]
2. ...

(Pulled verbatim from user-stories.md's AC, which restate requirements.md — if any AC
here still reads ambiguous, elaboration wasn't actually finished; flag back to BA/PO rather than interpreting it.
Given/When/Then isn't decoration — an AC that can't fill in all three parts usually
means the underlying requirement wasn't actually pinned down.)

## 3. Scope
### In scope
- [files/modules expected to change, with existing-pattern references — reuse before
  creating, per this project's own conventions. Paths are relative to Section 0's Repo
  field — for a Unit targeting a non-home repo, that means *that* repo's own file tree
  and its own conventions, not the home repo's.]
- **Modify in place, never duplicate**: an existing file gets edited directly — never
  create `thing_modified.py`, `thing_new.py`, or a copy alongside the original. Before
  calling Section 9 done, confirm no such duplicate was accidentally left behind.

### Explicitly out of scope
- [things adjacent that this Unit must NOT touch — prevents scope creep]

### Architectural/infra consistency (carried from elaboration's consistency check)
- [Any queueing, scheduling, sync/async, or retry pattern this Unit needs — name the
  comparable existing feature it should match, e.g. "background job → routes the same
  way [existing job] does," not just "which files." If elaboration already flagged a
  deviation from an established pattern and got it confirmed, cite the resulting ADR
  here rather than re-deciding it.]
- If Construction discovers a consistency question elaboration didn't catch (the
  divergence only becomes visible at implementation-detail level), this is a Section 10
  STOP-and-ask case, not a judgment call — an unflagged architectural inconsistency is
  exactly the failure mode this whole check exists to prevent.

## 4. Data / Model Impact
- Model changes: [field, type, null/default, on_delete — or "none"]
- Migration needed: [yes/no — if yes, confirmed no existing migration already covers it]
- Cross-cutting data impact: [any routing/tenancy/shared-schema implication, or "none"]
- **If the migration includes a data-dependent `RunPython` step** (a backfill or
  correction that reads existing data and can legitimately raise on values it doesn't
  recognize) — `migration-safety-protocol.md` applies. Record in this Unit's
  `construction/UNIT-n/dev-output-check.md` (not here — this packet is read-only once
  Construction starts): the real-data query run against each database the migration
  will run against and what it found (not just what the model docstring or this Unit's
  own §7a claims), and — on a non-transactional-DDL database (MySQL confirmed; check
  before assuming Postgres needs this) — confirmation that the schema-only operations and
  the data-validation `RunPython` are in separate migration files, not bundled in one.

## 5. API / External Contract Impact
- Touches a public/consumed API? [yes/no]
- If yes: response shape/status/auth changes flagged here explicitly — nothing removed
  or renamed silently if another system (mobile app, integration) consumes it directly.

## 6. UX Spec (only if UI-facing — from ux-review.md)
- Existing component/template reused: [reference]
- New design elements: [only if ux-review.md flagged "Genuinely new" and it was resolved]
- Screenshot/reference: [link]
- Interactive prototype + Pattern Source (if `ux-review.md` Step 3 applied): [path to the
  `.html` prototype and its Pattern Source comment, per `ux-review-protocol.md` — this is
  disposable Elaboration-stage scaffolding, not something to import wholesale into 6a]

### 6a. Frontend component detail (only if this Unit builds/changes a UI component,
not just reuses an existing template wholesale)
- Component structure: [hierarchy, if genuinely new — not needed when reusing a
  whole existing template unchanged]
- State/props this component needs, if introducing something new
- Form validation rules, if this Unit adds/changes a form
- Which backend endpoint(s) this component calls — ties to Section 5
- **Stable selectors for automation**: any new interactive element (button, input,
  link, form) needs a stable, purpose-named selector/attribute — not a dynamic or
  auto-generated one that changes between renders (on mobile: a Compose `testTag` or an
  iOS `accessibilityIdentifier`). This is what keeps Section 9d's web and mobile
  automation from being brittle; decide the selector now, not after the test breaks on
  the first unrelated markup change.

## 7. Domain Rules, NFRs & Infra Mapping
Folds in what .kiro treats as four separate gated Construction stages (Functional
Design, NFR Requirements, NFR Design, Infrastructure Design) into one resolved-during-
Elaboration section — the content matters, five more approval gates per Unit doesn't.
If a subsection doesn't apply to this Unit, write "N/A" rather than leaving it blank.

### 7a. Domain rules & business logic
- [The actual decision rules/validation/constraints this Unit implements — not
  restated from Section 2's AC, the *why* behind them. E.g. "a request past its
  date_end auto-reverts because X," not just "revert expired requests."]
- [Domain entities touched and their relationships, if this Unit's logic depends on
  understanding that shape — reference `aidlc-docs/shared/domain-model.md`/ADRs rather
  than re-describing the whole domain here (per `shared-architecture-docs.md`); if this
  Unit introduces a new entity or relationship, that file gets updated too, at Section
  13's Closing Actions]

### 7b. Non-functional requirements
- [Performance/scale expectations specific to this Unit, if any — e.g. "runs nightly
  against the full active-request table, must stay under N minutes"]
- [Security/data-classification implications, per `PROJECT-RULES.md`'s Section 3 if one
  exists]
- Reliability/error-handling expectation: [what happens on partial failure — does this
  Unit need to be safely re-runnable, idempotent, etc.]
- **New dependency check**: does this Unit need a new library, service, or external API
  call not already in use? If yes, that's flagged here explicitly for the reviewing
  Architect/Dev, even if it seems like the obviously correct tool — never added silently,
  per the project's own "no unreviewed new dependencies" rule. If no new dependency:
  write "None."

### 7c. Infrastructure / deployment mapping
- [Does this Unit need anything beyond "just runs in the existing app" — a new queue,
  a new scheduled job, a new external service call? Name the existing equivalent this
  should match, per Section 3's Architectural/infra consistency check — this
  subsection is where that consistency check's answer actually gets recorded for this
  Unit, not re-decided.]
- [Server test script (Draft — include this line only if `PROJECT-RULES.md` §1 records the
  Server test script opt-in; otherwise leave it out): anything that runs on a server outside a
  request (a job, command, script or per-server setting), which environments it runs on, and
  who has server access there. Per `construction/server-test-script.md`.]
- [If genuinely new infrastructure is needed (not just reusing an existing pattern),
  that's a Section 10 STOP-and-ask to Architect/Dev before Construction starts, not
  something to design solo mid-build. Once answered, the decision gets recorded in
  `aidlc-docs/shared/infrastructure-design.md` too (per `shared-architecture-docs.md`),
  not just this Unit's own copy of it.]

## 8. Assumptions Carried Forward
- [Any A-NN assumption from elaboration-questions.md that applies specifically to this
  Unit — repeated here so the dev doesn't need to cross-reference the whole Intent doc]

## 8b. Parked Items Affecting This Unit
- [Any item the team explicitly deferred during Elaboration (PARKED answer) that's
  relevant to this Unit specifically — not an assumption, a deliberately deferred
  decision. If Construction reaches a point where one of these actually matters, that's
  a Section 10 STOP-and-ask, not something to guess past.]
- If none apply: "None."
- **If one of these becomes answerable during Construction** — not necessarily a
  blocker, just a decision that was deferred and now has an answer — log it in
  `questions-log.md` as a "Parked item resolved" entry (per
  `questions-log-template.md`), **and** write the resolution back into the original
  `PARKED-NN` item in `elaboration-questions.md`/`requirements.md`. Logging it only on
  the Construction side isn't enough — without the write-back, anyone reading the
  Elaboration record later still sees it as open forever, even though it's been
  answered.

## 9. Testing & Verification Sequence (run in this order — do not skip ahead)

### 9a. Unit Tests — always required for new/changed business logic
- What needs covering: [functions/methods, validation rules, error paths]
- Existing fixture/factory to reuse: [reference]
- Existing test file to extend, if any: [path]

### 9b. Integration Tests — only if this Unit meets ANY of these triggers
- Touches a full request/response cycle across view + model + DB
- Writes to more than one model in a single transaction
- Calls an external integration (any third-party/API dependency this project uses)
- Exposed via a contract another system consumes directly (mobile app, external API)

If none of the triggers apply, write **"Integration tests: not needed — <reason>"**
explicitly rather than leaving this blank.

**If an AC depends on how an external system represents a state change** (e.g. what a cancel
looks like in EzTech) (v3.4.0): before stubbing it, capture one real read of that record from
the real system (read-only; a dev or UAT copy is fine) and build the stub's fixtures from that
read — a stub built from an assumed shape only proves the code matches the assumption. Not
writing to the external system doesn't excuse skipping the read. If no read is possible,
record the AC as **Not verified — external state not read** in Section 12.

**If Section 7b named a specific NFR expectation** (a time limit, a scale figure), 9a/9b
is where it actually gets checked — not just written down and forgotten. Record the
real measured result against the stated expectation, not just "tests pass."

**If this Unit touches auth, permissions, PII, or a feature-flag/environment gate**:
explicitly verify the gate behaves as intended for the actual environment values in
play — not the value you assume it has. This project has hit exactly this failure mode
twice already (an Odoo permission gap discovered only in production, and a feature flag
that silently evaluated the wrong way because of an environment-string mismatch nobody
verified directly). Don't assume a gate works — check it.

### 9c. Manual Verification in the Running App — required for anything UI-facing
- Actually exercise the feature in a live browser session against the running dev
  server — reading the diff is not a substitute for this step.
- Walk through every Acceptance Criterion from Section 2 interactively; record the
  result per-AC, not just "looks fine."
- **Compare shared numbers across screens** (v3.4.0). When the Unit shows a number or status
  that another screen also shows (a balance, a count, a total, a status), open that other
  screen for the same record and compare. A mismatch is a defect, not a display difference.
  Note the comparison in the 9c proof.
- **Hard gate**: this step must pass before proceeding to 9d. Do not scaffold
  automation on top of a feature that hasn't actually been confirmed working live —
  that just encodes the bug into a passing test.
- **If verification fails**: fix it and re-verify, right now, still inside this same
  Construction pass — do not proceed to 9d, do not hand off broken work expecting a
  human to catch it in review and send it back. The entire point of "1-shot" is that
  the developer never has to re-prompt after delivery to get what was actually asked
  for; a 9c failure caught and fixed here is the mechanism that guarantees that, not an
  exception to it. Only escalate to Section 10 if the failure reveals a genuine
  ambiguity or gap Elaboration missed — not if it's just an implementation bug to fix.
- **Save proof of the pass, don't just show it**: one or more screenshots or equivalent
  output captures, written to `aidlc-docs/intents/<intent-slug>/construction/UNIT-n/`
  with names starting `9c-verification` (e.g. `9c-verification.png`,
  `9c-verification-search.png`, `9c-verification.txt` for command output) — not only
  displayed in the session and then gone once it ends. This is what lets 9c be
  confirmed later by anyone resuming the build (per `common/session-continuity.md`) —
  a real artifact behind the claim, the same as 9a/9b/9d's test files when those steps
  apply (an N/A or "not needed" outcome is recorded in `dev-output-check.md` instead).
- If this Unit has no UI surface (per `ux-review.md`): write "N/A — no UI surface" and
  skip to 9d's own N/A path.
- **Server test script** (Draft — include this line only if `PROJECT-RULES.md` §1 records the
  Server test script opt-in). If this Unit adds something that runs on a server outside a
  request, also write `construction/UNIT-n/server-test-script.md` here, per
  `construction/server-test-script.md`. This applies to a Unit with no UI surface too. Writing it
  is part of 9c; running it is not a gate for 9d or the exit gate, and a missing script does not
  hold 9c's local pass or 9d.

### 9d. Test Automation — branches by surface, triggered only after 9c passes

This Unit's test cases should already exist — authored once per Intent at the end of
Stage 3 (Unit Separation), per `inception/qa-test-case-generation.md`, and confirmed
present by Stage 4's own Entry Gate before this Unit's Construction began at all. Read
`test-case-details/UNIT-n.md` directly; don't re-derive it from scratch.

**Fallback, not the normal path**: if this Unit was added later via a Mid-Workflow
Change — after the original Stage 3 batch pass already ran — its test cases genuinely
won't exist yet. Run `qa-test-case-generation.md`'s Phases 1-4 now, for this Unit alone,
same mechanics as the Stage 3 version, just scoped to one Unit instead of the whole
Intent.

**The project's own automation skill never learns about NIK.** `/web-automation` (or
whatever a given project calls its equivalent) keeps exactly the inputs it already had
before this project ever adopted `.nik` — typically a `module` name and a `description` of
what to test. The Unit Runner is the one who bridges the two: read the generated test
cases yourself (from `test-case-details/UNIT-n.md`), then **invoke the project's skill
once per test case**, constructing that call's `description` from the test case's own
preconditions/steps/expected-result — never editing the skill itself to read
`aidlc-docs/`. This is deliberate, not a shortcut: a project's skills must stay exactly as
usable without `.nik` as they were before it was bootstrapped in — if dropping `.nik` onto
a *different* project ever means rewriting that project's own tooling first, the framework
has stopped being portable. NIK adapts to the project's existing skill; the skill never
adapts to NIK.

**Branch 1 — Web/dashboard UI-facing** (browser-automatable today):
- **Trigger**: this Unit is UI-facing (per `ux-review.md`) and adds/changes a
  browser-facing flow — a dashboard-style module in this project's own automation
  suite, or the equivalent in whatever project this framework runs on.
- **If triggered**, for each generated test case whose type is "web automation":
  1. Invoke this project's existing web-automation scaffolding (in hr-iris-core: the
     `/web-automation` skill — Page Object Model, `tests/pages/` + `tests/tests/`, pytest
     marker registration) with that test case's `module` and a `description` you compose
     from its preconditions/steps/expected-result — one invocation per test case, not one
     invocation for the whole Unit. If this Unit's Section 0 Repo is a non-home repo
     (`common/multi-repo-units.md`), use *that* repo's own web automation tooling if it
     has one, same calling convention — never assume hr-iris-core's `/web-automation`
     applies there, and never edit that repo's skill either.
  2. Mark the new test `@pytest.mark.smoke` if it covers a happy path that belongs in
     the always-run pre-PR suite; register/apply its module-specific marker either way.
  3. Run the project's smoke-test gate (in hr-iris-core: `/smoke-test`) before this Unit
     is handed off for human review.

**Branch 2 — Mobile UI-facing** (device/Simulator-automatable today, same shape as Branch 1):
- **Trigger**: this Unit is UI-facing but the surface is the mobile app (`hr-iris-android`/
  `hr-iris-ios`), not the web dashboard. This Unit's Section 0 Repo is that mobile repo
  (`common/multi-repo-units.md`) — one Unit per platform: an Intent that changes both apps
  has a separate Android Unit and iOS Unit, each with its own Jira ticket whose title
  names the platform (`[Android]` / `[iOS]`, e.g. "[iOS] Leave Approvals list").
- **Branch**: work from that repo's integration branch — `release/development` in
  `hr-iris-android`, `develop` in `hr-iris-ios` — never `main`, the default branch of
  both. The mobile skills below live on the integration branch only; a Unit started from
  `main` won't find `/ui-automation` and would wrongly take the "no generator" path.
- **If triggered**, for each generated test case whose Automation is "Mobile automation":
  1. Invoke *that repo's* own generator skill — in both `hr-iris-android` and
     `hr-iris-ios`: `/ui-automation` (a Compose instrumented test on Android, an XCUITest
     on iOS) — with the case's `module`/`feature` and a `description` you compose from its
     preconditions/steps/expected-result, one invocation per test case, exactly like
     Branch 1. Never hardcode a login: sign-in follows that repo's own `test-accounts`
     contract (employee + optional line-manager account, supplied at run time).
  2. If the case covers a happy path that belongs in the always-run pre-PR suite, add it
     to that repo's smoke suite: the `@SmokeTest` annotation (Android) or
     `SmokeTestPlan.xctestplan` (iOS).
  3. Run that repo's smoke-test gate (`/smoke-test`) before this Unit is handed off for
     human review. An explicit `/smoke-test` invocation is the "ask" `hr-iris-android`'s
     AGENTS.md requires before running instrumented tests. **Two separate proofs, never
     merged into one**: the **local** run — the app pointed at a local backend (Android's
     `local` flavor; iOS's `BASE_URL` override plus typed test accounts, per its
     `test-accounts` skill) — is this Unit's pre-PR gate, since the backend change this
     Unit depends on usually isn't on DEV yet. **The Unit closes on the local run.**
  4. **After merge and deploy, the DEV run** is its own proof, added later by the Unit
     Runner: rerun that repo's `/smoke-test` against DEV, append the result to this
     Unit's `dev-output-check.md` as a dated "9d DEV run" line under Section 12 (the one
     addition allowed after sign-off), and post it as a follow-up Jira POT comment. A
     pending DEV run never keeps the Unit open or blocks its exit gate; a DEV failure is
     reported in that same comment and handled as a normal post-merge defect, not by
     reopening the Unit.
- **Steps automation can't drive** — a system Face ID/biometric prompt, camera/face
  capture, an OS permission dialog: the mobile `/ui-automation` skills stop and report
  these rather than guess, and Stage 3 should already have typed such cases **Manual**
  (`inception/qa-test-case-generation.md`). For those cases only, write **"Mobile —
  manual testing required for TC-n: <reason>"** in Section 12 and **carry it onto the
  Jira ticket** (a comment or label, not just buried in `dev-output-check.md`), so every
  stakeholder — QA lead, PM, anyone auditing coverage later — can see at a glance which
  cases rely on a human tester, not a regression suite.
- **A mobile repo with no generator skill** (another project, or one that hasn't built
  one yet): check that repo's own `.claude/` conventions/skills before concluding there
  isn't one — never assume "mobile" means manual-only. Only if it genuinely has none
  (confirmed by checking on its integration branch, not assumed), raise the same
  manual-testing flag for the whole
  Unit, on the Jira ticket as well as in Section 12.
- Manual test execution itself (when it does apply) is QA's responsibility, per
  `qa-testing-protocol.md` (Stage 5) — this Unit's job is making the *need* for it
  visible, not performing the test.

**Branch 3 — Not UI-facing at all** (backend/API-only):
- Write **"Test automation: not applicable — no UI surface"** explicitly, rather than
  silently skipping it.

Record which test files were created/extended, or which manual-testing flag was raised,
in every case — this is what "coverage travels with the code" actually means in
practice, not just a principle.

## 10. Escalation Rule (read before starting)
- If you hit a genuine blocker not covered by Sections 1-9 (a real ambiguity, a missing
  dependency, a conflict with an existing decision/convention) — **STOP and ask.** Log
  the question in `questions-log.md` next to this file.
- If it's a small, non-consequential implementation choice (a variable name, which
  existing helper to call) not worth a round-trip — make the call and log it as an
  assumption in Section 12 below. Don't ask.
- The line between the two: **would a wrong guess here fail an Acceptance Criterion or
  violate a project convention?** If yes, ask. If no, decide and log.
- **Irreversible action, on its own, is always a STOP-and-confirm** — separate from the
  AC/convention test above. A real external side effect (an actual email/push
  notification send, an external API write, a payment or financial action, an S3
  delete, a production deploy/config trigger) can be built *exactly per plan* and still
  deserve a pause, if Elaboration never explicitly flagged it as irreversible. Sections
  4/7b cover DB migrations already; this catches the ones that aren't a migration —
  anything this Unit does that can't be undone by re-running Construction again.
- **If the escalation reveals something that would cost someone again later** (not just
  this Unit's own one-off ambiguity) — check `PROJECT-RULES.md` Section 2's inclusion
  test. One occurrence is a note in `questions-log.md`; a recurring or costly lesson
  earns a permanent line there, so the next Unit that hits the same fork doesn't have to
  rediscover it.
- **This Unit's own packet (Sections 1-8) is meant to be sufficient on its own** — that's
  the actual point of Section 8's Assumptions Log, not a convenience. If something about
  this Unit still feels incomplete or under-explained, **that's this rule, not a research
  task**: STOP and ask, the same as any other blocker. Don't go looking for
  `elaboration-questions.md` or `requirements.md` to reconstruct the missing "why" —
  you likely don't have them (this Unit may have arrived as a standalone folder, per
  `multi-intent-parallel-work.md`), and even if you did, a live answer from whoever
  actually knows beats archaeology through an old Q&A transcript that might itself be
  stale or ambiguous.

> **Sections 11-15 are filled in `construction/UNIT-n/dev-output-check.md`, not in this
> packet.** This `unit.md` stays read-only once Construction starts (per
> `steering/core-workflow.md`'s Folder Structure); the sections below are the template
> for what `dev-output-check.md` must contain.

## 11. Definition of Done — self-check before handing to human review
- [ ] Every Acceptance Criterion in Section 2 is **Verified** (Section 12's result words), or
      recorded in Section 12 as Partial or Not verified with its reason and carried to Section
      14 for the reviewer to accept or reject (a Missing AC leaves this box unticked)
- [ ] Only files listed in Section 3's "In scope" were touched (or deviations explained)
- [ ] Migration (if any) verified field-by-field against Section 4 — including, if it has
      a data-dependent `RunPython` step, the real-data check and (on a non-transactional-
      DDL database) the schema/data migration split per `migration-safety-protocol.md`
- [ ] API/contract impact (if any) matches Section 5, called out explicitly in the PR
- [ ] 9a Unit tests written and passing
- [ ] 9b Integration tests written and passing, or explicitly marked not needed
- [ ] 9c Manual verification performed live and passed, with its `9c-verification*`
      proof file(s) saved, or explicitly marked N/A
- [ ] Server test script written or marked N/A (Draft — include this line only if
      `PROJECT-RULES.md` §1 records the opt-in; if left undone, record why: it is shown to the
      reviewer and acknowledged, and never holds the exit gate)
- [ ] 9d Test automation: web or mobile automation created+passing (mobile: on the local
      run; the DEV run is added after deploy, per 9d step 4) / manual-testing flag for
      undrivable mobile steps raised on the Jira ticket (not just this file) / marked not
      applicable
- [ ] Follows the project's coding conventions (error handling, transactions, soft
      delete, validation patterns, etc. — see PROJECT-RULES.md)
- [ ] No debug code / stray prints / commented-out code / TODOs left in
- [ ] **Branch sweep performed** — every branch/condition this diff touches (including
      *implicit* branches — e.g. this diff special-cases 2 of 3 values in a fixed set,
      the 3rd untouched value is an implicit branch too) has been walked and confirmed
      handled, not just the AC's own happy/error paths
- [ ] Section 12 below is filled in
- [ ] Section 14's risk-tagged spots, observable-behavior list, and verification-gap
      check are filled in (or their explicit "none found" statements, if genuinely true)

**Branch sweep, explained**: this is a mechanical pass, not a design opinion — walk every
conditional, loop, error handler, and early return this diff touches or introduces, plus
every implicit branch in any fixed set of values (enum, status code, flag, sentinel,
environment string) the diff only partially special-cases. This project has a real,
already-cited case of exactly this gap (see 9b above): `ENV != "prod"` silently left
every other real `ENV` value unhandled — a 3-value set (`"prod"`/`"uat"`/`"live"`) where
only one was actually checked. A branch sweep run before handoff catches this before a
human reviewer ever sees the diff, not after.

## 12. Dev Output Check (fill in after implementing, before requesting human review)

| Check | Result |
|---|---|
| AC 1 | Verified / Partial / Missing / Not verified (reason) — evidence |
| AC 2 | ... |
| Files touched vs. Section 3 | match / deviation (explain) |
| 9a Unit tests | Verified — command used and result / Not verified — reason |
| 9b Integration tests | Verified — command used and result / N/A — not needed: <reason> |
| 9c Manual verification | Verified live — per-AC notes and the `9c-verification*` proof file(s) listed / N/A — no UI surface |
| Server test script (Draft, opted-in projects only) | Per environment: Not verified — not run yet / Verified — link to the ticket comment with its results / N/A — nothing runs outside a request |
| 9d Test automation | Verified — web: test file(s) created + passing / mobile: test file(s) created + local run passing, and any manual-testing flag (undrivable steps) confirmed posted on Jira ticket; a dated "9d DEV run" line is appended after deploy (9d step 4) / N/A — <reason> |
| Assumptions made during build | [list, or "none"] |
| Questions asked mid-build (if any) | [link to questions-log.md, or "none"] |

**Result words** (v3.4.0). An AC or 9a–9d Result starts with exactly one of these, so a vague
"done" can't read as a pass:
- **Verified** — the check ran and passed. Say what ran and what it showed (command, proof
  file, screenshot).
- **Not verified — <reason>** — the check couldn't run, or only partly ran (mocked only, one
  browser, desktop Excel not used). Never a pass: record the reason, list it under Section
  14's verification gaps, and the reviewer accepts or rejects it at the exit gate.
- **N/A — <reason>** — doesn't apply to this Unit (no UI surface, no migration). Neither a
  pass nor a gap.

An AC row may also be **Partial** (say what is built and what is deferred, and add a
`deferred-work.md` entry for the rest) or **Missing** (not built — this should have been a
Section 10 escalation). **A partly built AC is Partial, never Verified.**

These words don't relax any gate: 9c's hard gate, the 9d trigger and the exit gate work
exactly as before. Units whose Section 12 was written before v3.4.0 keep their wording
("met" = Verified; "not needed" / "not applicable" = N/A; an empty Result is read as Not
verified).

## 13. Closing Actions (after Section 12 is filled and self-check passes)

**Recommend, don't silently pick, which `ship-*` skill to invoke** — opening a PR is an
outward-facing action, never auto-executed without a human confirming it. Present the
recommendation and wait, don't just run one:

- **`/ship-ticket`** (default) — the full flow: smoke test → commit → push → PR opened
  → `/pr-review` run against it → smoke report + review + AI usage log + Jira link
  posted as PR comments → summary comment on the Jira ticket. Use this unless one of the
  two exceptions below is a clear match — it's the right call for most Units.
- **`/ship-chore`** — skips `/pr-review` *and* `/smoke-test` entirely (still adds
  reviewers, notifies the team, posts the AI usage log). Only recommend this when this
  Unit's own Section 1/2 reads as low-complexity (few AC, narrowly scoped — a small
  refactor/chore, genuinely minimal AC, judged directly from the Unit itself, not a
  separate classification step) **and** Section 0's Risk level is Low — both, not either.
- **`/ship-test-script`** — skips smoke-test only, still runs `/pr-review`. Only
  recommend this when this Unit's own Section 1 Goal *is* adding/fixing test automation
  itself — not a feature Unit that happens to include Section 9d coverage.
- **Never downgrade silently to save time.** If genuinely unsure which applies, the
  recommendation defaults to the full `/ship-ticket` — a fast-path skip has to be a
  clear match against this Unit's own Section 1/2 and Section 0's Risk level, not a
  shortcut reached for by default.
- **No Risk field in Section 0** (a packet written before NIK 3.2.0): use the Intent's
  risk level from `requirements.md` if you have it. If you don't, treat risk as unknown
  — recommend the full `/ship-ticket`, per the rule above. Don't go hunting through
  Elaboration history for it (Section 10).

State the recommendation and the reason (which classification/risk/goal it's based on),
then wait for the human to confirm or choose a different one before invoking anything.

- [ ] **Ship-skill invoked** (the confirmed one, not necessarily the recommended one) —
      handles PR creation and the Jira summary comment automatically; don't hand-roll
      these steps if the skill already did them. The skill only checks that a POT exists
      — the Unit Runner writes the POT, including the screenshot links below
- [ ] **9c screenshot links appended to the POT** (v3.7.0) — the Jira POT comment ends
      with one link per `9c-verification*` file, so nobody attaches the screenshots to
      the ticket by hand. Links only — no image is uploaded to Jira. Write each as the
      file name and a bare URL, never link syntax: a bare URL becomes a link whether the
      comment is posted as Jira wiki markup or as markdown, while pipe-style and
      markdown-style link syntax each work in only one of them:
      ```
      9c screenshots (GitHub access needed):
      - <file name>: https://github.com/<owner>/<repo>/blob/<commit-sha>/<path>
      ```
      Push the commit holding the proof files before posting, and link by that commit's
      SHA, never by branch name — a branch link breaks once the branch is deleted after
      merge. Don't amend, rebase or force-push that commit after posting; a rewritten
      commit orphans the links. `<owner>/<repo>` is the repo whose `aidlc-docs/` holds the
      proof — the home repo, also for a mobile Unit (`common/multi-repo-units.md`): there
      the Unit Runner commits the proof files in the home repo, with that Unit's other
      `construction/UNIT-n/` files on their own branch, and pushes it before posting,
      separate from the code PR in the mobile repo. 9c recorded as N/A: leave the block out.
      Readers without GitHub access (POs, typically) get a screenshot when they ask for
      it — never attach the images to the ticket by default.
- [ ] **Server test script handed over** (Draft — include this line only if `PROJECT-RULES.md`
      §1 records the opt-in and 9c wrote one). The POT links it and names who runs it on each
      environment; each run's results go on the ticket as one comment per environment. Shown to
      the reviewer, never holds the exit gate (`construction/server-test-script.md`).
- [ ] PR link and Jira comment link both recorded here before requesting human review
- [ ] **Shared architecture docs updated** if this Unit touched Section 7a/7c's new-entity
      or new-infra items — `aidlc-docs/shared/domain-model.md`/`infrastructure-design.md`
      per `shared-architecture-docs.md`. Most Units touch neither: write "No shared
      architecture doc updates needed" rather than leaving this silently unaddressed.
- [ ] **Foundation register updated** (Draft — include this line only if
      `PROJECT-RULES.md` §1 records the Foundation opt-in; otherwise leave it out). The AI reads this Unit's diff
      and drafts the register edits it implies (new queue, environment variable,
      external system, deploy step), with `file:line` evidence, into the PR; the reviewer
      accepts or rejects each edit. Rules change only by Architect decision, never here.
      Per `intake/foundation-reconcile.md`. If the diff touches nothing in the register,
      write "No register updates needed".
- [ ] **ADR needed?** if this Unit's build involved a genuine judgment call (a
      technology/pattern choice with lasting consequence, a trade-off knowingly accepted,
      a constraint deliberately worked around), record it per `adr-protocol.md` — check
      `PROJECT-RULES.md` §3 for where this project's decision records actually live before
      writing anything. Most Units made no such call: write "No ADR needed" rather than
      leaving this silently unaddressed.
- [ ] **AI usage log posted** (via the invoked ship-skill's own `/ai-log` step) — this is
      separate from `audit.md`: the usage log is a stakeholder-facing metrics report,
      `audit.md` is this framework's own internal decision trail. Neither replaces the
      other.

## 14. Exit Gate Reviewer Notes — read this before approving
**The narrative is the author's testimony, not evidence.** Section 12 and the PR
description are what the dev *believes* happened, not proof it did — this framework has
already caught a real case of a PR description claiming a fix was applied
that wasn't. The human reviewer's job at the exit gate is not to read Section 12 and
nod; it's to independently verify at least the checkable claims in it (does the cited
test actually pass when re-run, does the cited file actually contain what's claimed)
before approving.

**If `/ship-ticket` ran `/pr-review` automatically** (per Section 13), that output is
*additional testimony, not proof* — the same discipline as Section 12 and the PR
description. It's a genuinely useful first pass, run before the human ever looks at
this, but it doesn't replace the checks below — an automated review that already ran is
not a reason to skip AC Reconciliation or the claims-check, it's one more thing that
could itself be wrong.

**AC Reconciliation** (do this independently of Section 12 — that's the dev grading
their own homework; this is someone else re-deriving the answer): walk the diff against
Section 2's numbered AC list directly, one by one, from the code itself — not from
Section 12's claimed pass/fail. For each AC, check for:
- **Violation** — the code contradicts what the AC requires.
- **Deviation from intent** — technically satisfies the letter of the AC but not what
  Section 1's Goal or Section 2's AC clearly meant.
- **Missing implementation** — the AC is simply not built, whether or not Section 12
  claims it is.
- **Contradiction with a scope/constraint** — the diff does something Section 3's
  "Explicitly out of scope" or Section 7's domain rules/NFRs specifically rule out.
A reconciliation that lands on the same verdict as Section 12 for every AC is a good
sign, not a wasted step — it's the independent confirmation that makes Section 12
trustworthy instead of just asserted. A mismatch between the two is itself the finding,
routed per Section 15 like any other.
A Section 12 row with no result word, or marked Verified with no evidence, is itself a
finding; every Not verified row is the starting list for the verification-gap check below, and the
reviewer accepts or rejects each one.

**Test Coverage Reconciliation** (same independence discipline as AC Reconciliation above,
applied to tests instead of code — this is what actually confirms Section 2's AC is
tested, not just built): for each AC item, find what claims to verify it — via
`aidlc-docs/intents/<slug>/testing/test-cases.md`'s index and the linked
`test-case-details/UNIT-n.md` entry if this Unit has generated test cases, or directly in
whatever 9a/9b produced if it doesn't — then open the *actual test code*, not just its
name, and classify:
- **Covered** — a real assertion exists that would genuinely fail if this AC were
  violated.
- **Shallow** — a test exists but only superficially checks it (e.g. `assert_loaded()`
  standing in for "verify the error message displays," checking the page didn't crash
  rather than checking the actual error text) — the same failure mode `defect-log.md`'s
  own worked example already names: *"Test asserted success but not the actual value."*
- **Missing** — no test traces to this AC at all.
A **Shallow** or **Missing** finding is itself the finding, routed per Section 15 like any
other — this is the independent check that used to live in a separate QA
`quality-gate-signoffs` artifact; it lives here now, same reviewer, same moment, not a
second ceremony.
Where this Unit has generated test cases, also confirm each AC has a **Negative** case or a
stated reason none applies (`inception/qa-test-case-generation.md`, Kind); a missing one is a
**Missing** finding for that AC's refusal path.

**Deletion check**: if this Unit removed or replaced existing code, verify each removed
chunk either had its behavior/contract re-established elsewhere or was deliberately
retired — not silently dropped. A removed check, a removed fallback path, or an orphaned
reference that nothing else in Section 12 accounts for is exactly the kind of thing that
looks like unrelated cleanup but quietly breaks something.

**Risk-tagged spots** (filled in by the dev alongside Section 12, before Closing Actions):
2-5 locations in this Unit's diff where a mistake would have the highest blast
radius — not the most complex code, the code where being wrong costs the most. Tag each
with the category it hits, sequenced highest blast-radius first (sequencing, not a
severity score):

| Tag | Covers |
|---|---|
| `[auth]` | authentication, authorization, session, token, permission, access control |
| `[public API]` | new/changed endpoints, exports, public methods, interface contracts |
| `[schema]` | migrations, model/field changes, serialization |
| `[infra]` | deployment, cron/Celery config, env vars, config files |
| `[security]` | input validation, sanitization, secrets, tenant/data-boundary checks |
| `[config]` | feature flags, environment-dependent behavior, defaults |
| `[other]` | anything risk-sensitive that doesn't fit above (concurrency, PII handling) |

```
- `path:line` — [tag] reason-phrase
```

If nothing in this Unit's diff matches these categories, state that explicitly —
`"No high-risk spots — this diff speaks for itself"` is a valid, complete answer. Don't
manufacture a finding to fill the section; that's worse than an honest empty one.

**Observable behavior** (also filled in by the dev, distinct from Section 9c — 9c is the
*developer's own* manual verification during Construction; this is what lets the
*reviewer* independently re-confirm a claim rather than take Section 12's word for it):
2-5 do/expect pairs the reviewer can run themselves in under a few minutes.

```
**{what this confirms}**
Do: {specific action — command, request, click}
Expect: {the observable result that confirms it}
```

If this Unit has no user-visible or externally-observable behavior (a pure refactor, an
internal-only change), say so explicitly instead of padding with trivial observations —
`"Internal change — no observable behavior; Section 9a/9b results are the evidence"`.

**Verification-gap check** (also filled in by the dev, before Closing Actions): for each
behavior this Unit changed, ask one question — *if this broke exactly where it's
actually used, would anything here actually fail?* Three ways the answer can quietly be
"no":
- **Regression gap** — the changed code regresses at a real call site, and no test that
  runs normally would catch it.
- **Missing-adoption gap** — a sibling site that does the same kind of thing should now
  use this Unit's new behavior, doesn't, and nothing flags the omission (only counts
  when there's a real signal this was meant to replace the sibling's own version — not
  every similar-looking code elsewhere is obligated to adopt it).
- **Broken-verification gap** — a test exists and looks like it covers this, but doesn't
  actually protect it: skipped, flaky, not run in the normal suite, or asserts something
  too weak to notice the regression (a mock-only check, a success/no-throw check, a
  stale fixture).

Read the actual test's assertions before claiming it covers or misses this — not the
test's name. If every changed behavior is genuinely covered, say so explicitly:
`"No verification gaps found — every changed behavior is covered by a test that would
actually fail if this broke."`

## 15. Reviewer Finding Disposition (what happens after Section 14 finds something)
A finding at the exit gate isn't automatically "go fix it" — where it routes depends on
where its root cause actually sits:

- **Back to PO/BA** — the root cause is inside Section 1/2/3's Goal, AC, or scope
  boundary, and the finding reveals that scope itself was wrong or incomplete. Not the
  dev's call to reinterpret — reopen Elaboration for this point, don't silently build
  around it. **Never resolve this route by quietly editing Section 2's AC to match
  whatever the code actually does** — that's construction redefining what inception
  asked for, not construction delivering it. Fix the code to match the AC, or take it
  back to the PO and let *them* change the AC on the record — either is legitimate,
  silently rewriting it to agree with the build is not.
- **Dev fixes and rebuilds** — the root cause is in a Construction-level detail (Sections
  4-9's specifics) that Elaboration correctly left to Construction to decide, and this
  Unit's packet just got that detail wrong. Fix the Unit's own Section 4-9 content in
  `unit.md` first — through the STOP-and-ask escalation path, the one exception
  `steering/core-workflow.md`'s Folder Structure allows to `unit.md` being read-only once
  Construction starts — then redo the affected implementation — patching the code without updating what it was
  built from leaves the next reader a Unit packet that no longer matches the code.
- **Trivial auto-patch** — the smallest fix is a direct, narrow correction (no new public
  surface, no new state to guard). Just fix it, note it in Section 12, no ceremony.
- **Defer — not this Unit's problem** — real, but pre-existing (not caused by this Unit)
  or genuinely out of this Unit's scope per Section 3's own "Explicitly out of scope."
  Don't scope-creep it in, and don't silently drop it either: log it to
  `aidlc-docs/intents/<intent-slug>/construction/shared/deferred-work.md` (one entry per
  finding — which Unit, what was found, why it's out of scope for this Unit) so it's
  visible to whoever plans
  the next Unit that might actually own it, instead of evaporating the moment this Unit
  closes.

If a finding's routing itself is unclear (arguably a Construction detail vs. actually
locked scope) — escalate the same way Section 10 already asks you to: stop and ask,
don't guess it alone at the exit gate.
