# Foundation — Stage 0, part 2

> Maturity: Draft (since 3.5.0; extended in 3.6.0 after the first test run) — opt-in per project, see `common/maturity-flags.md`.

Foundation is what Bootstrap does *after* detection when a project opts in: the architect and
the AI settle, in writing, the project-level facts every Intent will lean on. The picture to
hold is onboarding a new technical manager: they need to know how the project is built,
shipped, accessed and kept safe before they run their first elaboration. Here the manager has
an AI that remembers everything it was told, so **the written record is the memory**.

It is a one-time setup, repeated only when the register changes materially. It is not run per Intent.

## Step 0 — Opt-in and depth
Bootstrap mentions Foundation once, in the Welcome Message, as a notice and not a question
(`bootstrap-protocol.md` Step 6b). It starts when the architect asks for it, at Bootstrap or
any time later. Record `- **Foundation**: opted in (Draft), <date>` in `PROJECT-RULES.md` §1
and ask for a depth (`capability-register.md`: lite / standard / full; default standard). A
project that never asks has no such line, and nothing else in this file applies to it.

## Step 1 — AI pre-fill from evidence (read-only)
For each row in scope, search the project for the answer: code, config, workflows, deploy
scripts, scheduler settings, permission files. Write what was found as **Detected**, with
**Verified** evidence (`file:line`). Where nothing is found, write **Unknown**.

**Which branches and sources to read.** List the project's branches first and read the main
integration branch **plus every branch a deploy or workflow file lives on** (a workflow that
exists only on the `uat` branch is invisible from `dev`). Read-only reads outside the working
tree count as evidence: `origin/<branch>` contents and read-only GitHub API `GET` calls (for
example branch protection). Never write, never use a call that changes anything. Record the
ref or source and the date in the row's Evidence. **Use only the access already available**:
never ask for, or switch to, a token with more rights to read something. If a read is refused
(branch protection, for example, often needs admin rights), mark that evidence **Not
verified — access refused**.

**Never fill a row from a document alone.** A document is a claim. But a document is also a
source of conflicts, so **read every document the role map names in full and compare it with
the code**; a runbook that records a deliberate choice ("parked by design", "do not enable")
must be read to the line, because the code alone will not explain it. Where two sources
disagree, write both and mark the row for Step 3. The kinds of disagreement are: document
against code, document against document, code against code (for example a workflow against a
service unit), and, later, an architect's answer against code. (A dry run found six on a real
project and a later test run found fourteen; filling from documents would have copied them.)

**A credential found where it should not be.** If a key, token, password or private file is
found in version control (or any place readable to people who should not have it): **stop and
tell the architect now**, before continuing. Do not open it, print it or quote it; name the
file and what kind of secret it appears to be. Record the row with the **Exposed** flag
(`capability-register.md`). The flag is not a state and cannot be replaced by Waived or Unknown.

**How to look so the secret is not printed.** The transcript is itself a place readable by
people who should not have the secret. Search by file name or pattern and list **file names
only** (for example `grep -l`, a file listing, or a tracked-files list); never run a command
whose output contains the value, and do not read a file you suspect holds one (`.env`, a
key or service-account file). If a value is printed by accident, say so to the architect at
once, do not repeat it, and note that it now sits in this transcript.

Nothing is edited in the project in this step.

## Step 2 — Role map
Propose which existing file or section fills each role (`capability-register.md`, Role map),
found by content; a role may have more than one home. The architect confirms or corrects.
A role with no home is listed for Step 3, where the architect chooses: create one, point to
a source held outside the repo (a deployment plan, a wiki: record where, as a claim, Not
verified), or Not planned.

## Step 3 — Foundation Session (architect-led, live)
**How to present a row.** One row at a time. Say what was found and where, in plain words,
and define any technical term the first time it is used. Ask **one** question. Do not
offer a sample answer or a fill-in-the-blank to copy: a worked example gets copied back as
the answer. An empty reply, a template or a placeholder is not an answer; ask again.

Walk the rows with the architect. For each row:
1. Show the Detected answer and its evidence, or ask the question.
2. The architect confirms, corrects, or says it is unknown. A row can be **Mixed** (one
   part known, another not); record each part with its own state (`capability-register.md`).
3. **Capture on answer**: write the answer, the state and "Settled by" into the register as
   soon as the architect confirms it, not at the end. A fact said in the session and not written
   is lost; a draft captured before the answer is final is a second mistake.
4. If the answer conflicts with the code, the architect decides (`foundation-reconcile.md`,
   "Disagreements"). If the architect reverses an earlier answer, record both and the
   reversal, and check the other rows it touches (same file).
5. For a row left Unknown or Waived, set **If unsettled** and, for the safety floor rows,
   name who accepts the risk, **by full name and role**.
6. For each role with no home (Step 2), record the architect's choice.

The architect may answer "not planned" for a role or row; record it as the Plan.

**If the architect delegates** ("answer them yourself"): continue, label every answer
**AI-proposed**, and record who delegated and when. Safety floor rows stay open (an AI may
not settle them), and the register says plainly which rows were never reviewed by a human.
A delegated row does not count as settled by the architect for Step 5 or for promotion.

## Step 4 — Close the session
Ask once: **"What else would surprise a new technical manager on this project?"** Each
answer becomes a Known risk on the row it belongs to, or a Parked item in
`aidlc-docs/` if it fits no row. Then read back each named risk acceptor (full name and
role) and ask the architect to confirm it, so "the architect accepted" never stands in for
a name.

## Step 5 — Gate 0 (widened, only when Foundation is opted in)
Gate 0 normally clears when `bootstrap-protocol.md` Step 7's rows are filled. With Foundation
on, it also needs:
- every row in scope has a State (none blank);
- the ★ rows (09, 10, 12, 14) are not Unknown without an **If unsettled** outcome;
- every safety-floor row is settled, or has a named person accepting the risk;
- every **Exposed** flag is listed, with its status (open / fixed), whether or not a risk
  was accepted;
- the role map exists.

While Foundation is Draft, anything above that is not met is recorded and shown at Gate 0 and
the signer acknowledges it; it does not stop the gate or a Unit (`common/maturity-flags.md`,
"At a gate").

## Step 6 — New-manager test (required at depth full, recommended otherwise)
Start a fresh AI session with no history. Give it only the Foundation output (the register and
the files named by the role map). Ask it about 15 onboarding questions, one per row (for
example "how does a change reach production, and how is it undone?"). The architect compares
the answers with what is true. Every wrong or empty answer is a gap in the register: fix the
row and ask again. Record the result (questions asked, how many right) in the feature's
evidence file, `evidence/foundation.md` in the NIK repo (`common/maturity-flags.md`,
"Where evidence lives").

## Step 7 — Record
- `PROJECT-RULES.md` §1a holds the register; §1 holds the opt-in line.
- `aidlc-docs/audit.md`: one line when the session runs, and one per Intent at Intent load, per `common/maturity-flags.md`.
- `aidlc-docs/aidlc-state.md`: Foundation status (not started / in progress / complete, depth, date).

## Keeping it true
- **At each Intent load**, `foundation-reconcile.md` checks the rows the Intent touches against the code and reports differences.
- **At each Unit close**, the AI drafts register edits from the Unit's diff for the reviewer to accept or reject.
- **Rules change only by architect decision.** The AI may add a marked block or propose a diff; it never rewrites a rule on its own.
- Each row's **Refresh trigger** says when to re-check it.

## Not in this version
Foundation for a project that has no code yet (an interview about the stack, ideation, an
AI-led mode for non-technical owners), tool-specific generation and wiring checks, and
loading modes are planned for later versions. This version is for a project that already has
code and an architect.
