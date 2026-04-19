# Project Structure

## Root
```
/
├── api/          # Node.js/Express backend
├── ui/           # Angular 18 frontend
└── README.md
```

## API (`api/`)
```
api/
├── server.js               # Entry point — Express app, WebSocket server, static file serving
├── menro.db                # SQLite database (runtime, not committed)
├── schema.sql              # Reference schema (not used at runtime — db.js bootstraps the schema)
└── src/
    ├── data/
    │   ├── db.js           # DB connection, schema creation, seeding, migrations, parse helpers
    │   └── store.js        # In-memory store (push subscriptions helper)
    ├── middleware/
    │   └── auth.js         # JWT authenticate + authorize middleware
    └── routes/
        ├── auth.js         # /api/auth — login, register, user management
        ├── trucks.js       # /api/trucks — CRUD + location update
        ├── schedules.js    # /api/schedules — CRUD + WebSocket broadcast on cancel
        ├── complaints.js   # /api/complaints — CRUD
        ├── segregation.js  # /api/segregation — CRUD
        ├── waste-types.js  # /api/waste-types — CRUD
        ├── push.js         # /api/push — Web Push subscription management
        ├── geocode.js      # /api/geocode — Nominatim proxy
        └── settings.js     # /api/settings — key/value app settings
```

## UI (`ui/`)
```
ui/
├── angular.json            # Build configurations (development, production, ngrok, network)
├── capacitor.config.ts     # Capacitor mobile config
├── ngsw-config.json        # Service worker config
├── public/                 # Static assets (icons, manifest, logo)
└── src/
    └── app/
        ├── app.component.*         # Root shell component
        ├── app.config.ts           # Angular providers (HttpClient, Router, ServiceWorker)
        ├── app.routes.ts           # Lazy-loaded routes per role
        ├── features.ts             # Feature flags (toggle UI sections)
        ├── components/
        │   ├── login/
        │   ├── register/
        │   ├── admin-dashboard/    # Tabs: live-map, schedules, complaints, segregation, fleet, settings
        │   ├── resident-portal/    # Tabs: track, schedule, complaints
        │   └── collector-app/      # Tabs: map, log-issue, collection
        ├── services/
        │   ├── auth.service.ts     # Login/logout, currentUser$ BehaviorSubject, localStorage token
        │   ├── data.service.ts     # CRUD for schedules, complaints, segregation, waste-types, settings
        │   ├── truck.service.ts    # WebSocket connection, truck position stream
        │   ├── push.service.ts     # Web Push subscription management
        │   └── notification.service.ts  # In-app notification helpers
        ├── models/
        │   └── models.ts           # Shared TypeScript interfaces: User, Truck, Schedule, Complaint, SegregationIssue, WasteType
        ├── guards/
        │   └── auth.guard.ts       # Route guard — redirects to login if no token
        ├── interceptors/           # HTTP interceptor — attaches JWT Bearer token to requests
        ├── shared/                 # Shared/reusable components
        └── utils/                  # Utility functions
```

## Key Architectural Patterns

- **All components are standalone** — no NgModules; use `imports: []` in `@Component` decorator
- **Lazy loading** — each role's dashboard is a separate lazy-loaded component via `loadComponent`
- **Role-based routing** — `authGuard` protects role routes; the API enforces roles via `authenticate`/`authorize` middleware on every protected endpoint
- **Single source of truth for API URL** — always use `environment.apiUrl` in services, never hardcode
- **New API routes** — create a file in `api/src/routes/`, export an Express router, and mount it in `server.js`
- **New UI features** — add a feature flag to `features.ts` first; gate the component/route behind it
- **Data models** — all shared TypeScript types live in `ui/src/app/models/models.ts`; keep API responses consistent with these interfaces
