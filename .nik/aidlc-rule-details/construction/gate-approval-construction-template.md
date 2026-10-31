# Gate 2 — Construction Approval Template

Generates `aidlc-docs/intents/<intent-slug>/construction/shared/gate-approval-construction.md`
per Intent,
once every Unit under it is Done and Stage 4.5's Intent-Level Verification has run
(`core-workflow.md`). This is the *aggregate* gate — it does not re-run any Unit's own
exit-gate review (`unit-template.md` Section 14/15); it confirms the aggregate holds
once every Unit's individual review is already done. Signed, this clears the Intent for
Operations.

---

# Gate 2 — Construction Approval: [Intent name/link]

## What's being approved
- [ ] Every Unit listed below has its own signed-off exit gate (Section 14/15) —
      claims-check, deletion check, AC Reconciliation, risk-tagged spots,
      observable-behavior, verification-gap check all resolved, findings routed and
      closed per Section 15
- [ ] **Seam check** (Stage 4.5) — the Intent's original AC from `requirements.md`
      (not any single Unit's subset) verified end-to-end across the now-integrated Units
- [ ] **Aggregate-view check** (Stage 4.5) — pattern consistency across Units, no
      duplication a per-Unit review wouldn't catch, Elaboration's consistency-check ADRs
      actually followed once multiple Units touched the same area
- [ ] Every `deferred-work.md` entry from any Unit under this Intent has been reviewed —
      genuinely deferred, not silently dropped
- [ ] Test automation status confirmed for every Unit (web or mobile automation passing —
      mobile: on the local run, with the "9d DEV run" result recorded where the deploy has
      happened, else noted as pending / manual-testing flag for undrivable mobile steps
      posted on its Jira ticket / not applicable)
- [ ] No Unit under this Intent has an unresolved Test Coverage Reconciliation finding
      from its own Section 14/15 (per `unit-template.md`)

## Units covered by this gate
| Unit | Jira ticket | Exit gate signed by | Date |
|---|---|---|---|
| `<intent-slug>/UNIT-1` | [key] | [reviewer] | [date] |
| ... | | | |

## Sign-off
| Field | Value |
|---|---|
| Intent | [name/link to `intent.md`] |
| Signed by | [name] |
| Role | Solutions Architect / Software Engineer / DevOps Engineer |
| Date | [ISO date] |
| Verdict | **Accepted** / **Accepted with open items** / **Rejected** — per Stage 4.5's own three-way verdict, never silently defaulting to Accepted |

**Open items** (if "Accepted with open items"): [list — each with an owner and where
it's tracked, e.g. a `deferred-work.md` entry or a follow-up Intent]

**If Rejected**: name which Unit(s) need rework and why — this Intent is not marked Done
in `aidlc-state.md` until a subsequent gate here records Accepted or Accepted-with-open-
items.

## What happens next
Once signed, this Intent is cleared for Operations (deployment, monitoring handoff) per
whatever this project's own deploy runbook requires — this gate confirms the code is
ready; it does not itself perform or replace the deploy.

## Not this gate
This is not Section 14/15's own exit-gate review, which happens per Unit, not per Intent,
and must not be merged into this one. This gate should not be signed Accepted while any
Unit under this Intent still has an unresolved Test Coverage Reconciliation finding.
