# Foundation Reconcile, Setup Conflicts and Unit-Close Updates

> Maturity: Draft (since 3.5.0; extended in 3.6.0 after the first test run) — opt-in per project, see `common/maturity-flags.md`.

Applies only when a project's `PROJECT-RULES.md` §1 says Foundation is opted in. Otherwise it
is N/A and nothing here runs.

## Reconcile at Intent load
Runs at the start of Stage 1, before `inception/elaboration-protocol.md` Step 1. It is the
safety net that catches a register gone stale between Intents.

1. Pick the rows to check: the ★ rows (09, 10, 12, 14), every row whose **Intent cues** match the Intent's wording or the areas it names, **and any other row the AI judges the Intent touches** (cues are a floor, not a ceiling; for example an Intent that "emails HR" touches who may receive it and what happens when it fails). Label rows added by judgment as such and **say why each was added**, so reconcile does not drift into checking all 15 rows every Intent.
2. For each, read the code, config or workflow its answer names and compare. Record the result with the words from `unit-template.md` Section 12: **Verified**, **Not verified — reason**, **N/A — reason**.
3. Classify each row:

| Class | Means | What happens |
|---|---|---|
| **Covered** | The register answers it and the evidence agrees. | Nothing, unless the row is open (Unknown, Waived or an unsettled safety-floor part, or carries an **Exposed** flag): then it reads **Covered, row open**, with its If-unsettled outcome shown. |
| **Silent** | The Intent touches it and the register has no answer (Unknown or blank). | A question to the seat in the row's "Who to ask", in `elaboration-questions.md`. |
| **Conflict** | The register, a rule, or the code disagree with each other or with the Intent. | A conflict item, below. |
| **Unclear** | Evidence could not be checked. | A question; the row stays Not verified. |

The AI may **add** a marked block to the register (`[AI-added, unconfirmed]`) and may
**propose a diff** to an existing row. It never applies a change to an existing row or to a
rule without the architect's decision.

## Setup conflicts — the Intent against a rule
A conflict item is raised when an Intent would break a rule that appears in the register or
in a role-map file (`similarity-consistency-checklist.md` item 8). It goes to the **architect**
and should be settled before Gate 1; if still open there it is shown at the gate and
acknowledged by the signer, and does not stop it while Foundation is Draft
(`common/maturity-flags.md`, "At a gate"). The architect chooses one of four outcomes:

1. **Rule stands, Intent adapts.** The Intent is changed to fit.
2. **One-off exception, not recorded.** This Intent proceeds; nothing is written into the rules.
3. **Recorded exception.** This Intent proceeds, and a carve-out is written where the rule lives, so the same kind of case is exempt next time.
4. **Intent changes the rule.** The rule is rewritten by the architect's decision and applies to future Intents.

Record the outcome in `elaboration-questions.md` and in the row's **Exceptions** (outcomes 3
and 4). The file or section that holds the rule is whatever the role map says; this protocol
does not assume a name.

## Disagreements — inside Foundation, not Intent against rule
Foundation finds four kinds: **document against code**, **document against document** (for
example two files that each say how to deploy), **code against code** (a workflow against a
service unit), and **an architect's answer against code** (for example the backend is REST
and the planned client expects GraphQL). The architect decides each one, with the same four
outcomes (for two sources, "the first / the second" replaces "code / answer"):

1. **The code (or the more authoritative source) is right.** The other is corrected or noted stale; in this step nothing outside the register is edited.
2. **The answer is right.** The code is to change; it becomes planned work, and the row is **Decided, not yet built** with a Plan.
3. **Both intended.** A recorded exception explains why.
4. **Undecided.** The row is parked. If an Intent depends on it, its If-unsettled outcome applies (Hold at minimum).

**A reversal.** If the architect changes an earlier answer in the same session, record the
final answer, what was said first and when, and the reason. **Then check the other rows the
change affects**: deciding that a system will be removed or added can change backups,
external systems, access and the documents that mention it. List each affected row and
re-confirm it; do not leave one on the old assumption.

## Unit-close step (Section 13)
At a Unit's Closing Actions, the AI reads the Unit's diff and drafts register edits:
- rows the diff touches (a new queue, a new environment variable, a new external system, a changed deploy step);
- the new fact, the evidence (`file:line`), and a proposed **Refresh trigger** if one is missing.

The draft is part of the Unit's PR. The reviewer accepts or rejects each edit. Rules change
only by architect decision, never in this step. If the diff touches nothing in the register,
the answer is "No register updates needed".

## Agent Setup never changes by itself
An Intent never edits Agent Setup (the role-map files, agent limits, permissions) as a side
effect. Changes go through a setup conflict outcome, an architect decision, or a reviewed
Unit-close edit.
