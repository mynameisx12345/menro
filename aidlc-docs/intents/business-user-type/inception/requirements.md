# Requirements — Business User Type

## Summary
Add a new user type, **Business Owner**, functionally identical to Resident but visually distinguishable on the admin and collector maps via a distinct icon, and carrying a required `businessName` field.

## Functional Requirements

### FR-1 — New role `business`
- `users.role` accepts `'business'` (no schema change — column is free-text `TEXT NOT NULL`).
- `api/src/routes/auth.js` register validation accepts `'business'` alongside `'admin'`, `'resident'`, `'collector'`.
- Non-admin self-registration allows `'business'` (same as `'resident'`).
- JWT payload includes `role: 'business'` for business users.
- Login redirects business users to `/menro/resident` (shared route).

**Confidence:** High

### FR-2 — `businessName` field
- New column `users.businessName TEXT` (nullable at DB level).
- Required at API level for `role='business'` (register and update).
- N/A for residents (ignored if sent).
- New migration: `api/migrations/010_add_users_businessname.sql`.

**Confidence:** High

### FR-3 — Registration form toggle
- `ui/src/app/components/register/register.component.ts` gets a Resident/Business toggle.
- Default: Resident (preserves current behavior).
- Selecting Business reveals a required `businessName` field.
- Payload includes `role: 'business'` and `businessName` when Business is selected.

**Confidence:** High

### FR-4 — Admin user form
- `ui/src/app/components/admin-dashboard/users/users.component.ts` role dropdown includes `business`.
- When role = business, a required `businessName` field appears.
- Switching role away from business clears `businessName`.

**Confidence:** High

### FR-5 — Map icon (admin + collector)
- Business users appear on the admin dashboard live map and collector app map with a distinct business icon (not the resident house pin).
- Icon is inline SVG or emoji, matching the existing `L.divIcon` pattern.
- Resident icon unchanged.

**Confidence:** High (icon design pending UX prototype — see `ux-review.md`)

### FR-6 — Map popup
- Business popup shows only the business name: `<b>${businessName}</b>`.
- Resident popup unchanged: `<b>${name}</b><br>📍 ${address}`.

**Confidence:** High

### FR-7 — Endpoint extension
- `GET /api/auth/residents` returns both `role='resident'` and `role='business'` users.
- Response includes `businessName` and `role` so the UI can pick the right icon.

**Confidence:** High

### FR-8 — Demo account
- Seed `business@menro.gov` / `business123` with `role='business'`, `businessName='Demo Business'`, and an address.
- Matches the existing demo pattern in `api/src/data/db.js`.

**Confidence:** High

## Non-Functional Requirements

- **NFR-1** — No regression for existing residents: same icon, same popup, same behavior.
- **NFR-2** — No schema change for `role` (free-text column already accepts `'business'`).
- **NFR-3** — Migration is idempotent and backed up (existing `migrate.js` behavior).
- **NFR-4** — No new dependencies.

## Assumptions (from `elaboration-questions.md`)
- A1 — Business users share `ResidentPortalComponent` with no role-specific branching beyond the icon.
- A2 — Business icon appears only on admin and collector maps, not the resident portal home marker.
- A3 — `businessName` nullable at DB level, required at API/form level for business.
- A4 — Registration toggle defaults to Resident.
- A5 — Admin form shows `businessName` only when role = business.

## Parked / Deferred Items
None.

## Risk
**Low** — additive change, no existing behavior modified, no schema change for the role itself, one new nullable column.

## Confidence
**High** — all requirements grounded in existing code patterns; no unknowns.
