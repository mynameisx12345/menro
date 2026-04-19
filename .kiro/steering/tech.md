# Tech Stack

## API (Node.js)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: SQLite via `better-sqlite3` (synchronous, file-based — `api/menro.db`)
- **Auth**: JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`), 8h token expiry
- **Real-time**: WebSocket (`ws`) at `/ws/trucks`
- **Push notifications**: `web-push` (Web Push API)
- **Other**: `uuid` for ID generation, `dotenv` for env config, `cors`

## UI (Angular)
- **Framework**: Angular 18 (standalone components)
- **Maps**: Leaflet 1.9 with OpenStreetMap tiles
- **HTTP**: Angular `HttpClient` with a JWT interceptor
- **State**: `BehaviorSubject`-based services (no NgRx)
- **PWA**: `@angular/service-worker` + Web App Manifest
- **Mobile**: Capacitor 8 (`@capacitor/geolocation`) for native geolocation
- **Testing**: Karma + Jasmine
- **Language**: TypeScript ~5.5

## Environment & Build Configurations
- `environment.ts` / `environment.ngrok.ts` — controls `apiUrl` (relative `/api` vs ngrok URL)
- Angular build configurations: `development`, `production`, `ngrok`, `network`

## Common Commands

### API
```bash
cd api
npm start              # production (node server.js)
npm run dev            # dev with --watch (auto-restart)
npm run start:ngrok    # build UI (ngrok config) then serve everything on port 3000
```

### UI
```bash
cd ui
npm start                    # ng serve (localhost:4200 → proxies /api to :3000)
npm run start:network        # serve on 0.0.0.0 (LAN access)
npm run start:ngrok          # serve with ngrok environment config
npm run build                # production build → ui/dist/ui/browser
npm run build:ngrok          # ngrok build (served by API server)
npm test                     # Karma unit tests
```

### Full-stack via ngrok
```bash
cd api && npm run start:ngrok   # builds UI + starts API on :3000
ngrok http 3000                 # in a separate terminal
```

## Key Conventions
- All API IDs are UUIDs (v4)
- Dates stored as ISO 8601 strings in SQLite; parsed to `Date` objects via helper functions (`parseTruck`, `parseSchedule`, etc.) in `api/src/data/db.js`
- JSON arrays (e.g. `areas`, `photoUrls`) are stored as serialized strings in SQLite and must be `JSON.parse`d on read
- Schema migrations are done inline with try/catch `ALTER TABLE` statements in `db.js`
- JWT secret defaults to `'menro-secret-key'`; override via `JWT_SECRET` env var
- API runs on port `3000` (override via `PORT` env var)
- In production/ngrok mode, the API serves the Angular build as static files and handles client-side routing fallback
