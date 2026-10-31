# Gate 1 — Inception Approval Template

Generates `aidlc-docs/intents/<intent-slug>/inception/gate-approval-inception.md` per
Intent, once Definition
of Ready is met (`elaboration-protocol.md`). This is the signed record that Elaboration
is genuinely done — not a formality: it's what lets Stage 3 create Jira tickets and
Construction begin without re-litigating scope Elaboration already resolved.

---

# Gate 1 — Inception Approval: [Intent name/link]

## What's being approved
- [ ] `intent.md` — the original ask, captured accurately
- [ ] `requirements.md` — reviewed and accurate
- [ ] `personas.md` — reviewed (including its "no new personas" form, if that's what it
      genuinely says)
- [ ] `user-stories.md` — reviewed, acceptance criteria accepted as testable
- [ ] Every gap-checklist category is Answered, Inferred-and-logged, or explicitly
      Parked — none silently blank
- [ ] Parked / Deferred Items list reviewed and **explicitly acknowledged** — this
      signature approves the parked list existing, not the parked list being empty
- [ ] Setup conflicts settled by the Architect, each with its outcome recorded, or shown
      here and acknowledged (`intake/foundation-reconcile.md`) — include this line only if
      `PROJECT-RULES.md` §1 records the Foundation opt-in (Draft); otherwise leave it out
- [ ] UX review completed and signed, if this Intent is UI-facing
- [ ] Gate 1 UI Summary Package (`inception/ui-summary-package.html`) compiled and
      shown to the PO, if this UI-facing Intent produced any prototypes
      (`ux-review-protocol.md` Step 5) — or explicitly noted as
      not needed because UX review resolved entirely via direct reuse

## Sign-off
| Field | Value |
|---|---|
| Intent | [name/link to `intent.md`] |
| Signed by | [name] |
| Role | Business Analyst / Product Owner / Product Manager |
| Date | [ISO date] |
| Verdict | Approved / Approved with noted conditions / Not approved |

**Conditions or notes** (if any): [free text — e.g. "approved on condition that
PARKED-03 gets resolved before UNIT-4 starts"]

## What happens next
Once signed, Stage 3 of `core-workflow.md` runs: Unit Separation produces
`unit-breakdown.md` (not reviewed here — this gate approves the requirements this split
will be based on, not the split itself, which doesn't exist yet), then the same round
runs the light approval of that split, ticketing, and Test Case Generation. A Unit's
Construction may begin only once that round is done, Stage 3.5 consolidation has run (if
this Intent ran in parallel with others), and the Unit clears Stage 4's four entry
checks — this gate is necessary for Construction, not sufficient on its own.

## Not this gate
This records the *Inception* exit, not any single Unit's Construction exit gate
(`unit-template.md` Section 14/15) and not the Intent-level Construction→Operations gate
(`gate-approval-construction-template.md`, Stage 4.5) — those come later, once Units are
actually built.
