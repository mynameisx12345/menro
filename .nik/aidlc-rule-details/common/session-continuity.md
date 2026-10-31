# Session Continuity

## On returning to an in-progress Intent
Before doing anything else, check `aidlc-docs/aidlc-state.md`. If it shows a Current
Intent still in progress, don't restart from scratch and don't silently assume where
things left off — confirm, using what's actually recorded:

```markdown
**Picking this back up — here's where it stands:**
- Intent: [name/link]
- Phase: [Bootstrap / Elaboration / Unit Separation / Construction / Done]
- Last completed: [the last checked box in Current Intent's Stage detail]
- Next step: [the first unchecked box]

Continue from there, or do you want to review something from an earlier stage first?
```

## Load only what the next step actually needs — not everything
Matching this framework's own "don't over-ceremony" instinct, don't reload every prior
artifact on every resume. Load by where the Intent actually is:

- **Still in Elaboration**: load `requirements.md` (if it exists yet), the current
  `elaboration-questions.md`, and `ux-review.md` if applicable.
- **Between Elaboration and Construction**: load `requirements.md` + `unit-breakdown.md`.
- **Mid-Construction on a specific Unit**: load that Unit's `unit.md`
  (`aidlc-docs/intents/<intent-slug>/inception/units/UNIT-n/`) + its `questions-log.md`
  and `dev-output-check.md` (`aidlc-docs/intents/<intent-slug>/construction/UNIT-n/`,
  where Sections 11-15 get filled in) — not every other Unit's
  files, and not the whole Intent's Elaboration history unless the resumed work actually
  needs it. If more than one Intent is in flight (`aidlc-state.md`'s "Intents in Flight"
  has multiple blocks), resume the specific one the team names — never guess which.

## Mid-Construction: derive the real resume point, don't presume one
`dev-output-check.md` and `questions-log.md` only prove a Unit's build *started* —
neither is required to change again until the build finishes (`questions-log.md` only
updates on a real STOP-and-ask) or Section 12 gets filled in. So don't claim a specific
Section 9 step without checking. Two passes, in this order:

**1. Read the hint.** `aidlc-state.md`'s per-Unit row for this Unit has 9a/9b/9c/9d
checkboxes. Read them first — they're a hint about where the build stands, not proof.

**2. Confirm against the real artifacts.** Check each step below. Where the checkboxes and
the artifacts disagree, **the artifacts win**: resume from what the artifacts show, flag
the mismatch, and fix the checkboxes (per `error-handling.md`'s resume-error section).
All file checks happen in the Unit's own repo — Section 0's Repo field, per
`multi-repo-units.md` — not automatically the home repo; only the
`construction/UNIT-n/` files themselves live in the home repo.

- **Sections 1-8 (implementation)**: diff the Unit's in-scope files (Section 3) against
  the Unit branch's base, including uncommitted changes. This only tells you *something*
  was started there, not that it's finished — a touched file looks the same whether it's
  done or half-written. That's fine: the resuming session's own first real action is
  reading the diff against Section 2's AC and judging what's left, the same as picking
  up anyone else's unfinished branch. Don't try to make this precise; it isn't, and
  doesn't need to be.
- **9a / 9b / 9d**: check whether the relevant test/automation file exists for this
  Unit — for a mobile Unit, in that repo's own UI-test location (Android
  `*/src/androidTest/`, iOS `IRIS-iOSUITests/`), never the home repo's `tests/`; a
  mobile 9d is done on its local run, and a DEV run still pending after deploy doesn't
  make it unfinished (`unit-template.md` 9d step 4). A step whose outcome is explicitly
  recorded in `dev-output-check.md` as not needed / not applicable (9b "not needed —
  <reason>", 9d "not applicable" or a mobile manual-testing flag) counts as done — it
  legitimately leaves no test file. In Section 12's result words, N/A counts as
  done and Not verified doesn't (that step still has work, or an open reviewer decision).
  Existence is enough for *orientation* — confirming it actually passes is the resumed work's own
  next natural step, not a precondition for figuring out where to resume. Don't run the
  suite just to decide where to resume; that duplicates work the resumed session was
  about to do anyway.
- **9c**: if `dev-output-check.md` records 9c as "N/A — no UI surface", 9c is done.
  Otherwise look for this Unit's proof file(s): anything matching
  `construction/UNIT-n/9c-verification*` (per `unit-template.md` Section 9c — often
  more than one file). None found: 9c isn't done. Found: check whether the proof is stale —
  - **Both committed**: compare the proof's latest **git commit time** against the
    latest git commit time of the Unit's Section 3 files, in the Unit's own repo. Don't
    use file modification times for committed files — a clone, checkout, pull or rebase
    resets them.
  - **Section 3 file uncommitted, proof committed**: the code is newer than the proof.
  - **Proof uncommitted, Section 3 files committed**: compare the proof's modification
    time against the Section 3 files' latest commit time. A commit after the proof was
    saved means the code moved on — re-verify.
  - **Both uncommitted** (the usual case right after 9c, before anything is committed):
    compare **file modification times** — reliable here, since nothing has been
    re-checked-out since those files were last written.
  - Nothing newer than the proof: trust it, 9c stands. Something newer: treat 9c as
    needing re-verification, not done — the proof is evidence for code that's since
    moved on.
  - **Server test script** (Draft, only in a project whose `PROJECT-RULES.md` §1 records the
    opt-in): if the Unit adds work that runs on a server outside a request, 9c also needs
    `construction/UNIT-n/server-test-script.md`, or an N/A in `dev-output-check.md`. Missing:
    9c's local run may stand, but the script is still to write. Whether it has been run on an
    environment doesn't change the resume point (`construction/server-test-script.md`).

## After deriving, say what was found
One line, not a re-narration: "Loaded `unit.md` and `questions-log.md` for UNIT-3 —
Sections 1-6 touched, no 9a test file found, no 9c verification artifact found. Resuming
at implementation/9a." A derived statement, not a presumed one — lets the team catch a
wrong resume point immediately rather than discovering it three steps in.

## If the state file and the actual artifacts disagree
See `error-handling.md`'s resume-error section — check which one's actually true before
trusting either, fix the mismatch, then continue. Never re-run a stage that already
produced a good artifact just because the checkbox looked wrong, and never mark
something complete because the checkbox says so if the artifact clearly isn't there.
