# Elaboration Question File Format

Adapted directly from .kiro's `question-format-guide.md` mechanism — same hard rules,
grouped by this framework's gap-checklist categories instead of flat numbering, and with
the assumption log folded into the same file so the PO sees everything in one place.

## Rule: Never Ask Questions in Chat
All questions from `elaboration-protocol.md` Step 3 go into `elaboration-questions.md` —
never asked inline. Round 2+ appends a new `## Round N` section to the same file.

## Hard Cap: File Count Is Fixed — Only Round Count Grows
An Intent that takes 5 rounds to reach clarity produces the same number of files as one
that takes 1 round. Never let file count scale with how unclear things are — only the
number of `## Round N` / `## Clarification Round N` sections inside a fixed file grows.

Per Intent, there are **at most two** question files, ever:
- `elaboration-questions.md` — every normal round appends `## Round N` here. Never
  create `elaboration-questions-2.md` or similar.
- `elaboration-clarification-questions.md` — created only the first time a contradiction
  is actually detected (Step 3.5). If a second contradiction shows up after that first
  one is resolved, append `## Clarification Round N` to this same file — do not create
  a second clarification file. Most Intents never need this file at all.

This mirrors the fixed-file convention elsewhere in this framework: `questions-log.md`
is one file per Unit, appended per mid-build question, never one file per question.

## File Structure

```markdown
# Elaboration Questions — <Intent short name>

## Round 1 — <date>

### Category: <gap-checklist category, e.g. "Data & AC specifics">

## Question 1 [Surfacing]
<Lead with the finding: what grounding turned up that the Intent didn't account for.
Then the question itself. Cite the file/finding it's based on.>

A) <First meaningful option — one candidate interpretation, if divergent>
B) <Second meaningful option>
C) <Third, if genuinely needed>
X) Other (please describe after [Answer]: tag below)

[Answer]:

## Question 2 [Gap]
<Plain gap question — nothing in the Intent or the codebase answers this>

A) ...
X) Other (please describe after [Answer]: tag below)

[Answer]:

## Question 3
...

### Category: <next category>

## Question 4
...

---

## Assumptions Log (Inferred items — not asked, logged for visibility)

**A-01**: <numbered, contestable assumption statement, with the reason it wasn't asked>
**A-02**: ...
```

## Answer States: Answered, or Parked — never silently blank
The team discusses each question live and agrees on one answer together — this
framework doesn't reconcile conflicting answers from different roles, because there
aren't any; a question is answered as a group. What it does need to support is the team
genuinely not having an answer yet.

- **Answered**: a lettered choice (or Other + description) in `[Answer]:`, as normal.
- **Parked**: `[Answer]: PARKED — <why, and when this is expected to be resolved, if
  known>`. This is a legitimate, explicit answer state — not a blank, and not an error
  from the validation pass in Step 4. A Parked answer is carried forward, not silently
  dropped:
  - It appears in `requirements.md` under a **Parked / Deferred Items** section.
  - It must be explicitly acknowledged (not just implicitly passed over) at the PO's
    Gate 1 sign-off in `gate-approval-inception.md`.
  - If it's relevant to a specific Unit, it's copied into that Unit's own packet
    (`unit-template.md` Section 8b) so Construction knows a decision was deliberately
    deferred, not missed — and if Construction reaches a point where the parked
    unknown actually matters, that's a hard Section 10 STOP-and-ask, not a guess.

## Question Rules (unchanged from .kiro)
- Minimum 2 meaningful options + Other; typical 3-4 + Other; max 5 + Other.
- **Never pad options to hit a letter count** — a question with only 2 real answers
  gets A/B/Other, not invented C/D choices.
- "Other" is mandatory, always last, always with free-text room after `[Answer]:`.
- Options should be mutually exclusive and cover the realistic cases — for a divergent-
  then-convergent question, each option is one candidate reading of the ambiguous line.
- Cite grounding in the question text itself where it exists (file:line, existing
  property/field name) — the PO should see *why* the question exists, not just the ask.

## Workflow
1. **Create** `elaboration-questions.md` (or append `## Round N` to it).
2. **Inform** the PO: how many questions, which categories, and that filling in
   `[Answer]:` with a letter (or Other + description) is all that's needed.
3. **Wait** for explicit confirmation the file is done — never read it mid-fill.
4. **Read, extract, validate** — every `[Answer]:` filled, every value a valid letter
   (or Other with a description).
5. **Contradiction/ambiguity pass** (mandatory) — check answers against each other and
   against the Intent for logical inconsistency. If found: create
   `elaboration-clarification-questions.md`, same format, explaining the specific
   contradiction and offering resolving options. Wait again before proceeding.
6. Only once clean: fold answers into `requirements.md`, update the Assumptions Log
   with anything still Inferred, and re-check `elaboration-protocol.md`'s Definition of
   Ready.

## Error Handling (unchanged from .kiro)
- Blank `[Answer]:` → name the specific question number, ask for completion, still in
  the file, not chat.
- Invalid answer (not a listed letter) → name the question, restate the valid letters.
- PO writes an explanation instead of a letter → ask them to pick the closest letter, or
  use Other with the explanation attached, so it stays machine-parseable.
