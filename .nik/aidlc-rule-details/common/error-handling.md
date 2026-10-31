# Error Handling & Recovery

## General principle
Identify the error, assess whether it's blocking, communicate it plainly, offer a way
forward, log it in `audit.md`. Never silently paper over a broken state and keep going.

## Severity
- **Critical** — can't continue at all (state file corrupted, required artifact missing
  and unrecoverable).
- **High** — this stage can't complete as planned (contradictory answers, a Unit's
  dependency isn't actually done yet).
- **Medium** — continue with a workaround, note the gap.
- **Low** — cosmetic, doesn't block anything.

## Common failure points, by stage

**Bootstrap** — can't read the workspace, or `PROJECT-RULES.md` conflicts with what's
actually detected: say what was found vs. expected, ask rather than guess which is
current.

**Elaboration** — `elaboration-questions.md` has a blank `[Answer]:` tag, or the team's
answers contradict each other or the Intent: per `elaboration-protocol.md` Step 3.5 —
name the specific gap, don't proceed, don't infer past it.

**Unit Separation** — a proposed split has circular dependencies (Unit A needs B, B
needs A), or a Unit's "Depends on" field points to a Unit sequenced *after* it (not
circular, just unbuildable standalone): either way, this means the split itself is
wrong, not that the dependency needs a workaround. Go back to
`unit-separation-protocol.md`'s criteria and recut it.

**Construction** — a genuine blocker Section 10 didn't anticipate: STOP per that
section's own rule, log in `questions-log.md`, don't push through with a guess. A test
that can't be written because the design doesn't support it means the design (Elaboration
output) had a gap — flag it back, don't invent a workaround silently.

**Resume after interruption** — `aidlc-state.md` says a stage is complete but its
artifact doesn't exist, or vice versa: don't trust either blindly. Check which is real
(does the artifact actually exist and look complete?), fix the state file to match
reality, then continue — never re-run a stage that already produced a good artifact just
because the checkbox looked wrong.

**When that check itself comes back ambiguous** (the artifact exists but it's unclear
whether it's actually finished, or evidence from different sources disagrees) —
**prefer the lower/less-finished status, and flag it.** A false "done" hides a real gap
that then silently propagates into whatever depends on it; a false "in-progress" only
costs a redundant check before continuing. When in doubt, that asymmetry is the
tiebreaker — never split the difference or guess optimistic.

## Recovery steps, in order
1. State plainly what's wrong and what it blocks.
2. If a file is genuinely corrupted/missing: back it up if anything's there
   (`{file}.backup.{timestamp}`), then either regenerate it from what's still known, or
   ask the team for the missing piece — don't fabricate content to fill the gap.
3. Log the error and its resolution in `audit.md` — same discipline as everything else
   in this framework: real content, not a summary.
4. Only resume the stage once the actual cause is fixed, not just the symptom.

## When to escalate rather than resolve alone
- Contradictory or ambiguous input from the team itself.
- A decision that requires business judgment (is this actually in scope, should we
  restart a stage) — never make this call unilaterally, surface it per
  `similarity-consistency-checklist.md`'s "who to ask" routing.
- The same error recurring after one resolution attempt — that's a sign the fix
  addressed a symptom, not the cause.
