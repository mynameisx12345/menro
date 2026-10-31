# PROJECT-RULES.md — Template

The single canonical rules file every ceremony reads (per `elaboration-protocol.md`
Step 1.3, `bootstrap-protocol.md` Step 3, `similarity-consistency-checklist.md`
throughout). Bootstrap populates the detected sections on first run; the team adds to
"Known Standing Constraints" and "ADRs" as real things get learned. Lives at
`aidlc-docs/PROJECT-RULES.md` for the actual project — this file is the blank template.

## What belongs in this file (the actual governing test)
Not *"could someone figure this out by reading the code"* — **what does it cost when
they don't.** A line earns its place here only if:
- It's policy the code itself can't express (a permission scope, a frozen path, a
  contractual limit like a vendor's API access boundary).
- It's a convention that diverges from what'd be assumed by default — not a restatement
  of the obvious.
- It's a pitfall with **observed evidence** — something that actually went wrong once,
  not a theoretical risk. A codebase has hundreds of trap-looking facts; almost none of
  them predict a real mistake. Only recording ones that already caused one keeps this
  file trustworthy instead of bloated.
- One occurrence is worth a mention; a **recurring or costly** mistake earns a permanent
  line. Don't write down every near-miss — write down the ones that would burn someone
  again if this file didn't exist.

Retire a line when the thing it guards against is gone — never because "nothing's
failed lately" (a working rule looks quiet right up until someone removes it).

---

## 0. Document Control
| Field | Value |
|---|---|
| Project | [name] |
| Owner | [Process Facilitator or Architect name] |
| Last updated | [ISO date] |
| Status | draft / active |

## 1. Environment & Tooling Detected (populated by `bootstrap-protocol.md`)
- **NIK version**: [read directly from `.nik/VERSION` — never hand-typed; update this line
  whenever the project's copy of `.nik` is refreshed]
- **Architecture/rules source**: [files found, with real paths — not just filenames]
- **Activation pointer**: [found at <path>, quoted / added at <path>, per team
  confirmation / still missing — flagged, framework may not auto-trigger reliably]
- **PM/board tool**: [tool + connector, or "none connected"]
- **Design system**: [source found, or "none found"]
- **CI/CD**: [pipeline + branch convention, or "none found"]
- **Unit size signal**: [days per Unit — configured value, or default]
- **Workspace**: [greenfield/brownfield, languages, build system]
- **Foundation** (Draft, optional): [opted in, <date> / leave out if not opted in — see
  `foundation-protocol.md`; when opted in, fill §1a below]
- **Server test script** (Draft, optional): [opted in, <date> / leave out if not opted in —
  see `construction/server-test-script.md`]

### 1a. Capability Register (Foundation, Draft — leave out if not opted in)
Header: **Project shape**: [one line] · **Stack**: [one line each] · **Depth**: [lite /
standard / full] · **Role map**: [role → file#section, file#section; or "none yet" + plan; or
"outside the repo: <where>"]. Field meanings:
`intake/capability-register.md`. One card per row, 01-15:

```markdown
#### CAP-NN <name>   [★ if always checked]
- **Answer**: [plain words]
- **State**: [Decided / Detected / Unknown / N/A / Waived / Decided, not yet built / Mixed — one line per part]
- **Flags**: [Exposed — a credential readable where it should not be; never replaced by Waived / blank]
- **Evidence**: [Verified (file:line) / Not verified — reason / N/A — reason]
- **Rules in force**: [text or file#section, date]
- **Exceptions**: [recorded exceptions, or none]
- **Settled by**: [answerer / acceptor (full name + role) / how; AI-proposed + who delegated, if delegated]   **Version/date**: [date]
- **If unsettled**: [Hold / Resolve before Construction / Proceed with a control / Note]
- **Intent cues**: [words or areas]   **Refresh trigger**: [event]
- **Agent Setup role and home**: [role → file#section]   **Plan**: [Exists / Planned (target) / Not planned]
- **Why / Who to ask / Known risks**: [one line each]
```

## 2. Known Standing Constraints (observed evidence only — see the test above)
The durable home for things that already went wrong once and would again if forgotten.
Format: what the constraint is, what it costs if ignored, when/how it was learned.

_Example (real, not hypothetical — this is the shape every entry should take):_
> **EzTech (Odoo) production credential lacks `hr.employee` write access.** Confirmed by
> EzTech support as outside the vendor contract — cannot be expanded on request. Any
> Unit writing to `hr.employee` via the Odoo integration will fail with `Fault 4` in
> production even if it works in dev/uat (which use a more permissive account). Learned:
> [date], during [Intent/incident]. Any future Intent touching this integration should
> hit this via grounding (`similarity-consistency-checklist.md` item 7) before building
> on the dev/uat assumption again.

## 3. Architecture Decision Records (ADRs)
| ADR | Decision | Status | Link |
|---|---|---|---|
| ADR-001 | [short title] | Accepted | `adr-001.md` |

Each ADR file records the **decision**, not the rationale (rationale/discussion lives in
`audit.md`) — as three lines, not an essay:
- **Binds**: [what this decision constrains — which Units/areas it governs]
- **Prevents**: [the specific divergence this stops two independently-built things from
  hitting]
- **Rule**: [the actual enforceable rule — what to do, stated so a future Unit can check
  itself against it directly]

Every confirmed-intentional deviation from an established pattern
(`similarity-consistency-checklist.md` item 2/5) gets recorded here — so the next Intent
that hits the same fork finds a decision already made, not a repeat of the same question.

## 4. Data Classification (if this project handles anything requiring it)
| Classification | Handling rule |
|---|---|
| Public | No special handling |
| Internal | Access restricted to authenticated staff |
| Confidential | Access restricted to named roles |
| Restricted/PII | Encrypted at rest/transit; masked in non-prod; never pasted into AI prompts unmasked |

## 5. Non-negotiable Constraints
- [e.g. "must integrate with the existing identity provider — no new auth system"]
- [e.g. "must not introduce a new message broker — use the existing one"]

## 6. Coding Conventions Pointer
Don't duplicate the project's own conventions file here — point at it:
- [link to the project's actual conventions/style guide, per Section 1's detected source]

## 7. Open Conflicts / Known Gaps
Any conflict between an ADR and another rule or convention that has surfaced but
hasn't been fully reconciled yet. Keep empty in a healthy project — a growing list here is a signal this file
needs review sooner than its normal cadence.

- [none currently logged]
