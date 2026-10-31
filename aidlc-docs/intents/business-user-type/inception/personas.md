# Personas — Business User Type

## New persona: Business Owner

**Who:** A local business owner (shop, restaurant, office) who needs the same waste-collection services as a resident — schedule visibility, truck tracking, complaint filing, chat with collectors.

**Needs:**
- Same as Resident: see the collection schedule, track the truck on the map, file complaints, chat with collectors, receive push notifications.
- Be identifiable as a business on the admin and collector maps (so collectors know they're approaching a commercial address, not a household).

**Differences from Resident:**
- Has a `businessName` (required).
- Appears on the map with a distinct business icon.
- Map popup shows the business name only.

**Not different:**
- Same portal (`/menro/resident`).
- Same permissions.
- Same features.

## Existing personas (unchanged)
- **Admin** — manages trucks, schedules, users, complaints, segregation issues.
- **Resident** — tracks trucks, views schedules, files complaints, chats with collectors.
- **Collector** — drives a truck, sends location, logs segregation issues, completes collections.
