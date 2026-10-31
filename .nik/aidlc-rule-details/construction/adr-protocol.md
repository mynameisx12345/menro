# ADR Protocol — recording judgment calls made during Construction

Covers the SOFA 2.0 Master Document's `adr-NNN.md` artifact (Architect/Dev role,
"Architecture Decision Records for judgment calls made during Mob Construction"). This
file exists so that mechanism is actually *used*, not just named and left to happen by
accident — the same gap this framework already found and closed for QA's continuous
ceremony (`operations/qa-testing-protocol.md`).

## What actually qualifies (most Units log nothing here)

A real judgment call: a technology or pattern choice with lasting consequence, a
trade-off knowingly accepted over an alternative, or a constraint deliberately worked
around in a way future Units need to know about. Not: routine implementation details,
naming choices, or anything Section 14's AC Reconciliation would already catch as a bug
if done wrong. If a Unit's build didn't involve a real fork in the road, there's nothing
to record — say so plainly rather than manufacturing an entry.

## Where it's recorded — check `PROJECT-RULES.md` §3 first, always

**Never default to writing a new `adr-NNN.md` file.** Most brownfield projects already
have their own decision-record file and convention — `PROJECT-RULES.md` §3
(Architecture Decision Records) is where Bootstrap recorded what this project uses — the
file that fills the standing-rules role in the project's role map. For hr-iris-core,
that's `.claude/DECISIONS.md`, already the real, working mechanism, predating this
framework.

- **If §3 names an existing file** (hr-iris-core's case): append a new entry to *that*
  file, in *its own* existing format — don't impose the Binds/Prevents/Rule fallback
  below on a file that already has its own shape. For hr-iris-core specifically,
  match the established pattern exactly:

  ```markdown
  ## <Short decision title>

  **Decision:** <what was actually chosen>

  **Why:** <the reasoning — what problem this solves, why now>

  **Alternatives rejected:** <what else was considered and why it lost> (omit if none
  genuinely considered)

  **Tradeoff:** <what this commits the project to, what it rules out> (omit only if
  there is truly no tradeoff)
  ```

  Separate entries with `---`, same as the rest of that file. This is one more entry in
  an existing living document, not a new artifact.

- **Only if §3 says no such file exists for this project** (a genuinely greenfield case,
  or a brownfield project that never had one): create `aidlc-docs/shared/adr-NNN.md`
  files instead, one per decision, sequentially numbered, in `PROJECT-RULES.md` §3's
  Binds/Prevents/Rule format (rationale goes in `audit.md`, not the ADR file). This is the fallback default, never the first choice on a project that already
  has a working mechanism.

## Trigger point

Section 13 (Closing Actions) of `unit-template.md`, alongside the existing "Shared
architecture docs updated" checkbox — same moment, same discipline: most Units write "No
ADR needed," and that's a fine, expected answer, not a gap.
