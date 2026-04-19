# MENRO EcoTrack — Product Overview

MENRO EcoTrack is a waste management system for a municipal environment and natural resources office. It provides real-time GPS truck tracking, collection scheduling, resident complaint filing, and segregation violation reporting.

## User Roles

- **Admin** — manages trucks, schedules, complaints, segregation reports, users, and app settings
- **Resident** — tracks nearby trucks on a live map, views today's schedule, files missed-collection/delay complaints
- **Collector** — shares live GPS location, logs segregation violations with photo evidence, records collections

## Core Functional Areas

- Live map with WebSocket-based truck position updates (5s interval)
- 1 km proximity alert for residents via push notification
- Schedule CRUD with waste-type assignment and cancellation broadcasts
- Complaint lifecycle: open → reviewing → resolved
- Segregation issue lifecycle: open → reviewing → resolved (with photo proof)
- Push notifications (Web Push API) for nearby trucks, schedule cancellations, account approval, and chat
- In-app chat between residents and collectors over WebSocket
- Feature flags in `ui/src/app/features.ts` to toggle UI sections without code changes

## Demo Accounts

| Role      | Email                  | Password     |
|-----------|------------------------|--------------|
| Admin     | admin@menro.gov        | admin123     |
| Resident  | resident@menro.gov     | resident123  |
| Collector | collector@menro.gov    | collector123 |
