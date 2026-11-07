# Audit Log

Append-only. Every round of questions, every answer batch, every gate approval, every Parked item, every escalation gets a line.

## 2026-10-31T00:00:00Z — Bootstrap completed — (project-level)
Stage 0 Bootstrap run. Brownfield monorepo (`api/` + `ui/`). NIK version 3.8.0. Architecture/rules source: `README.md` (partial). No PM/board tool connected. No design system found. No CI/CD found. Unit size signal: 3 days (default). Activation pointer added at `.aider/CONVENTIONS.md`.

## 2026-10-31T00:00:00Z — Foundation session started — (project-level)
Foundation opted in (Draft), depth `standard`. Capability Register pre-filled from evidence (15 rows). Three Exposed findings recorded on CAP-06: VAPID private key in `api/src/routes/push.js:7`, JWT secret fallback in `api/src/middleware/auth.js:2`, `api/menro.db` tracked in git. Architect (Teng) accepted the risk on 2026-10-31; Exposed flags remain open.

## 2026-10-31T00:00:00Z — used Foundation (Draft) — (project-level)
Per `common/maturity-flags.md`, one line for project-level use of an opt-in feature.

## 2026-10-31T00:00:00Z — Foundation Step 3 answer — (project-level)
CAP-10 (Review and ship workflow): Solo dev. No PRs, no review gate, no CI. Push directly to `main` (or current branch). Settled by Architect (Teng).

## 2026-10-31T00:00:00Z — Foundation Step 3 answer — (project-level)
CAP-12 (Team and seats): Solo dev. Architect (Teng) holds every seat — architect, developer, QA, Process Facilitator. No separate QA seat. Settled by Architect (Teng).

## 2026-10-31T00:00:00Z — Foundation Step 3 answer — (project-level)
CAP-14 (AI-agent permissions and environment separation): No enforced agent limits. The AI does whatever the architect asks. Written only, not enforced. Settled by Architect (Teng).

## 2026-10-31T00:00:00Z — Foundation Step 4 answer — (project-level)
Closing question ("What else would surprise a new technical manager on this project?"): "nothing else." No new Known risks or Parked items added.

## 2026-10-31T00:00:00Z — Foundation complete — (project-level)
All 15 rows have a State. Safety floor: CAP-06 Exposed (risk accepted by Architect Teng, 2026-10-31); CAP-07 Detected; CAP-04 backup Unknown (If unsettled: Resolve before Construction); CAP-13 Detected; CAP-14 Decided. ★ rows 09, 10, 12, 14 all settled. Role map exists. Gate 0 cleared (Draft — acknowledged, not blocking).

## 2026-10-31T00:00:00Z — Gate 0 cleared — (project-level)
Bootstrap Step 7 rows all filled or explicitly marked. Foundation (Draft, standard depth) complete: every row has a State, ★ rows settled, safety floor settled or risk accepted by a named person, Exposed flags listed (CAP-06, three findings, open), role map exists. Draft status acknowledged by Architect (Teng); does not block. Mob Elaboration may start once a real Intent is given.
# Audit Log

Append-only. Every round of questions, every answer batch, every gate approval, every Parked item, every escalation gets a line.

## 2026-10-31T00:00:00Z — Bootstrap completed — (project-level)
Stage 0 Bootstrap run. Brownfield monorepo (`api/` + `ui/`). NIK version 3.8.0. Architecture/rules source: `README.md` (partial). No PM/board tool connected. No design system found. No CI/CD found. Unit size signal: 3 days (default). Activation pointer added at `.aider/CONVENTIONS.md`.

## 2026-10-31T00:00:00Z — Foundation session started — (project-level)
Foundation opted in (Draft), depth `standard`. Capability Register pre-filled from evidence (15 rows). Three Exposed findings recorded on CAP-06: VAPID private key in `api/src/routes/push.js:7`, JWT secret fallback in `api/src/middleware/auth.js:2`, `api/menro.db` tracked in git. Architect (Teng) accepted the risk on 2026-10-31; Exposed flags remain open.

## 2026-10-31T00:00:00Z — used Foundation (Draft) — (project-level)
Per `common/maturity-flags.md`, one line for project-level use of an opt-in feature.

## 2026-10-31T00:00:00Z — Foundation Step 3 answer — (project-level)
CAP-10 (Review and ship workflow): Solo dev. No PRs, no review gate, no CI. Push directly to `main` (or current branch). Settled by Architect (Teng).

## 2026-10-31T00:00:00Z — Foundation Step 3 answer — (project-level)
CAP-12 (Team and seats): Solo dev. Architect (Teng) holds every seat — architect, developer, QA, Process Facilitator. No separate QA seat. Settled by Architect (Teng).

## 2026-10-31T00:00:00Z — Foundation Step 3 answer — (project-level)
CAP-14 (AI-agent permissions and environment separation): No enforced agent limits. The AI does whatever the architect asks. Written only, not enforced. Settled by Architect (Teng).

## 2026-10-31T00:00:00Z — Foundation Step 4 answer — (project-level)
Closing question ("What else would surprise a new technical manager on this project?"): "nothing else." No new Known risks or Parked items added.

## 2026-10-31T00:00:00Z — Foundation complete — (project-level)
All 15 rows have a State. Safety floor: CAP-06 Exposed (risk accepted by Architect Teng, 2026-10-31); CAP-07 Detected; CAP-04 backup Unknown (If unsettled: Resolve before Construction); CAP-13 Detected; CAP-14 Decided. ★ rows 09, 10, 12, 14 all settled. Role map exists. Gate 0 cleared (Draft — acknowledged, not blocking).

## 2026-10-31T00:00:00Z — Gate 0 cleared — (project-level)
Bootstrap Step 7 rows all filled or explicitly marked. Foundation (Draft, standard depth) complete: every row has a State, ★ rows settled, safety floor settled or risk accepted by a named person, Exposed flags listed (CAP-06, three findings, open), role map exists. Draft status acknowledged by Architect (Teng); does not block. Mob Elaboration may start once a real Intent is given.

## 2026-10-31T00:00:00Z — Intent received — business-user-type
Raw Intent: "New user type, business owner. Basically the same with Resident only difference is the icon is different from resident and it has own icon for business type. In the map the collector and admin will know through icon if it is resident or business."

## 2026-10-31T00:00:00Z — Foundation reconcile run — business-user-type
Rows checked: CAP-01, CAP-07, CAP-08, CAP-15 (Intent cues), plus ★ CAP-09, CAP-10, CAP-12, CAP-14. All Covered. No Silent, no Conflict, no Unclear. No setup conflicts.

## 2026-10-31T00:00:00Z — Round 1 questions created — business-user-type
Q1–Q13 written to `elaboration-questions.md`. 11 Gap, 2 Surfacing (Q8 endpoint extension, Q9 route guard gap).

## 2026-10-31T00:00:00Z — Round 1 answers received — business-user-type
Q1: functionally identical to resident. Q2: add `businessName`. Q3: both self-register and admin-created, with Resident/Business toggle. Q4: propose icon. Q5: admin + collector maps only. Q6: same permissions as resident. Q7: non-goals confirmed. Q8: extend `/api/auth/residents`. Q9: share `/menro/resident`. Q10: seed demo business account. Q11: manual 9c only. Q12: `businessName` required for business. Q13: popup shows business name only.

## 2026-10-31T00:00:00Z — UX review complete — business-user-type
Prototype `ui-summary-package.html` built (blue storefront pin, `#1565c0`, same teardrop shape as resident house pin). PO verified and approved the icon.

## 2026-10-31T00:00:00Z — Gate 1 approved by Architect (Teng) — business-user-type
Verdict: Approved. No conditions. Assumptions A1–A5 accepted. No Parked items. Gate 1 record: `intents/business-user-type/inception/gate-approval-inception.md`.

## 2026-10-31T00:00:00Z — Unit Separation complete — business-user-type
Verdict: PASS. 2 Units: `business-user-type/UNIT-1` (backend — role, businessName, endpoints, seed) and `business-user-type/UNIT-2` (frontend — registration toggle, admin form field, map icons). UNIT-2 depends on UNIT-1. No file overlap. No forward dependencies. No orphans. Size signal not crossed. `unit-breakdown.md` written.

## 2026-10-31T00:00:00Z — Unit-breakdown split approved — business-user-type
Light approval round: 2 Units approved by Architect (Teng). Packets populated.

## 2026-10-31T00:00:00Z — Test cases generated — business-user-type
26 test cases authored across both Units (`testing/test-cases.md`, `testing/test-case-details/UNIT-1.md`, `testing/test-case-details/UNIT-2.md`). All Manual (no test runner, CAP-09). Each AC has at least one Negative case or a stated reason none applies.

## 2026-10-31T00:00:00Z — Test plan written — business-user-type
`testing/test-plan.md` written per `qa-testing-protocol.md` item 1. Risk-ranked Units: UNIT-1 (auth, schema), UNIT-2 (UI, map). NFRs mapped to test cases. Regression surface identified. All 26 cases Manual (CAP-09).

## 2026-10-31T00:00:00Z — UNIT-1 Construction started — business-user-type
Stage 4 entry gate passed (assignment, completeness, test-plan, test-cases). `construction/UNIT-1/` created with `dev-output-check.md` and `questions-log.md`. Implementation begun.

## 2026-10-31T00:00:00Z — UNIT-1 9c verification passed — business-user-type
9/9 test cases passed (TC-4, TC-5, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15, TC-16). All 9 ACs Verified. Proof saved to `construction/UNIT-1/9c-verification.txt`.

## 2026-10-31T00:00:00Z — UNIT-1 Definition of Done confirmed — business-user-type
Section 11 self-check complete. Section 12 filled (all ACs Verified, 9a/9b/9d N/A, 9c Verified). Section 14 reviewer notes filled (AC Reconciliation clean, no verification gaps beyond CAP-09). Section 15: no findings. UNIT-1 complete.

## 2026-10-31T00:00:00Z — Mid-Workflow Change (Moderate) — business-user-type
Trigger: UNIT-2 9c found two issues. (1) The business pin glyph read as a house at 16×16 — the storefront path was too flat. (2) The business user's own home marker in the resident portal was still a house, contradicting the PO's intent that a business user be visually distinct everywhere. Change: (a) business pin glyph replaced with a storefront-with-awning (three vertical stripes over a door); (b) resident portal home marker picks icon by `user.role` — business users see a storefront emoji, residents see a house emoji. Scope: Moderate — affects UNIT-2's scope (one more file, two more ACs), not the Intent's overall scope. Approved by Architect (Teng). `elaboration-questions.md` Q5 updated with the reversal; `requirements.md` FR-5 updated; `unit.md` UNIT-2 ACs 13-14 added, Section 3 file list updated.

## 2026-10-31T00:00:00Z — Mid-Workflow Change (Moderate) — business-user-type
Trigger: UNIT-2 9c re-verification found two more issues. (1) The business popup showed only the business name — the PO wants the address too, same as the resident popup. (2) The storefront glyph rendered as "24" at 18×18 — the awning + door path collapsed into digit-like shapes. Change: (a) business popup now shows `<b>${businessName}</b><br>📍 ${address}`; (b) storefront glyph redrawn cleanly (awning + door, no digit-like shapes). Scope: Moderate — affects UNIT-2's scope (popup content + glyph), not the Intent's overall scope. Approved by Architect (Teng). `elaboration-questions.md` Q13 updated with the reversal; `requirements.md` FR-6 updated; `unit.md` UNIT-2 ACs 9-10 updated.
