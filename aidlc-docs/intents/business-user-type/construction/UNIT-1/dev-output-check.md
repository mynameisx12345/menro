# UNIT-1 — Dev Output Check

Status: Complete

## 11. Definition of Done
- [x] Every AC in Section 2 is Verified (Section 12)
- [x] Only files in Section 3 touched — `api/migrations/010_add_users_businessname.sql`, `api/src/routes/auth.js`, `api/src/data/db.js`
- [x] Migration verified field-by-field against Section 4 — `users.businessName TEXT` (nullable), applied via `010_add_users_businessname.sql`
- [x] API/contract impact matches Section 5 — register accepts `business` + `businessName`; login/me/users include `businessName`; `/residents` returns both roles
- [x] 9a N/A — no test runner in this project (CAP-09)
- [x] 9b N/A — no test runner in this project (CAP-09)
- [x] 9c manual verification performed, proof saved to `9c-verification.txt`
- [x] 9d N/A — no UI surface (backend-only Unit)
- [x] Follows project conventions — same validation pattern, same migration pattern, same seed pattern
- [x] No debug code left
- [x] Branch sweep performed — every role branch in `auth.js` walked: `admin`, `resident`, `collector`, `business`; `businessName` set only for `business`, nulled for all others; `/residents` query covers both `resident` and `business`
- [x] Section 12 filled
- [x] Section 14 filled

## 12. Dev Output Check

| Check | Result |
|---|---|
| AC 1 | Verified — TC-4: `role:"business"`, `businessName:"Test Business"`, `status:"pending"` |
| AC 2 | Verified — TC-5: `400` `"Business name is required for business"` |
| AC 3 | Verified — TC-10: admin-created business, `status:"approved"`, `businessName:"Admin Business"` |
| AC 4 | Verified — TC-11: resident with `businessName` → `businessName:null` |
| AC 5 | Verified — TC-12: JWT `role:"business"`, user `businessName:"Demo Business"` |
| AC 6 | Verified — TC-13: `/residents` returns 20 residents + 3 businesses, each with `role` and `businessName` |
| AC 7 | Verified — TC-14: user 2 updated to `role:"business"`, `businessName:"Converted Business"`; reverted |
| AC 8 | Verified — TC-15: `business@menro.gov` seeded with `businessName:"Demo Business"` |
| AC 9 | Verified — TC-16: resident login works, `businessName:null` |
| Files touched vs. Section 3 | match — `api/migrations/010_add_users_businessname.sql`, `api/src/routes/auth.js`, `api/src/data/db.js` |
| 9a Unit tests | N/A — no test runner in this project (CAP-09) |
| 9b Integration tests | N/A — no test runner in this project (CAP-09) |
| 9c Manual verification | Verified live — 9/9 test cases passed, proof in `9c-verification.txt` |
| Server test script | N/A — not opted in (PROJECT-RULES.md §1) |
| 9d Test automation | N/A — no UI surface (backend-only Unit) |
| Assumptions made during build | none |
| Questions asked mid-build | none |

## 13. Closing Actions
- [x] Ship-skill: N/A — solo dev, direct push to `main` (CAP-10). No PR, no Jira (no PM tool).
- [x] 9c screenshot links: N/A — no Jira POT (no PM tool). Proof file committed at `aidlc-docs/intents/business-user-type/construction/UNIT-1/9c-verification.txt`.
- [x] Server test script: N/A — not opted in.
- [x] PR link / Jira comment: N/A — solo dev, direct push.
- [x] Shared architecture docs: No shared architecture doc updates needed — no new entity, no new infra.
- [x] Foundation register: No register updates needed — the diff adds a column and a role, both already covered by CAP-07 (auth and roles) and CAP-04 (data, migrations). CAP-15 (test data) gains a demo business account — noted below.
- [x] ADR needed? No ADR needed — additive change, no judgment call with lasting consequence.
- [x] AI usage log: N/A — no ship-skill.

**Foundation register note (CAP-15)**: demo business account `business@menro.gov` / `business123` added to `db.js` seed. CAP-15's answer should be updated to include it. Proposed edit for the reviewer: add `business@menro.gov` / `business123` to CAP-15's Answer and Evidence.

## 14. Exit Gate Reviewer Notes

**AC Reconciliation** (independent walk of the diff against Section 2's AC):
- AC1 — `auth.js` register: `role='business'` accepted, `businessName` required, `status='pending'` for non-admin. ✅
- AC2 — `auth.js` register: `if (role === 'business' && !businessName) return 400`. ✅
- AC3 — `auth.js` register: admin caller → `status='approved'`. ✅
- AC4 — `auth.js` register: `finalBusinessName = role === 'business' ? businessName : null`. ✅
- AC5 — `auth.js` login: response includes `businessName: user.businessName`. ✅
- AC6 — `auth.js` `/residents`: `WHERE role IN ('resident','business')`, selects `role, businessName`. ✅
- AC7 — `auth.js` `/users/:id`: `finalBusinessName = role === 'business' ? (businessName || null) : null`. ✅
- AC8 — `db.js` seed: `insert.run('4', 'Demo Business Owner', 'business@menro.gov', ..., 'business')` + `UPDATE users SET businessName='Demo Business'`. ✅
- AC9 — migration `010_add_users_businessname.sql`: `ALTER TABLE users ADD COLUMN businessName TEXT` (nullable). Existing rows unaffected. ✅

**Test Coverage Reconciliation**: no test runner (CAP-09). All 9 ACs verified manually via 9c. Each AC has a Negative case where a refusal path exists (TC-5 for AC2). ACs with no refusal path (AC1, AC3, AC5, AC6, AC7, AC8, AC9) have no Negative case — stated reason: they are success-path or data-shape checks.

**Deletion check**: no code removed. The inline `ALTER TABLE ... try/catch` blocks were replaced by the migration runner in a prior commit (`9e016f4`), not this Unit.

**Risk-tagged spots**:
- `api/src/routes/auth.js:register` — `[auth]` role validation and `businessName` requirement; a mistake here lets a business register without a name or a non-business register with one.
- `api/src/routes/auth.js:/residents` — `[public API]` response shape changed (added `role`, `businessName`); the UI consumes this.
- `api/migrations/010_add_users_businessname.sql` — `[schema]` adds a column; nullable so existing rows are safe.

**Observable behavior**:
```
**Business self-registration requires a business name**
Do: POST /api/auth/register with role=business and no businessName
Expect: 400, "Business name is required for business"

**Business users appear in /residents with their business name**
Do: GET /api/auth/residents with an admin token
Expect: array includes entries with role="business" and a non-null businessName
```

**Verification-gap check**: no test runner exists (CAP-09), so every changed behavior is verified manually via 9c only. No automated test would catch a regression here — this is the known CAP-09 gap, not a new one. Stated explicitly: **no verification gaps beyond the known CAP-09 gap.**

## 15. Reviewer Finding Disposition
No findings. UNIT-1 is complete.
