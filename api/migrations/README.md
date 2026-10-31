# Migrations

Versioned SQL migrations for the MENRO EcoTrack SQLite database.

## How it works

- Each `.sql` file in this folder is one migration, applied in filename order.
- Applied migrations are recorded in the `schema_migrations` table.
- Re-running is safe — already-applied files are skipped.
- Before applying anything, the runner copies `menro.db` to `menro.db.bak-<timestamp>`.

## Client-side workflow (one command)

```bash
cd api && git pull && npm install && npm run migrate && npm start
```

Or just `npm start` — migrations run automatically on server startup.

## Check what's pending (no changes)

```bash
cd api && npm run migrate:status
```

## Adding a new migration

1. Create `api/migrations/0NN_short_description.sql` (next number, zero-padded).
2. Write plain SQL (one or more statements).
3. Commit it with the code change that needs it.
4. On the client: `git pull && npm run migrate` (or just restart the server).

## Notes

- SQLite supports transactional DDL for `ALTER TABLE ADD COLUMN`, so a failed migration rolls back cleanly.
- Never edit an already-applied migration file — add a new one instead.
- The backup file (`menro.db.bak-*`) is safe to delete once you've confirmed the migration worked.
