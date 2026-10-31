# Server Test Script — work that runs outside the browser

> Maturity: Draft (since 3.8.0) — opt-in per project, see `common/maturity-flags.md`.

Applies only when the project's `PROJECT-RULES.md` §1 has the line
`- **Server test script**: opted in (Draft), <date>`. A project without it is unchanged: no
script, no Section 12 row, no extra Section 11 or 13 item.

## Turning it on
The architect, or whoever owns `PROJECT-RULES.md`, adds the §1 line above. Asking for it by name
("turn on the server test script") is enough: the AI adds the line with today's date and shows it.
Bootstrap mentions it once in the Welcome Message, as a notice and not a question
(`intake/bootstrap-protocol.md` Step 6b). It can be turned on at any time; it applies from each
Unit's next entry gate.

## Recording use
Per `common/maturity-flags.md` ("Where the level is shown", item 4), write one line in
`aidlc-docs/audit.md` for each Intent that uses it, when its first Unit writes a script or records
the N/A: `<timestamp> — used Server test script (Draft) — <Intent slug>`. That count is what
promotion rests on.

## When it applies
A Unit adds or changes something that runs on a server and not inside a browser or app request:
a scheduled job, a command or one-off script, a go-live backfill, or a setting that has to be set
per server. The local 9c run can't prove that on the environments the Unit is promoted through,
and the person who tests in the browser often has no shell or admin access to reach it.

A Unit with nothing like that records "N/A — nothing runs outside a request" in Section 12.

It applies from a Unit's next entry gate. A Unit already past its exit gate, or built before the
project opted in, isn't reopened. A script can still be written for it later if the team wants one.

## What gets written, and when
At 9c, after the local run, the AI writes `construction/UNIT-n/server-test-script.md` for whoever
has server access on each environment. Section 7c names what runs where and who has that access;
the environment names come from `PROJECT-RULES.md`, not from this file.

**Writing the script is part of 9c. Running it is not a gate.** It can only run after deploy, so
it never holds 9d or the Unit's exit gate. A **missing** script doesn't hold them either: it does
not hold 9c's local pass or 9d (9c's hard gate is the local run only), and at the exit gate it is
recorded and shown ("At the gates" below). Until a run is recorded, the steps it covers stay
"Not verified — not run yet" in Section 12 (the result words), and the reviewer accepts that under
Section 14 like any other Not verified item.

## What the script holds
1. **Rules for the run**: what must not be changed (settings or config files, the scheduler's own
   install command, go-live switches such as a cut-off date or a feature flag), and when the server
   is up. Every step that sends a real message or writes real data is marked ⚠️ and confirmed before
   it runs.
2. **Step 0, a read-only pre-flight**: the deployed commit, schema changes applied, the command
   exists, its scheduler entry, and the settings it reads.
3. **Numbered steps**, each with the exact command, what to expect, and the AC or test case it
   covers. Every 9c item recorded as "Not verified locally" gets a step. Steps act on named test
   records only, and any override (a failing mail server, a changed setting) lasts for one process,
   never a settings-file edit.
4. **The schedule fires on its own**, checked while the server is up, for example with a temporary
   entry that is removed afterwards. Also **each tenant or database** the job has to cover, when
   there is more than one.
5. **A results table to paste and cleanup.** Steps that are only safe before production (a forced
   failure, test records) are marked with the environments they may run on.

## Where it lives and where results go
- The script is a tracking file, so it lives in the **home repo** with the Unit's other
  `construction/UNIT-n/` files (`common/multi-repo-units.md`), including for a Unit whose code is
  in another repo. It ships with the Unit's tracking files: in the Unit's PR when the Unit is in the
  home repo, otherwise on its own branch in the home repo, as for the 9c proof files.
- **Results have one home: a comment on the Unit's ticket, one per environment**, using the
  script's results table. The script file itself is not edited with results.
- Section 12's row (in `dev-output-check.md`) links each comment. That link is added after deploy,
  as a dated line in a follow-up commit, the same way as the "9d DEV run" line
  (`construction/unit-template.md` 9d step 4).

## At the gates (Draft)
Per `common/maturity-flags.md` "At a gate": a missing script, or a run not yet recorded, is
**recorded and shown** at the exit gate and the reviewer acknowledges it; it does not stop the gate.

## What this file does not do
It doesn't choose who runs the script on each environment (Section 7c records that), doesn't make
any change on a server, and doesn't replace 9c's local run or its proof files.
