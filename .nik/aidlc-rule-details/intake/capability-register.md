# Capability Register

> Maturity: Draft (since 3.5.0; extended in 3.6.0 after the first test run) — opt-in per project, see `common/maturity-flags.md`.

The register is the written record of what a new technical manager would need to know about
a project before Mob Elaboration: how it is built, deployed, accessed, tested and kept safe,
and who decides. It **extends `PROJECT-RULES.md` §1** (as §1a). It is not a separate file and
not a second source of truth.

A project without a register behaves exactly as it did before. Everything below applies only
to a project that opted in (`intake/foundation-protocol.md`).

## Header fields
- **Project shape**: one line (for example "server-rendered web app plus two mobile clients").
- **Stack**: the main languages, frameworks and datastores, one line each.
- **Plan per row**: see "Plan" below.
- **Depth**: lite / standard / full (see "Depth levels").

## The 15 capabilities
★ = always checked at Intent load, whatever the Intent touches.

| # | Capability | The question it settles |
|---|---|---|
| 01 | Surface and stack | What is built, with what, and for whom? |
| 02 | Deployment, environments, rollback | How does a change reach each environment, and how is it undone? |
| 03 | Background and scheduled work | What runs without a request, on what scheduler, and who restarts it? |
| 04 | Data, migrations, backups | Where is data kept, how do schemas change, what is backed up and restorable? |
| 05 | External systems and shared test data | Which outside systems are touched, and is any of them shared across environments? |
| 06 | Access and credentials | Who can reach servers and secrets, and how are they held? |
| 07 | Auth and roles | Who may do what inside the product? |
| 08 | API contract and consumers | What is exposed, and who depends on its shape? |
| 09 ★ | Testing approach | How is a change proven, by whom, with what tools? |
| 10 ★ | Review and ship workflow | How does a change get reviewed, merged and promoted? |
| 11 | Failure visibility | How does anyone find out something broke? |
| 12 ★ | Team and seats | Who holds which role, and which seats are empty? |
| 13 | Destructive-action safety | What must never be deleted, dropped or overwritten, and how is that enforced? |
| 14 ★ | AI-agent permissions and environment separation | What may an AI agent do, what is it blocked from, and is that enforced or only written? |
| 15 | Test data and accounts | Which accounts and data exist per environment, and which are safe to use? |

## The record for one row
Each row is a short card in `PROJECT-RULES.md` §1a (blank card in `intake/project-rules-template.md`).

| Field | What goes in it |
|---|---|
| **Answer** | The current fact, in plain words. |
| **State** | Decided · Detected · Unknown · N/A · Waived · Decided, not yet built · **Mixed** (see below). |
| **Flags** | **Exposed** when a credential is readable where it should not be (see below). Blank otherwise. |
| **Evidence** | **Verified** (checked against code, config or a workflow, cite `file:line`) · **Not verified — reason** · **N/A — reason**. A document that says it is a claim, not evidence. |
| **Rules in force** | The standing rules that govern this row: the text or `file#section`, and the date. |
| **Exceptions** | Recorded exceptions to those rules (see `foundation-reconcile.md`). |
| **Settled by** | Who answered, who accepted it (if different, by **full name and role**), and how (session, review, evidence). A delegated answer says **AI-proposed**, who delegated and when. |
| **Version / date** | When the row last changed. |
| **If unsettled** | What an Intent that depends on this row must do: **Hold** · **Resolve before Construction** · **Proceed with a control** (name it) · **Note**. |
| **Intent cues** | Words or areas that mean an Intent touches this row (for example "queue", "report", "migration"). |
| **Agent Setup role and home** | Which role (below) this row feeds and where it is written (file and section). |
| **Refresh trigger** | What event means the row must be re-checked (for example "a new queue is added"). |
| **Why / Who to ask / Known risks** | One line each. "Who to ask" routes a question to the seat who would know. |

### States
- **Decided** — a person with the authority chose it and it is recorded.
- **Detected** — found in the repo by evidence; nobody has confirmed it yet.
- **Unknown** — nothing found and nobody has said. Never sits blank.
- **N/A** — does not apply to this project (say why).
- **Waived** — knowingly left unanswered; a named person accepted the risk.
- **Decided, not yet built** — chosen, but the code or setup does not exist yet; the row's Plan says where it is going.
- **Mixed** — the row has parts in different states (for example dev and uat Detected, production Unknown; schema Detected, database backup Unknown). Write one line per part, each with its own State and Evidence; the row's State reads "Mixed". Rules that look at a row's state (the safety floor, Gate 0) look at each part.

### The Exposed flag
Set when Foundation finds a key, token, password or private file in version control, or
anywhere readable by people who should not have it. It is **not a State**: it sits beside
the State and **cannot be replaced by Waived or Unknown**, because Waived reads as calm while
the secret is still readable. It stays until the credential is removed **and** replaced
(rotated), and the Settled-by line says who confirmed that. A person may accept the risk of
leaving it; the flag then still shows at Gate 0 and at every Intent load. The AI never
quotes the secret, only names the file and the kind of secret.

### Plan (one line per row)
**Exists** (the answer is built today) · **Planned** (with a target, for example a sprint or Intent) · **Not planned**. Planned work comes from the architect's roadmap, the Stage 0.5 intent queue and the PM tool.

## Safety floor
These must never sit at Unknown or Waived unless a **named human accepted the risk, in plain
language, in "Settled by"**: access and credentials (06), auth and roles (07), the backup part
of data (04), destructive-action safety (13), and **both parts of row 14**, agent permissions
and environment separation. An AI that fills a register on its own, or is told to answer for
the architect, may not settle these.

## Depth levels (the architect picks one at the start of Foundation)
- **lite** — the ★ rows plus the rows the first queued Intents touch. Others stay Unknown with an If-unsettled outcome.
- **standard** — all 15 rows. The default.
- **full** — standard, plus Why / Who to ask / Known risks on every row and the new-manager test (`foundation-protocol.md` Step 6).

## Role map (Agent Setup)
**Agent Setup** is the set of AI-facing files, sections, skills and permissions a project uses
to tell its AI agents how to work. NIK works by **role**, not by file name: a project may keep
its architecture notes in `ARCHITECTURE.md`, `DECISIONS.md`, a section of `CLAUDE.md`, or a
tool-specific rules folder. NIK finds the file for each role **by content**, and the
architect confirms the match.

| Role | What it holds |
|---|---|
| Architecture | How the system is built and why. |
| Conventions | How code is written here. |
| Standing rules | Decisions and constraints that bind future work. |
| Agent limits | What an AI agent may and may not do. |
| Environments and deploy | Environments, how they differ, how changes ship. |
| Background jobs | Scheduled and queued work. |
| Data and migrations | Schema, migrations, backups. |
| Integrations | Outside systems and their limits. |
| Access and secrets | Who holds what; never the secrets themselves. |
| Testing | Test tools, accounts, seeded data. |
| Team and seats | Who holds which role. |

The map is recorded in `PROJECT-RULES.md` §1a as `role → file#section, file#section` (a role
may have several homes), or "none yet" with the row's Plan, or "outside the repo: <where>" for
a source held elsewhere (a deployment plan, a wiki), which counts as a claim and stays Not
verified. A role with no home is a finding for the architect, not an error: create it, point
to an outside source, or mark it Not planned (`foundation-protocol.md` Step 3).

NIK text refers to these roles, never to a particular file name. Names such as `CLAUDE.md`,
`DECISIONS.md` or `AGENTS.md` appear only as examples of what a project might use.

**Tool-specific files.** Where a project uses a particular AI tool, the role map points at that
tool's own files. The AI looks up the tool's current conventions rather than assuming them,
and records the source and the date it checked. NIK does not keep per-tool profiles.

## What the register does not do
- It does not replace Elaboration. Project-level capabilities are settled here; questions about a specific Intent stay in Elaboration.
- It does not change itself. An Intent never alters Agent Setup automatically (`foundation-reconcile.md`).
