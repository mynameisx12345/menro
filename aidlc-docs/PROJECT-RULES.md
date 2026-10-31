# PROJECT-RULES.md — MENRO EcoTrack

## 0. Document Control
| Field | Value |
|---|---|
| Project | MENRO EcoTrack |
| Owner | Architect (Teng) |
| Last updated | 2026-10-31 |
| Status | draft |

## 1. Environment & Tooling Detected (populated by `bootstrap-protocol.md`)
- **NIK version**: 3.8.0
- **Architecture/rules source**: `README.md` (root) — partial. No `ARCHITECTURE.md`, no `docs/`, no ADR directory, no `.claude/`, no `CLAUDE.md`/`AGENTS.md`/`conventions.md`/`DECISIONS.md` found.
- **Activation pointer**: added at `.aider/CONVENTIONS.md`, per team confirmation (2026-10-31).
- **PM/board tool**: none connected — Unit tracking lives in `aidlc-docs/` only.
- **Design system**: none found (no Angular Material, PrimeNG, Tailwind, or design-tokens file; hand-rolled SCSS).
- **CI/CD**: none found. Deploy is manual via `npm run start:ngrok` / `npm run start:cloudflare`.
- **Unit size signal**: 3 (default, unconfirmed by team)
- **Workspace**: brownfield, monorepo — `api/` (Node 18+, Express 5, better-sqlite3, ws, web-push) + `ui/` (Angular 18, TypeScript, Leaflet, Capacitor). Build: npm + Angular CLI.
- **Foundation**: opted in (Draft), 2026-10-31 — depth `standard`.
- **Server test script**: not opted in.

### 1a. Capability Register (Foundation, Draft)

Header: **Project shape**: web PWA (Angular 18) + REST API (Express 5) + SQLite + WebSocket + Web Push, three roles (admin, resident, collector) · **Stack**: Node 18+ / Express 5 / better-sqlite3 / ws / web-push (api); Angular 18 / TypeScript / Leaflet / Capacitor (ui) · **Depth**: standard · **Role map**: Architecture → `README.md`; Conventions → `.aider/CONVENTIONS.md`; Standing rules → none yet (Plan: create); Agent limits → `.aider/CONVENTIONS.md` (activation pointer only); Environments and deploy → `api/package.json` scripts + `ui/angular.json` configurations; Background jobs → none (N/A); Data and migrations → `api/src/data/db.js`; Integrations → `api/src/routes/geocode.js`, `api/src/routes/push.js`; Access and secrets → none yet (Plan: create); Testing → none yet (Plan: create); Team and seats → none yet (Plan: create).

#### CAP-01 Surface and stack
- **Answer**: Web PWA (Angular 18) + REST API (Express 5) + SQLite (`better-sqlite3`) + WebSocket (`ws`) + Web Push (`web-push`). Three roles: admin, resident, collector.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `ui/package.json`, `api/package.json`, `api/server.js`, `api/src/data/db.js`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "UI", "API", "role", "PWA"   **Refresh trigger**: a new app or datastore is added
- **Agent Setup role and home**: Architecture → `README.md`   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-02 Deployment, environments, rollback
- **Answer**: No pipeline. Manual: `npm run start:ngrok` (ngrok tunnel) or `npm run start:cloudflare` (Cloudflare Tunnel). Angular build configurations: `development`, `network` (LAN IP), `ngrok` (same-origin). No rollback procedure recorded.
- **State**: Detected (partial — rollback Unknown)
- **Flags**: —
- **Evidence**: Verified — `api/package.json` scripts, `ui/angular.json` configurations
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "deploy", "release", "environment", "ngrok", "cloudflare"   **Refresh trigger**: a pipeline or deploy script is added
- **Agent Setup role and home**: Environments and deploy → `api/package.json`, `ui/angular.json`   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / No rollback path recorded

#### CAP-03 Background and scheduled work
- **Answer**: None. No cron, no queue, no scheduler. WebSocket server runs in-process with Express.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/server.js` (no scheduler imports)
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "job", "cron", "scheduled", "queue"   **Refresh trigger**: a scheduler or queue is added
- **Agent Setup role and home**: Background jobs → none yet   **Plan**: N/A
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-04 Data, migrations, backups
- **Answer**: SQLite file `api/menro.db`. Schema created via `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... try/catch` migrations in `db.js`. **No backup procedure recorded.** `api/menro.db` is tracked in git (see CAP-06).
- **State**: Mixed (schema Detected, backup Unknown)
- **Flags**: —
- **Evidence**: Verified — `api/src/data/db.js`; backup: Not verified — no procedure found
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Resolve before Construction (for any Intent touching data)
- **Intent cues**: "migration", "schema", "backup", "data"   **Refresh trigger**: a migration or backup step is added
- **Agent Setup role and home**: Data and migrations → `api/src/data/db.js`   **Plan**: Exists (schema); Planned (backup)
- **Why / Who to ask / Known risks**: — / Architect / No backup; DB in git

#### CAP-05 External systems and shared test data
- **Answer**: Nominatim (OpenStreetMap geocoding), OSRM (routing), Web Push endpoints (FCM/APNs via browser). No shared test data across environments.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/src/routes/geocode.js`, `ui/src/app/utils/geocode.ts`, `api/src/routes/push.js`
- **Rules in force**: Nominatim usage policy (User-Agent required) — `api/src/routes/geocode.js`
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "geocode", "map", "push", "external"   **Refresh trigger**: a new external system is added
- **Agent Setup role and home**: Integrations → `api/src/routes/geocode.js`, `api/src/routes/push.js`   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / Nominatim rate limits

#### CAP-06 Access and credentials
- **Answer**: JWT (8h expiry), bcryptjs hashing. Roles: admin, resident, collector. Residents self-register → pending until admin approves. Disabled/deleted flags. **Three Exposed findings** (see Flags).
- **State**: Mixed (auth Detected; secrets Exposed)
- **Flags**: **Exposed** — (1) VAPID private key hardcoded in `api/src/routes/push.js:7`; (2) JWT secret fallback `'menro-secret-key'` in `api/src/middleware/auth.js:2`; (3) `api/menro.db` tracked in git (bcrypt hashes, PII, push subscriptions).
- **Evidence**: Verified — `api/src/routes/push.js:7`, `api/src/middleware/auth.js:2`, `api/menro.db` tracked
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: Architect (Teng) accepted the risk, 2026-10-31 — Exposed flags remain open   **Version/date**: 2026-10-31
- **If unsettled**: Resolve before Construction (for any Intent touching auth, push, or data)
- **Intent cues**: "auth", "login", "push", "secret", "credential", "database"   **Refresh trigger**: a secret is added or rotated; a new credential store is introduced
- **Agent Setup role and home**: Access and secrets → none yet (Plan: create)   **Plan**: Planned (rotate VAPID, move JWT secret to env, untrack `menro.db`)
- **Why / Who to ask / Known risks**: — / Architect / Anyone with repo read access can forge tokens, send push notifications, and read PII

#### CAP-07 Auth and roles
- **Answer**: JWT (8h expiry), bcryptjs hashing. Roles: admin, resident, collector. Residents self-register → pending until admin approves. Disabled/deleted flags.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/src/routes/auth.js`, `api/src/middleware/auth.js`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "auth", "role", "permission", "login"   **Refresh trigger**: a role or permission is added
- **Agent Setup role and home**: Access and secrets → none yet   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-08 API contract and consumers
- **Answer**: REST under `/api/*` (auth, trucks, schedules, complaints, segregation, waste-types, push, geocode, settings). WebSocket at `/ws/trucks`. Consumers: the Angular UI only.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/server.js`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "API", "endpoint", "contract", "WebSocket"   **Refresh trigger**: a new endpoint or consumer is added
- **Agent Setup role and home**: Architecture → `README.md`   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-09 ★ Testing approach
- **Answer**: **No tests.** No test runner in `api/package.json`. `ui/package.json` has `karma`/`jasmine` but no test files. No `/web-automation` or `/smoke-test` skill.
- **State**: Detected (gap)
- **Flags**: —
- **Evidence**: Verified — `api/package.json`, `ui/package.json`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Resolve before Construction (for any Intent)
- **Intent cues**: "test", "QA", "automation"   **Refresh trigger**: a test runner or automation skill is added
- **Agent Setup role and home**: Testing → none yet (Plan: create)   **Plan**: Planned
- **Why / Who to ask / Known risks**: — / Architect / No safety net for regressions

#### CAP-10 ★ Review and ship workflow
- **Answer**: Solo dev. No PRs, no review gate, no CI. Changes are pushed directly to `main` (or whatever branch is current). Ship = `npm run start:ngrok` / `start:cloudflare` on a dev machine.
- **State**: Decided
- **Flags**: —
- **Evidence**: Verified — Architect (Teng) confirmed 2026-10-31; no CI config, no PR template found
- **Rules in force**: Solo-dev direct-push to `main` — 2026-10-31
- **Exceptions**: none
- **Settled by**: Architect (Teng), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "review", "PR", "merge", "ship", "branch"   **Refresh trigger**: a second developer joins, or a CI pipeline is added
- **Agent Setup role and home**: Conventions → `.aider/CONVENTIONS.md`   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / No review gate; a bad push to `main` is live immediately

#### CAP-11 Failure visibility
- **Answer**: `console.log` / `console.error` only. No logging framework, no error tracker (Sentry etc.), no health endpoint.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/server.js`, `api/src/routes/*.js`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "logging", "monitoring", "error", "health"   **Refresh trigger**: a logger or error tracker is added
- **Agent Setup role and home**: none yet   **Plan**: Planned
- **Why / Who to ask / Known risks**: — / Architect / Failures are invisible unless someone is watching the console

#### CAP-12 ★ Team and seats
- **Answer**: Unknown — needs architect input.
- **State**: Unknown
- **Flags**: —
- **Evidence**: Not verified — no team/seats record found
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: — (needs architect input)   **Version/date**: 2026-10-31
- **If unsettled**: Resolve before Construction
- **Intent cues**: "team", "role", "seat", "QA", "Process Facilitator"   **Refresh trigger**: a seat changes
- **Agent Setup role and home**: Team and seats → none yet (Plan: create)   **Plan**: Planned
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-13 Destructive-action safety
- **Answer**: No guardrails. `DELETE` endpoints exist for trucks, schedules, waste-types, users (soft-delete via `deleted=1`). No confirmation at API level (UI has `ConfirmDialogService`).
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/src/routes/*.js`, `ui/src/app/shared/confirm-dialog/confirm-dialog.service.ts`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "delete", "drop", "destructive"   **Refresh trigger**: a new destructive endpoint is added
- **Agent Setup role and home**: none yet   **Plan**: Planned
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-14 ★ AI-agent permissions and environment separation
- **Answer**: No `.claude/` folder, no `AGENTS.md`, no agent limits recorded. Activation pointer added at `.aider/CONVENTIONS.md` (2026-10-31). Environment separation: `environment.ts` / `environment.network.ts` / `environment.ngrok.ts` — `environment.ngrok.ts` uses `window.location.host` (same-origin), so no real separation of secrets.
- **State**: Mixed (agent limits Unknown; env separation Detected)
- **Flags**: —
- **Evidence**: Verified — `ui/src/environments/*.ts`, `.aider/CONVENTIONS.md`; agent limits: Not verified — none found
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: — (needs architect input)   **Version/date**: 2026-10-31
- **If unsettled**: Resolve before Construction
- **Intent cues**: "agent", "AI", "environment", "secrets"   **Refresh trigger**: an agent-limits file is added
- **Agent Setup role and home**: Agent limits → `.aider/CONVENTIONS.md` (activation pointer only)   **Plan**: Planned
- **Why / Who to ask / Known risks**: — / Architect / —

#### CAP-15 Test data and accounts
- **Answer**: Demo accounts seeded in `db.js`: `admin@menro.gov` / `admin123`, `resident@menro.gov` / `resident123`, `collector@menro.gov` / `collector123`. Seeded trucks, schedules, complaints, segregation issues, waste types. Documented in `README.md`.
- **State**: Detected
- **Flags**: —
- **Evidence**: Verified — `api/src/data/db.js`, `README.md`
- **Rules in force**: none
- **Exceptions**: none
- **Settled by**: AI-proposed (evidence-based), 2026-10-31   **Version/date**: 2026-10-31
- **If unsettled**: Note
- **Intent cues**: "test data", "seed", "demo", "account"   **Refresh trigger**: a seed or demo account changes
- **Agent Setup role and home**: Testing → none yet   **Plan**: Exists
- **Why / Who to ask / Known risks**: — / Architect / Demo credentials are public in `README.md`; must be disabled before any real deployment

## 2. Known Standing Constraints (observed evidence only)
> **Demo credentials are public in `README.md`.** `admin@menro.gov` / `admin123`, `resident@menro.gov` / `resident123`, `collector@menro.gov` / `collector123` are documented in the repo's own README and seeded by `api/src/data/db.js`. Fine for a demo; must be disabled or rotated before any real deployment. Learned: 2026-10-31, during Bootstrap.

> **Three secrets are in version control.** VAPID private key (`api/src/routes/push.js:7`), JWT secret fallback (`api/src/middleware/auth.js:2`), and the SQLite database (`api/menro.db`). Anyone with repo read access can forge tokens, send push notifications, and read PII. Learned: 2026-10-31, during Bootstrap. Risk accepted by Architect (Teng) on 2026-10-31; Exposed flags remain open.

## 3. Architecture Decision Records (ADRs)
| ADR | Decision | Status | Link |
|---|---|---|---|
| — | none yet | — | — |

## 4. Data Classification
| Classification | Handling rule |
|---|---|
| Public | No special handling |
| Internal | Access restricted to authenticated staff |
| Confidential | Access restricted to named roles |
| Restricted/PII | Encrypted at rest/transit; masked in non-prod; never pasted into AI prompts unmasked |

## 5. Non-negotiable Constraints
- None recorded yet.

## 6. Coding Conventions Pointer
- `.aider/CONVENTIONS.md` — activation pointer + project conventions.

## 7. Open Conflicts / Known Gaps
- CAP-06: three Exposed findings open (VAPID, JWT secret, `menro.db` in git).
- CAP-09: no tests.
- CAP-12: team and seats unknown.
- CAP-14: agent limits unknown.
