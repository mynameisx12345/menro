# Intent — Business User Type

## Raw Intent (verbatim)
> New user type, business owner. Basically the same with Resident only difference is the icon is different from resident and it has own icon for business type. In the map the collector and admin will know through icon if it is resident or business

## Structured

### Goal
Add a new user type, **Business Owner**, that behaves identically to Resident (same features, same permissions, same portal) but is visually distinguishable on the admin and collector maps via a distinct icon, and carries a required `businessName` field.

### Success Criteria
1. A user with `role = 'business'` can register (self-register or admin-created) and log in.
2. The registration form has a Resident/Business toggle; selecting Business reveals a required `businessName` field.
3. The admin user form has a `businessName` field, shown only when role = business, required.
4. Business users land on `/menro/resident` (shared route) and see the same portal as residents.
5. On the admin dashboard live map, business users appear with a distinct business icon (not the resident house pin).
6. On the collector app map, business users appear with the same distinct business icon.
7. The map popup for a business shows only the business name.
8. Existing residents are unaffected — same icon, same behavior, same data.

### Stakeholders
- **PO/BA**: Architect (Teng) — solo dev, holds all seats per CAP-12.
- **UX**: Architect (Teng) — no separate UX seat.
- **Architect/Dev**: Architect (Teng).
- **QA**: Architect (Teng) — no separate QA seat.

### Constraints
- No design system exists (CAP-01) — icon must be inline SVG or emoji, matching the existing `L.divIcon` pattern.
- No tests exist (CAP-09) — verification is manual 9c only unless a test is added.
- Solo dev, direct push to `main` (CAP-10) — no PR review gate.
- `users.role` is free-text `TEXT NOT NULL` — no enum constraint, so adding `'business'` needs no schema change for the role itself.
- `businessName` requires a new migration (`010_add_users_businessname.sql`).
- PII (addresses) — already classified in `PROJECT-RULES.md` §4.

### Non-goals
- No change to complaint types or workflow.
- No change to schedule logic.
- No change to notification logic.
- No change to chat.
- No change to profile editing (beyond adding `businessName`).
- No change to admin user management UI beyond adding `business` to the role dropdown and the `businessName` field.
- No new route — business users share `/menro/resident`.
- No separate business portal or business-specific features.
