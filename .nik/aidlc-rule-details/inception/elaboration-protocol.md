# Mob Elaboration — Dynamic Elicitation Protocol

## Purpose
Defines how AI conducts Mob Elaboration on a raw Intent: acting as a BA interrogating a
PO, asking only the questions the Intent's own gaps demand — not a static form. This is
what makes the downstream Unit "1-shot capable": every ambiguity gets resolved here, so
Construction never has to guess.

**The real goal is not just filling gaps — it's making the BA/PO realize something they
hadn't thought of.** A question the PO could have answered from the ticket text alone
isn't doing its job; the valuable question is the one grounded in something the AI found
in the actual repo/board/architecture that the PO didn't know was there. Every question
below should be tagged as one of:
- **Gap question** — the Intent simply doesn't say, and nothing in the codebase implies
  an answer either (e.g. "what's the target release?").
- **Surfacing question** — grounding (Step 1) found something concrete that complicates,
  contradicts, or wasn't accounted for in the Intent as written (e.g. "the field this
  needs doesn't exist yet" or "the dependency this assumes is done, isn't"). Lead with
  the finding, then the question — the PO should learn something before they're asked
  anything.
If a round produces only Gap questions and zero Surfacing questions, that's a signal the
grounding pass (Step 1) wasn't thorough enough, not that the Intent was unusually clear.

## Roles in this ceremony
- **PO/BA (human)** — supplies the Intent, answers questions, has final say on scope.
- **UX (human, invoked per `ux-review-protocol.md` triggers)** — confirms design-system fit.
- **AI (BA seat)** — reads the Intent, runs the gap-checklist below, generates only the
  questions the Intent doesn't already answer, logs assumptions for anything it doesn't ask.

## Pace choice — offered once, after Step 0's classification
Not every Intent needs the same cadence. Once classified, offer the PO an explicit
choice rather than defaulting to one pace for everything:
- **Coaching path** (default for High/Critical risk, or when the PO doesn't choose) —
  the full gap-checklist, round by round, as described below.
- **Fast path** (offer for Low/Medium risk, simple/well-understood Intents) — AI batches
  its best inference for every gap-checklist category into one draft `requirements.md`
  with every inferred item tagged in the Assumptions Log (same mechanism as Step 4
  already, just applied upfront instead of per-round), then the PO reviews and corrects
  in one pass instead of a back-and-forth. Still goes through Definition of Ready — Fast
  path changes the *shape* of the conversation, not the rigor bar it has to clear.
Don't offer Fast path on High/Critical-risk Intents — that's exactly where the
round-by-round surfacing matters most.

## Elicit, don't author (read this before Step 0)
The AI's job in this whole ceremony is to draw the requirement *out of* the PO, not
insert its own. If you find yourself naming a scope cut, picking which part ships first,
or proposing a phase split, stop — that's authoring, not eliciting. Hand the pen back:
turn it into a question for the PO to decide, don't decide it and phrase it as one.
Grounding (Step 1) surfacing what already exists is not authoring; picking what the
Intent *should* be from that finding is.

**Problem before solution or technology**: if the Intent leads with a solution ("build a
sync job for X") or a technology choice ("use Celery for this") without the actual
business problem stated, that's a Gap question before anything else gets asked — what's
the problem this solves, for whom, why now. A technology name is a "how," not a "why";
don't let grounding start on an Intent that hasn't said the why yet.

## Step 0 — Classify first (always the opening move, before grounding)
Before anything else, classify the Intent as one of:

- **New project** — no existing codebase to extend
- **New module/feature** — new capability within an existing project
- **Enhancement** — change to an existing feature's behavior
- **Bug fix** — existing feature not behaving as intended
- **Refactor/technical** — no user-facing behavior change

Usually answerable directly from the Intent's own wording or ticket labels (e.g. a
`[Enhancement]` tag) — if so, state the classification and move on, don't ask. Only ask
if genuinely ambiguous between two of these (e.g. "enhancement" vs "bug fix" when the
Intent describes behavior that arguably never worked as intended in the first place).

This determines which categories in Step 2's gap-checklist actually matter: a **Bug fix**
leans hard on Edge cases and Acceptance criteria (what's the exact wrong-vs-right
behavior) and barely needs Non-goals; a **New project** leans hard on Functional scope
and Dependencies and has no "existing pattern" to check in Step 1.4 at all; a
**Refactor** needs Architectural/infra consistency (Step 1.4) more than anything else,
since the entire point is matching or deliberately changing an established pattern.
Don't run every category with equal weight regardless of classification — that's how a
round ends up asking generic questions instead of the ones that actually matter for this
kind of Intent.

## Step 1 — Ingest & ground
Before asking anything, AI must:
1. Read the raw Intent text in full, and persist it to
   `aidlc-docs/intents/<intent-slug>/inception/intent.md` — a snapshot of what was
   actually asked, lightly structured under Goal / Success Criteria / Stakeholders /
   Constraints, using only what the Intent as given actually states. Do not fill gaps
   here — that's what Step 2 exists for. `intent.md` and `requirements.md` stay
   deliberately distinct: this file is "what was asked," that one is "what we determined
   it means" once Elaboration resolves it. If this Intent is part of a batch (Stage 0.5),
   its slug was already locked in `intent-queue.md` — reuse it, don't invent a new one.
2. Search the codebase for existing implementations of anything the Intent references
   (module, model, view, template) — "grounding over generation." Check
   `aidlc-docs/shared/domain-model.md`/`logical-design.md`/`infrastructure-design.md`
   first if they exist (per `shared-architecture-docs.md`) — they're the canonical index
   of established domain/API/infra decisions, faster and more reliable than a blind grep.
   Cite `file:line` for anything found; state explicitly what was searched and came up
   empty.
3. Check the project's rules (the files its role map names for architecture,
   conventions, standing rules and agent limits, found by content not file name, or the
   consolidated PROJECT-RULES.md if one exists) for any existing decision that already
   answers part of the Intent (e.g. an ADR that forecloses an approach). If the project
   has a Capability Register, `intake/foundation-reconcile.md` has already run at Intent
   load: read its Silent and Conflict results here and turn them into questions or
   conflict items.
4. **Consistency check** — run `similarity-consistency-checklist.md` in full. It's the
   dedicated mechanism for "does this already exist, and if there's more than one
   existing version that disagrees, which one wins" — for any category of
   implementation choice, not just infra/queueing (that file's own worked example).
   Every item that comes back unclear becomes a **[Surfacing]** question in Step 3,
   routed to the specific seat (BA/PO, Architect/Dev, or QA) that checklist names for
   it — not a generic question addressed to "the team." A confirmed, intentional
   divergence from an existing pattern gets recorded as an ADR — wherever and in whatever
   format `construction/adr-protocol.md` says this project uses (its existing decision-
   record file first; `adr-NNN.md` only as the fallback) — so the next Intent that hits
   the same fork finds a decision already made.

## Step 2 — Run the gap checklist
For each category, AI marks: **Answered** (Intent already covers it — cite the line),
**Inferred** (AI is filling the gap with an assumption — must be logged, Step 4), or
**Ask** (material enough that guessing is unsafe).

| Category | What "answered" looks like |
|---|---|
| Functional scope | What the feature does, for whom, in what flow |
| Non-goals | What this Intent explicitly does NOT attempt |
| Actors / personas | Who triggers this, what role/permission level |
| Data touched | Which models/entities are read or written; new fields? |
| UX surface | Is this UI-facing? (routes to `ux-review-protocol.md` if yes) |
| Integration points | Does this touch any external system/API this project depends on? If yes, run `similarity-consistency-checklist.md` item 7 (POC-needed decision + prod-constraint verification) — never assume dev/uat parity with production for a vendor integration |
| Edge cases | Empty states, concurrent access, tenant/boundary conditions |
| NFRs | Performance/security implications worth naming up front |
| Acceptance criteria | Testable, unambiguous, no "should probably" language |
| Dependencies | Any other in-flight Unit/ticket this needs first |

A category only reaches **Ask** if it's both (a) not answered or safely inferable from
existing code/conventions, and (b) consequential enough that a wrong guess would cost
real rework in Construction. Cosmetic gaps (e.g. exact wording of a success message) are
logged as assumptions, not asked.

**Actors/personas, once resolved, also gets its own `personas.md`** — not just folded
into `requirements.md`'s body. If this Intent doesn't need any persona beyond an
existing, already-documented role, `personas.md` still gets written, saying so
explicitly (e.g. "No new personas — served by the existing Employee/Admin roles already
in `PROJECT-RULES.md`") rather than being skipped, same N/A-over-silence discipline as
everywhere else in this framework.

**Non-goals is never optional — at least one is mandatory, not just a category to mark
N/A.** Absence of a stated non-goal doesn't mean there isn't one; it means Construction
fills the vacuum with its own guess about what's out of scope, which is exactly the
failure mode this whole protocol exists to prevent. If the team genuinely can't think of
one, that itself is worth a beat of suspicion, not a pass-through.

**A constraint that doesn't actually rule anything out is decoration, not a requirement.**
Before writing an NFR or a Section 3 scope boundary into `requirements.md`, check it
actually bends a decision — "should be reasonably fast" constrains nothing; "must
complete within N minutes because it runs inside a nightly cron window" does.

## Step 3 — Ask like a BA, not a form, and never in chat
- **Hard rule, no exception**: questions are never asked directly in chat. Every
  question goes into a dedicated file, `elaboration-questions.md` (round 2+: append a
  new "Round N" section to the same file rather than creating a new one), following the
  exact structure in `elaboration-questions-format.md`.
- One coherent batch of questions per round, grouped by gap-checklist category — not a
  20-item dump.
- Every question is multiple-choice: lettered options plus a mandatory last option,
  "Other," with an `[Answer]:` tag to fill in. Options must be genuinely meaningful for
  that question — never padded out to hit a letter count.
- Where the Intent is ambiguous between 2-3 plausible readings, use **divergent-then-
  convergent elicitation** — and this is exactly what the lettered-option format is for:
  each option IS one candidate interpretation, so the PO picks/corrects instead of
  answering an open "what did you mean?"
- After creating the file, tell the PO it's ready, name the count of questions, and wait
  for them to say they're done — do not read partial answers mid-fill.
- Follow-up rounds only probe what the previous round's answers newly opened up — don't
  re-ask settled categories.
- Stop asking a category the moment it reaches **Answered**.

## Step 3.5 — Read, validate, and check for contradictions
Once the PO confirms the file is filled in:
1. Read `elaboration-questions.md` and extract every `[Answer]:` value.
2. If any answer is blank or not a valid lettered choice, ask (in the same file's
   response, not chat) for that specific question to be completed/corrected.
3. **Mandatory contradiction/ambiguity pass** before proceeding: check answers against
   each other and against the Intent itself for logical inconsistency (e.g. "purely
   read-only" answered alongside an option implying a new write action; a "no schema
   change" answer alongside a description that clearly needs one). If found, create
   `elaboration-clarification-questions.md` — same lettered format — explaining the
   specific contradiction and offering options that resolve it, then wait again. **File
   count is capped, not round count**: this file is created at most once per Intent; a
   second contradiction after the first is resolved appends `## Clarification Round N`
   to the same file rather than spawning a new one. However many rounds clarity takes,
   the file count stays at two (`elaboration-questions.md` +, if ever needed,
   `elaboration-clarification-questions.md`) — see `elaboration-questions-format.md`.
4. Only fold validated, non-contradictory answers into `requirements.md` once this
   passes clean.

## Step 3.6 — Preservation check (different from Step 3.5's contradiction pass)
Step 3.5 checks answers against each other. This checks `requirements.md` against the
**original raw Intent** — before Definition of Ready, walk the Intent's own text
claim by claim and confirm each load-bearing one actually landed somewhere in
`requirements.md`, an Assumption, or a Parked item. A claim is load-bearing if a
downstream Unit's construction would come out different without it. Anything genuinely
load-bearing that got quietly lost between the raw Intent and the consolidated
requirements is a real find — log it and fold it in, don't let a real detail evaporate
just because no gap-checklist category happened to surface it.

## Step 4 — Assumption log (non-negotiable)
Every **Inferred** item from Step 2 is written to `elaboration-questions.md` under
"Assumptions Log" as a numbered, contestable statement, e.g.:

> **A-03**: Assumed the new field is soft-deletable like every other model in this app,
> per the project's soft-delete convention. Not asked — the pattern is unambiguous
> project-wide.

The PO can veto any assumption at gate review; an assumption is a decision *flagged*,
not a decision made unilaterally.

## Step 5 — Confidence flag AND risk level (two different axes, don't conflate)
Each section of the resulting `requirements.md` gets a High/Medium/Low **confidence**
tag — how sure are we this section is actually right. Low-confidence sections are what
gate review should scrutinize first.

Separately, the whole Intent gets a **risk level**: Low / Medium / High / Critical —
how bad is it if this goes wrong, regardless of how confident we are. A Unit can be
high-confidence (elaboration resolved every ambiguity cleanly) and still high-risk (it
touches auth, a feature-flag gate, or production data) — these are independent axes.
Risk level is what should drive Section 10's escalation posture in Construction (a
higher-risk Unit escalates sooner, not just when a wrong guess would fail an AC) and
whether Gate 1 sign-off gets extra scrutiny, not just whether it gets signed off at all.

Neither tag is a score to optimize — both are routing aids for where human attention
should actually go, and a Facilitator gaming either by inflating or deflating counts
defeats the purpose.

## Step 6 — Derive user-stories.md (bridges requirements.md to Unit decomposition)
Once `requirements.md` is stable (post Step 3.6's preservation check), derive
`aidlc-docs/intents/<intent-slug>/inception/user-stories.md`: each story states
who/what/why ("As a [persona
from `personas.md`]... I want... so that...") with Given/When/Then acceptance criteria,
sourced directly from what's already resolved in `requirements.md` — never inventing new
scope here, only restating resolved content in story form.

**No Epic layer sits above this.** Stories map straight to Units — `unit-breakdown.md`
cuts against `user-stories.md`, not directly against `requirements.md`'s prose, but
still per `unit-separation-protocol.md`'s own criteria, not a naive 1-story-per-Unit
assumption: several stories can cut into one Unit, or a large story can need more than
one, based on testability and the other real criteria, never a 1:1 default.

Stage 3's traceability check verifies the full chain: every `requirements.md` item
appears in `user-stories.md`, and every `user-stories.md` AC maps to at least one Unit's
Section 2 AC — not just requirements-to-Units directly, now that this bridging artifact
exists.

## The master test for Definition of Ready
Everything below is in service of one question: **could a developer implement this
without inventing decisions nothing here records?** If yes, ready. If no, whatever's
missing is the actual gap to close — not a formality to check off.

## Round 1 can end in three ways, not just "proceed to Round 2"
- **Ready** — the normal path below.
- **Killed** — grounding or the team's own answers reveal the Intent doesn't actually
  hold up (contradicts something already decided, solves a problem that doesn't exist,
  or the juice genuinely isn't worth the squeeze). Say so plainly and log why — finding
  this out in Round 1 instead of after Units are built is the win, not a failure to
  report quietly.
- **Clearer, not ready** — the team understands the Intent better now but it's not
  ready to proceed (needs a decision from someone not in the room, needs a smaller pilot
  first). Log where it stands, don't force it to a Round 2 just to look like progress.

## Definition of Ready (Intent → cleared to proceed to unit-breakdown)
- Every gap-checklist category is Answered, Inferred-and-logged, or explicitly
  **Parked** (see `elaboration-questions-format.md`) — none left silently blank. Parked
  items don't block readiness on their own, but every one of them must be listed in
  `requirements.md`'s Parked / Deferred Items section and explicitly acknowledged at
  Gate 1 sign-off — the PO signs off on the parked list existing, not on it being empty.
- No open divergent-interpretation question remains unresolved (Parked counts as
  resolved-for-now, not unresolved — the team made a real decision to defer it).
- UX review completed if the Intent is UI-facing (see `ux-review-protocol.md`).
- `personas.md` and `user-stories.md` written per Step 2/Step 6 above (including their
  explicit "none/N/A" forms where genuinely true).
- PO has explicitly signed off on `requirements.md`, parked list included (this is the
  Gate 1 input).

Once cleared, decompose into Units per `unit-separation-protocol.md` — not a naive 1
story = 1 Unit mapping — and record the result in the generated `unit-breakdown.md`.

## Depth scales with complexity — the artifacts don't
Every Intent that clears Elaboration produces the same artifacts (`intent.md`,
`requirements.md`, `personas.md`, `user-stories.md`, `elaboration-questions.md`,
`unit-breakdown.md`) regardless of size — a one-line bug fix and a system migration both
get all of them. What scales is the *detail inside* each artifact: a bug fix's
`requirements.md` might be three sentences; a migration's might run several pages with
full traceability. Let Step 0's classification and the gap-checklist's own findings drive
how much detail a section needs — don't inflate a simple Intent with unnecessary
ceremony, and don't shortchange a complex one by rushing past real ambiguity.

## Anti-pattern this protocol exists to prevent
Confidently guessing scope from a one-line Intent and discovering the gap three Units
into Construction. If in doubt, this protocol errs toward asking — one more clarifying
question here is always cheaper than a wrong Unit built on a bad guess.
