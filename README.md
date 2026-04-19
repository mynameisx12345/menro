# MENRO EcoTrack

Waste management system with real-time GPS tracking, scheduling, complaint management, and segregation reporting.

## Stack
- **API**: Node.js + Express + WebSocket (ws)
- **UI**: Angular 18 + Leaflet (OpenStreetMap)

## Quick Start

### 1. Start the API
```bash
cd api
npm install
npm start
# Runs on http://localhost:3000
```

### 2. Start the Angular UI
```bash
cd ui
npm install
npx ng serve
# Runs on http://localhost:4200
```

## Running via ngrok (single tunnel for UI + API)

Use this when testing on external devices or when geolocation is required (browsers block geolocation on non-HTTPS non-localhost origins).

### 1. Install ngrok
```bash
npm install -g ngrok
# or download from https://ngrok.com/download
```

### 2. Install UI dependencies (first time only)
```bash
cd ui && npm install
```

### 3. Build UI + start the server
```bash
cd api
npm run start:ngrok
# Builds Angular with ngrok config, then serves everything on port 3000
```

### 4. In a new terminal, start the tunnel
```bash
ngrok http 3000
```

### 5. Open the app
Visit the `https://xxxx.ngrok-free.app` URL shown in the ngrok output — on any device.

> **Note:** Free ngrok generates a new URL on every restart. No config changes are needed since the app uses relative URLs.

## Demo Accounts

| Role      | Email                    | Password      |
|-----------|--------------------------|---------------|
| Admin     | admin@menro.gov          | admin123      |
| Resident  | resident@menro.gov       | resident123   |
| Collector | collector@menro.gov      | collector123  |

## Features by Role

### Admin Dashboard
- 🗺️ **Live Map** — Real-time truck positions via WebSocket (updates every 5s per FR-1)
- 📅 **Schedules** — Create/update/delete collection schedules with waste type assignment (FR-2)
- 📋 **Complaints** — Review and resolve resident complaints (UC-2)
- ⚠️ **Segregation Issues** — View photo-verified segregation reports (UC-1)

### Resident Portal
- 🗺️ **Track** — Live map with 1km proximity circle; alert banner when truck is nearby (FR-4)
- 📅 **Schedule** — View today's collection schedule
- 📋 **Report** — File missed collection / delay complaints with route tagging (FR-5, UC-2)

### Collector App
- 🗺️ **Map** — View own truck position, send live location updates
- 📝 **Log Issue** — Report segregation violations with live camera capture (FR-3, UC-1)
- ✅ **Collection** — 3-step quick collection log (≤3 clicks per usability requirement)

## API Endpoints

| Method | Path                        | Auth         | Description              |
|--------|-----------------------------|--------------|--------------------------|
| POST   | /api/auth/login             | Public       | Login                    |
| GET    | /api/trucks                 | All roles    | List trucks              |
| PUT    | /api/trucks/:id/location    | Collector    | Update truck GPS         |
| GET    | /api/schedules              | All roles    | List schedules           |
| POST   | /api/schedules              | Admin        | Create schedule          |
| GET    | /api/complaints             | Admin        | List complaints          |
| POST   | /api/complaints             | Resident     | File complaint           |
| GET    | /api/segregation            | Admin/Collector | List segregation issues |
| POST   | /api/segregation            | Collector    | Log segregation issue    |

## WebSocket
Connect to `ws://localhost:3000/ws/trucks` for real-time truck location updates.
