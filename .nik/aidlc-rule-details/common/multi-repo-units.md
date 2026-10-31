# Multi-Repo Units — one Intent, Units in different repos

Covers the real case this framework was missing: a single Intent (e.g. "Leave Approval")
needing coordinated work across more than one repo — here, `hr-iris-core` (web/API),
`hr-iris-android`, and `hr-iris-ios`. Confirmed a real gap, not a hypothetical: iOS had
already merged a substantial Leaves feature independently, with zero visibility from this
framework, because nothing in it ever asked "which repo."

## The model: one Intent, Units tagged by repo

Not separate per-repo Intents, not duplicated `aidlc-docs/` trees. One `intent.md`, one
`user-stories.md`, one `unit-breakdown.md` — the shared source of truth stays singular.
What varies per-Unit is which repo its code changes actually land in.

## Where the Intent's docs live: the "home" repo

`aidlc-docs/` physically lives inside one repo's working tree — it doesn't float freely
across repos. For a multi-repo Intent, pick one repo as the **home repo** (in practice,
whichever repo `.nik` was bootstrapped into first — for this project, `hr-iris-core`) and
keep the entire `aidlc-docs/intents/<slug>/` tree there, same as any other Intent. **Never
duplicate or sync a copy into the other repos** — that recreates the exact "two drifting
copies" problem this framework avoids everywhere else (Jira/Unit, ADR/the project's
decision-record file).

This assumes the repos are checked out as siblings on the same machine/session (e.g.
`~/Projects/iris/hr-iris-core`, `~/Projects/iris/hr-iris-android`,
`~/Projects/iris/hr-iris-ios`) — a Unit targeting a non-home repo reads/writes that
sibling repo's own working tree directly, while its tracking doc stays put in the home
repo's `aidlc-docs/`.

## The "Repo" field

Every Unit's `unit.md` Section 0 (Traceability) names which repo it actually belongs to.
Section 3's "In scope" file list is relative to *that* repo, not automatically the home
repo — a Unit tagged `hr-iris-ios` lists Swift files under `~/Projects/iris/hr-iris-ios`,
not anything under `hr-iris-core`.

The same applies when resuming a build (`common/session-continuity.md`): the Unit's
Section 3 files, test files, and their git history are checked in *that* repo. Only the
Unit's tracking files — including its `construction/UNIT-n/9c-verification*` proof —
stay in the home repo. So 9c's staleness check (per `common/session-continuity.md`)
compares the proof (home repo) against the Section 3 files in the Unit's own repo —
commit or modification times, per that file's four cases — never against
the home repo's code.

## Per-repo rules, conventions, and automation — never borrowed across repos

Each product repo has its own AI-tool config (its rules, conventions and standing
decisions, wherever that repo keeps them — `hr-iris-core` uses `.claude/`; and its own
project-specific skills, e.g. `hr-iris-core`'s `/web-automation`, and
`hr-iris-android`'s / `hr-iris-ios`'s own `/ui-automation`, `/smoke-test` and
`test-accounts`). A Unit
tagged to a non-home repo must ground itself in *that* repo's own rules and tooling —
never assume the home repo's conventions, coding standards, or automation skills apply.
This is a correctness issue, not a style preference: iOS and Android have entirely
different languages, test frameworks, and review conventions than the Django monolith.

**Known gap, not solved here**: this framework's Bootstrap (`bootstrap-protocol.md`) and
`PROJECT-RULES.md` are scoped to one repo. A multi-repo Intent currently means whoever
builds a non-home-repo Unit manually reads that repo's own `.claude/` files themselves —
there's no automatic cross-repo Bootstrap merge. Worth solving if multi-repo Intents
become routine rather than occasional; not built speculatively here.

## Ticketing and PRs stay per-Unit, per-repo

Stage 3's "one Jira ticket per Unit" still holds — each Unit gets its own ticket
regardless of repo. When a Unit closes (Section 13), its PR opens against *its own*
repo, not the home repo, even though the Unit's `unit.md`/dev-output-check tracking
stays recorded in the home repo's `aidlc-docs/`.
