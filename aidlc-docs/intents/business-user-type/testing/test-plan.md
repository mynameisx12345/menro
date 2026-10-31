# Test Plan: Business User Type

Written once per Intent, before Construction starts (per `qa-testing-protocol.md` item 1).

## Risk-ranked Units

| Unit | Risk area | Why |
|---|---|---|
| `business-user-type/UNIT-1` | auth, schema | Modifies the registration validation, the login response, and the residents endpoint. Adds a column to `users`. A mistake here affects every user, not just businesses. |
| `business-user-type/UNIT-2` | UI, map | Changes the registration form (shared by all residents), the admin user form, and the map marker rendering on two screens. A mistake here could break resident registration or hide residents from the map. |

## NFRs requiring dedicated validation

- **NFR-1 (no regression for residents)** — spans both Units. Validated by TC-6 (resident registration unchanged), TC-13 (residents still show house pin), TC-16 (existing resident unaffected by migration).
- **NFR-2 (no schema change for role)** — UNIT-1. Validated by TC-4 (business registers without a schema change to `role`).
- **NFR-3 (migration idempotent)** — UNIT-1. Validated by running `npm run migrate` twice; second run reports "Up to date".
- **NFR-4 (no new dependencies)** — both Units. Validated by inspecting `package.json` diffs (none expected).

## Regression surface

- **Resident registration** — `register.component.ts` is shared by all residents. TC-6 covers it.
- **Resident map markers** — `showResidentMarkers()` in both `admin-dashboard.component.ts` and `collector-app.component.ts` is shared. TC-13 covers it.
- **Resident login** — `auth.js` login response is shared. TC-16 covers it.
- **Admin user management** — `users.component.ts` is shared. TC-7, TC-8, TC-9, TC-10 cover it.
- **Existing residents' data** — the migration adds a nullable column; no existing row is touched. TC-16 covers it.

## Test execution

- **No test runner exists** (CAP-09). All 26 test cases are **Manual**.
- Execution: 9c manual verification per Unit, with proof saved to `construction/UNIT-n/9c-verification*`.
- QA's independent post-merge execution: N/A — no separate QA seat (CAP-12). The architect (solo dev) performs 9c and the exit-gate review.

## Coverage summary

| Unit | Test cases | Positive | Negative | Regression |
|---|---|---|---|---|
| UNIT-1 | 9 | 6 | 2 | 1 |
| UNIT-2 | 17 | 13 | 3 | 1 |
| **Total** | **26** | **19** | **5** | **2** |

Every AC has at least one test case. Every AC with a refusal path has a Negative case (TC-2, TC-5, TC-8, TC-10, TC-11). ACs with no refusal path (display-only, e.g. TC-1, TC-7) have no Negative case — stated here as the reason.
