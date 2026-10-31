# User Stories — Business User Type

## US-1 — Business owner self-registers
**As a** business owner, **I want to** register with my business name, **so that** I can use the waste-collection services and be identified as a business.

**AC:**
1. The registration page has a Resident/Business toggle.
2. Selecting Business reveals a required `businessName` field.
3. Submitting without `businessName` shows a validation error.
4. On success, the account is created with `role='business'` and `status='pending'`.
5. The account requires admin approval before login (same as resident).

## US-2 — Admin creates a business user
**As an** admin, **I want to** create a business user from the user management screen, **so that** I can onboard businesses that don't self-register.

**AC:**
1. The role dropdown includes `business`.
2. Selecting `business` reveals a required `businessName` field.
3. Switching role away from `business` clears `businessName`.
4. Saving without `businessName` (when role = business) shows a validation error.
5. The created user has `role='business'` and the given `businessName`.

## US-3 — Business owner logs in and uses the resident portal
**As a** business owner, **I want to** log in and see the same portal as residents, **so that** I can track trucks, view schedules, and file complaints.

**AC:**
1. Login with a business account redirects to `/menro/resident`.
2. The portal shows the same features as for a resident (map, schedules, complaints, chat, notifications).
3. No business-specific UI appears in the portal itself.

## US-4 — Admin sees business users on the live map
**As an** admin, **I want to** see business users on the live map with a distinct icon, **so that** I can tell businesses apart from residents at a glance.

**AC:**
1. Business users appear on the admin dashboard live map.
2. The icon is visually distinct from the resident house pin.
3. The popup shows only the business name.
4. Resident users still appear with the house pin and their existing popup.

## US-5 — Collector sees business users on the map
**As a** collector, **I want to** see business users on my map with a distinct icon, **so that** I know when I'm approaching a commercial address.

**AC:**
1. Business users appear on the collector app map.
2. The icon is the same distinct business icon as on the admin map.
3. The popup shows only the business name.
4. Resident users still appear with the house pin.

## US-6 — Existing residents are unaffected
**As a** resident, **I want** my experience to stay exactly the same, **so that** the new user type doesn't break anything for me.

**AC:**
1. Resident registration still works (no toggle required, no `businessName` field).
2. Resident login still redirects to `/menro/resident`.
3. Resident map icon is still the house pin.
4. Resident map popup still shows name + address.
5. Resident data is unchanged (no migration touches existing rows).
