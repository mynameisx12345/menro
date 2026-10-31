# Maturity Flags — Draft, Tested, Proven

Added in v3.5.0. Not every rule in NIK has been run on a real project. This file says how
that is shown, so a team can use a new rule knowing how much evidence stands behind it.

## The three levels

| Level | Means | Who may rely on it |
|---|---|---|
| **Draft** | Written and reviewed, not yet run on a real project. | Opt-in only. Never stops a Unit or a gate (see "At a gate" below). |
| **Tested** | Run on at least one real project and the result is recorded (what worked, what did not, what changed). | Teams that accept a rule still being adjusted. |
| **Proven** | Success criteria set **before** testing were met on at least two projects, one of them outside the project it was written for (a different stack, tool or team). | Everyone. |

A level only moves up with an **evidence entry** (project, date, what was run, result against
the criteria) and the NIK maintainer's sign-off. A rule does not become Tested because time has passed or
because nobody complained.

## Two classes of rule

- **Already-active rules** (in force before this file existed, for example the 3.4.0 result
  words). They stay on by default, keep blocking exactly as they did, and nothing changes
  for a project using them. They carry the separate label **In force, unproven**. The three
  levels above, and the "never stops" behaviour of Draft, do **not** apply to them.
- **New features from 3.5.0 on** (Foundation and what follows). They are **opt-in per
  project**: a project uses one only when its `PROJECT-RULES.md` §1 has a line for it
  (for Foundation: `- **Foundation**: opted in (Draft), <date>`). Bootstrap mentions it
  once, in the Welcome Message, as a notice and not a question
  (`intake/bootstrap-protocol.md` Step 6b). A project with no such line behaves exactly as
  it did before the feature existed, and none of its templates gain a line.

## Where the level is shown

1. **A marker line at the top of the rule file or section**, as the first line under the
   heading: `> Maturity: Draft (since 3.5.0)`.
2. **`README.md`, Status section** — a table of every flagged feature and its level.
3. **`.nik/VERSION` history** — a Draft feature's entry says "(Draft)" after its name.
4. **`aidlc-docs/audit.md`** — for an **opt-in** feature only (not for In force, unproven
   rules), one line **per Intent** that uses it, written at Intent load:
   `<timestamp> — used <feature> (<level>) — <Intent slug>`; for project-level use such as
   the Foundation session, one line when it runs. This is how real use is counted, so
   promotion rests on a record, not on memory.

## At a gate
A Draft feature that would hold a gate (Gate 0, Gate 1, the Unit entry gate) is **recorded
and shown at that gate, and the signer acknowledges it; it does not stop the gate**. The
same sentence governs every Draft rule: other files point here instead of restating it.

## Where evidence lives
Evidence entries are kept in the NIK repo, one file per feature, at `evidence/<feature>.md`
(outside `.nik/`, so they are not copied into projects). `evidence/foundation.md` is the
first. An entry has: project, date, what was run, result per criterion, and what was changed.

## Promotion

1. Before a feature is tested, write its **success criteria** (what would count as it
   working) at the top of its evidence file. Criteria written after the run do not count for
   Proven.
2. Run it on a real project. Add the entry described above.
3. The NIK maintainer signs off. The marker line, the README table and the VERSION history change in the
   same PR, and that PR's version bump follows `.nik/VERSION`'s own rules.

A flagged feature that fails its criteria is edited and stays at its level (or drops back to
Draft if the change is substantial). The entry stays in the evidence record.

## What this file does not do

It does not make a Draft rule mandatory, and it does not stop a project from using one. It
only makes the evidence visible.
