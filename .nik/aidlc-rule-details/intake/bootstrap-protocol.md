# Gate 0 — Bootstrap / Plug-and-Play Detection

## Purpose
Runs once, automatically, before the first Mob Elaboration on a project. Detects what
the framework needs to ground itself in this specific repo — architecture, rules,
PM/board tool, design system, CI/CD — so `elaboration-protocol.md` Step 1 ("check
existing rules/decisions") and `ux-review-protocol.md` Step 1 ("check the design-system
source of truth") have something real to point at instead of a placeholder.

Extends .kiro's `workspace-detection.md` stage (which only does greenfield/brownfield +
language/build-system detection) — same auto-proceed philosophy, wider scope.

**No approval gate on detection itself** — this is informational, same as .kiro's
original stage. A gate only appears at the end, and only for what genuinely couldn't be
detected (Step 6).

## Step 1 — Resume check
Same as .kiro: if `aidlc-docs/aidlc-state.md` already exists, load it and resume from
the recorded stage instead of re-bootstrapping. Bootstrap is idempotent — running it
again on an already-bootstrapped project should report current state, not redo work.

## Step 2 — Code & workspace scan (carried over from .kiro, unchanged)
- Existing code? Yes/No (greenfield vs. brownfield)
- Languages, build system, project structure (monolith/microservices/library)
- Workspace root (absolute path, never `aidlc-docs/` itself)

## Step 3 — Architecture & rules detection (new)
Search **both** the repo root **and** a `.claude/` folder if one exists — don't assume
either location alone. Confirmed real for this exact project: hr-iris-core's own
`CLAUDE.md` at repo root explicitly points into `.claude/` for `conventions.md`,
`AGENTS.md`, and `DECISIONS.md` — the root file is a pointer, not the content itself.
Other projects may keep everything at root, or use a different assistant's folder
convention (`.cursor/`, `.windsurf/`, etc.) — check what's actually there, don't assume
one layout universally.

Search, in this order, and record what's found with full file paths (including which
folder, not just the filename):
- Architecture docs: `README.md`, `ARCHITECTURE.md`, `docs/`, an ADR directory — root
  and `.claude/` (or equivalent) both.
- Conventions and rules, found **by role, not by file name**: architecture, conventions,
  standing rules (decisions that bind future work), agent limits (see
  `capability-register.md`, Role map). A project may keep these in `CLAUDE.md`,
  `AGENTS.md`, `conventions.md`, `DECISIONS.md`, one combined file, or a tool-specific
  folder — read what is there and match by content. Same dual-location check. If the
  root rules file itself just points into a subfolder (as hr-iris-core's `CLAUDE.md`
  does), follow that pointer and record the real path, not the pointer file, as the
  source.
- Any existing consolidated `PROJECT-RULES.md`.
- If rules are scattered across multiple files: propose consolidating pointers into one
  `PROJECT-RULES.md` per the project-template stub, rather than requiring the team to
  author one from scratch — link out to the originals (with their real paths), don't
  duplicate their content.
- If nothing is found at all, in either location: record "No architecture/rules docs
  found" explicitly — this means Reverse Engineering (if brownfield) has to work
  harder, and elaboration's grounding step will have less to check against. Flag it,
  don't silently proceed as if grounding will work fine.

## Step 3b — Activation pointer (new)
Detection alone doesn't make this framework *discoverable*. A bare dev prompt like
"start construction of `<intent-slug>/UNIT-n`" has no guaranteed trigger to load
`.nik/steering/core-workflow.md` at all unless the project's own root rules file
explicitly says to — without that pointer, an AI session could just start writing code
from general knowledge, skipping the entry gate, the assignment check, the whole
Section 9 sequence, all of it.

Check whether the root `CLAUDE.md` (or equivalent, per Step 3's own dual-location check)
already contains a line pointing into `.nik/steering/core-workflow.md`. If yes,
record it as found. If no, **don't add it silently** — this is a shared, team-visible
config file; propose the exact line and let the team confirm before it's added (folded
into Step 6's batch, same as everything else that needs a human call). The recommended
line, matching this project's own existing pattern for `.claude/conventions.md`/
`.claude/AGENTS.md`:

```markdown
For any Elaboration or Construction request (e.g. "start construction of
<intent-slug>/UNIT-n", "run Mob Elaboration on <intent>"), read
`.nik/steering/core-workflow.md` in full and follow its Loading Order before
doing anything else.
```

## Step 4 — PM/board tool detection (new)
- Check which project-management MCP connectors are actually available/connected in
  this session (Atlassian Rovo, GitHub Issues/Projects, Linear, or others) — don't
  assume Jira by default just because a prior project used it.
- If exactly one is connected: use it, record it.
- If more than one is connected: this is the one thing Step 6 asks about — which one is
  authoritative for *this* project.
- If none is connected: record "No PM/board MCP connected" and note that Unit tracking
  will need to happen in `aidlc-docs/` only, or ask whether one should be connected
  before proceeding.

## Step 5 — Design system & CI/CD detection (new)
- Design system: look for a component-library dependency, a design-tokens file, or a
  design-tool link referenced in existing docs. Record what was found, or "none found"
  (this directly feeds `ux-review-protocol.md` Step 1 — if nothing is found, that
  protocol will always fall through to "ask," which is fine, but should be known up
  front rather than discovered mid-elaboration).
- CI/CD: check for `.github/workflows/`, existing branch-naming convention (`git branch
  -a` pattern check), and environment branches (dev/uat/main-equivalent) — this is what
  the Construction → Operations gate will eventually target.

## Step 5b — Codebase briefing (brownfield only, lightweight, persisted)
.kiro's `reverse-engineering.md` generates 8 heavy documents (architecture, API docs,
component inventory, tech stack, dependencies, code quality) every time. That's real
ceremony for what we actually need — but the underlying problem it solves is real too:
without it, every single Intent's grounding (`elaboration-protocol.md` Step 1)
re-derives "what does this codebase even look like" from scratch, which is slow and
means later Intents don't benefit from what earlier ones already learned.

Lighter version: on first bootstrap (brownfield only), generate **one** consolidated
`aidlc-docs/codebase-briefing.md` — module/app boundaries, the main conventions/decision
files already found in Step 3, and any genuinely load-bearing architectural facts
(multi-tenancy, the main external integrations, anything a fresh grounding pass would
otherwise rediscover every time). Not 8 documents, one.

**Refresh trigger, not a schedule**: don't regenerate this on every bootstrap re-run.
Refresh it when an Intent's own grounding pass (Step 1.4's consistency check) finds
something that contradicts what the briefing says — that's the signal it's gone stale,
not a calendar. Elaboration's Step 1 reads this briefing first, before searching the
codebase fresh, and only searches fresh for what the briefing doesn't cover.

## Step 6 — Ask only what evidence couldn't settle
Everything in Steps 3-5 is evidence-based, not asked. The only questions that reach a
human are things detection genuinely cannot resolve on its own, batched into one round:
- Which PM/board tool is authoritative, if more than one was detected connected.
- Whether to proceed with "no design system found" as a standing fact, or whether one
  exists but isn't discoverable from the repo (e.g. lives in a separate design-only
  repo/tool not connected to this session).
- Whether to proceed with "no architecture/rules docs found" as-is, or whether they
  exist somewhere not yet pointed to.
- The Unit size signal for `unit-separation-protocol.md` (days per Unit, used only as a
  discussion trigger, never an auto-split rule) — if `PROJECT-RULES.md` doesn't already
  set one, ask; default to 3 days only if the team has no opinion yet.
- If Step 3b found no activation pointer into `.nik/steering/core-workflow.md`:
  show the recommended line and confirm whether to add it, and where (root `CLAUDE.md`
  or wherever the project's own rules file actually lives).

If none of these apply — everything was detected — **no question is asked at all**;
bootstrap completes silently and Mob Elaboration can start immediately. This is the
actual "plug and play" property: a well-documented repo with clear tooling shouldn't
need a human touch to get through Gate 0.

## Step 6b — Foundation notice (Draft, optional; a notice, not a question)
Not part of Step 6's question round, so a fully detected repo still gets "no question at
all". The Welcome Message carries one line saying Foundation exists and how to start it
(`core-workflow.md`, Welcome Message). If the architect asks for it, run
`foundation-protocol.md` after Step 7. Nothing is recorded for a project that does not.
The same Welcome Message also carries one line for the server test script (Draft, opt-in):
if the architect asks for it, add its line to `PROJECT-RULES.md` §1, per
`construction/server-test-script.md` ("Turning it on").

## Step 7 — Record and gate
Write findings into `aidlc-docs/aidlc-state.md` (extending .kiro's original block) and
into `PROJECT-RULES.md`'s Document Control / a new "Environment & Tooling Detected"
section:

```markdown
## Environment & Tooling Detected
- **NIK version**: [read directly from `.nik/VERSION` — never hand-typed, so this stays
  accurate if the project's local copy of `.nik` gets refreshed later without anyone
  remembering to update this line by hand]
- **Architecture/rules source**: [files found, or "none — flagged"]
- **Activation pointer**: [found at <path>, quoted / added at <path>, per team
  confirmation / still missing — flagged, framework may not auto-trigger reliably]
- **PM/board tool**: [tool name + connector, or "none connected"]
- **Design system**: [source found, or "none found"]
- **CI/CD**: [pipeline + branch convention found, or "none found"]
- **Unit size signal**: [days per Unit, per `unit-separation-protocol.md` — configured
  value, or "3 (default, unconfirmed by team)"]
- **Workspace**: [greenfield/brownfield, languages, build system — from Step 2]
- **Foundation**: [opted in (Draft), <date> — optional row, left out when the project
  has not opted in; §1a Capability Register holds the detail]
- **Server test script**: [opted in (Draft), <date> — optional row, left out when the
  project has not opted in; see `construction/server-test-script.md`]
```

Gate 0 clears (Mob Elaboration may start) once every row above is either filled with a
real finding or explicitly marked "none — proceeding without it" following a Step 6
answer. No row is allowed to sit unresolved silently. The Foundation row is optional and
never holds Gate 0 open by itself; if the project opted in, Gate 0 also needs the checks in
`foundation-protocol.md` Step 5.

## Why this shape
Mirrors the same principle as `elaboration-protocol.md`: ground first, ask only for what
grounding couldn't settle, and never let an unresolved unknown pass silently into the
next stage. Applied one level earlier — before the framework even starts reasoning
about a specific Intent, it should know what project it's actually standing in.
