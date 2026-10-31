# NIK State

## Project Information
- Project Type: Brownfield
- Bootstrap completed: 2026-10-31T00:00:00Z

## Environment & Tooling Detected
- **NIK version**: 3.8.0
- **Architecture/rules source**: `README.md` (root) — partial. No `ARCHITECTURE.md`, no `docs/`, no ADR directory, no `.claude/`, no `CLAUDE.md`/`AGENTS.md`/`conventions.md`/`DECISIONS.md` found.
- **Activation pointer**: added at `.aider/CONVENTIONS.md`, per team confirmation (2026-10-31).
- **PM/board tool**: none connected — Unit tracking lives in `aidlc-docs/` only.
- **Design system**: none found (no Angular Material, PrimeNG, Tailwind, or design-tokens file; hand-rolled SCSS).
- **CI/CD**: none found (no `.github/workflows/`, no `.gitlab-ci.yml`, no `Jenkinsfile`). Deploy is manual via `npm run start:ngrok` / `npm run start:cloudflare`.
- **Unit size signal**: 3 (default, unconfirmed by team)
- **Workspace**: brownfield, monorepo — `api/` (Node 18+, Express 5, better-sqlite3, ws, web-push) + `ui/` (Angular 18, TypeScript, Leaflet, Capacitor). Build: npm + Angular CLI.
- **Foundation**: opted in (Draft), 2026-10-31 — depth `standard`; §1a Capability Register holds the detail. Status: **complete** (2026-10-31). Gate 0 cleared 2026-10-31.
- **Server test script**: not opted in.

## Intent Queue
N/A, single-Intent mode

## Intents in Flight
None yet. Stage 0 (Bootstrap) and Foundation complete; Gate 0 cleared 2026-10-31. Ready for Stage 1 (Pre-Elaboration) once a real Intent is given.

## Extension Configuration
[Reserved — none defined.]
