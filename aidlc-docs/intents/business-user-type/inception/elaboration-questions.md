# Elaboration Questions — Business User Type

## Round 1

### Q1 [Gap] — Persona scope
Is "business owner" functionally identical to resident (same features, same permissions, same portal), with only a different icon on the map? Or does a business owner have different needs?

**[Answer]:** Yes — functionally identical to resident. Same features, same permissions, same portal. Only the icon differs.

### Q2 [Gap] — Extra data fields
Does a business user need extra fields beyond what a resident has (name, email, password, address, lat, lng)?

**[Answer]:** Add `businessName`. Currently `name` holds the owner's name; `businessName` is new.

### Q3 [Gap] — Registration flow
Can a business owner self-register from the public registration page, or only be created by an admin?

**[Answer]:** Both — self-register and admin-created, same as resident. Add a Resident/Business toggle to the registration form.

### Q4 [Gap] — Icon design
What should the business icon look like?

**[Answer]:** Propose one. (AI to build an interactive `.html` prototype per `ux-review-protocol.md` Step 3.)

### Q5 [Gap] — Where the icon appears
Confirm the business icon should appear in: admin dashboard live map, collector app map, resident portal home marker.

**[Answer]:** Admin dashboard live map and collector app map. Resident portal home marker stays a house (business users see their own home as a house, same as residents).

### Q6 [Gap] — Permissions
Can a business user file complaints, view schedules, chat with collectors, receive push notifications — same as resident?

**[Answer]:** Same as resident. All of it.

### Q7 [Gap] — Non-goals
Confirm this Intent does NOT change: complaint types/workflow, schedule logic, notification logic, chat, profile editing, admin user management UI (beyond role dropdown + businessName field).

**[Answer]:** Confirmed. None of those change.

### Q8 [Surfacing] — Existing endpoint
`GET /api/auth/residents` currently returns only `role='resident'`. To show business users on the map, this endpoint must include `role='business'` too (or a new endpoint).

**[Answer]:** Extend the existing endpoint to return both `resident` and `business`.

### Q9 [Surfacing] — Route guard gap
`authGuard` only checks `isLoggedIn()`, not role. A `business` user could currently navigate to `/menro/resident` and use the resident portal. Should business users share the resident portal route, or get their own route?

**[Answer]:** Share `/menro/resident` — same component, role-aware icon.

### Q10 [Gap] — Demo account
Should I seed a demo business account for testing?

**[Answer]:** Yes — `business@menro.gov` / `business123`, matching the existing demo pattern.

### Q11 [Gap] — Testing
How will this be verified?

**[Answer]:** Manual 9c only (open the map, see the business icon). No automated test added — CAP-09 gap remains.

### Q12 [Gap] — `businessName` required or optional?
**[Answer]:** Required for business users, N/A for residents.

### Q13 [Gap] — What shows in the map popup for a business?
**[Answer]:** (c) Just the business name.

## Assumptions Log

1. **A1** — Business users share the resident portal component (`ResidentPortalComponent`) with no role-specific branching beyond the icon. *Contestable at Gate 1.*
2. **A2** — The business icon appears only on the admin and collector maps, not on the resident portal's own home marker. *Contestable at Gate 1.*
3. **A3** — `businessName` is stored as a new `TEXT` column on `users`, nullable at the DB level (so existing residents are unaffected), but enforced as required at the API and form level for `role='business'`. *Contestable at Gate 1.*
4. **A4** — The Resident/Business toggle on the registration form defaults to Resident (preserves current behavior for the common case). *Contestable at Gate 1.*
5. **A5** — The admin user form shows `businessName` only when role = business; switching role away from business clears it. *Contestable at Gate 1.*

## Parked / Deferred Items

None.
