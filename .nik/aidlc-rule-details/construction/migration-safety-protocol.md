# Migration Safety Protocol — data-dependent backfills

## Why this exists
A real incident (hr-iris-core, `leave-approval/UNIT-1`, migration
`0126_leave_requests_iris_decision_fields.py`, Jira HRIS-1588) blocked every PR merge to
`dev` for three days. Two separate gaps stacked:

1. The Unit's own `unit.md` §7a documented a backfill mapping (Odoo's raw workflow codes)
   that was never checked against the real target table — `Leave_Requests.state` actually
   stored already-translated display strings. The migration's own `RunPython` step raised
   exactly as designed (a deliberate "STOP-and-ask, don't guess" check) — but the first
   time it ran was in CI, after merge, blocking the whole team instead of one Unit Runner
   five minutes before opening the PR.
2. That raise then turned into a stuck deploy, not just a failed one: the migration's
   `AddField` operations ran *before* the `RunPython` step in the same migration, and on
   MySQL `ALTER TABLE` auto-commits regardless of the enclosing migration's "atomic"
   wrapper. So the schema change landed permanently while Django's own migration-history
   bookkeeping rolled back — every subsequent deploy (including the one with the
   corrected mapping) failed again, now on `Duplicate column name`, until someone
   manually reconciled the live database's actual schema against `django_migrations` by
   hand.

Both gaps are closed here, as Construction-time checks — not a new ceremony, two
additions to checks that already exist (Section 4 / Section 11's Definition of Done).

## Trigger
This protocol applies to any Unit whose migration includes a `RunPython` (or equivalent
data-migration) step that:
- Reads/validates existing data before writing (a backfill, a one-time data correction,
  anything keyed off a column's *current* real values), **and**
- Can legitimately raise/abort on data it doesn't recognize (a "STOP-and-ask" business
  rule, not a bug to be silently defaulted past).

If a Unit's migration is purely additive schema with no data-dependent step (a plain
`AddField` with a static default, say), neither rule below applies — this protocol is
about the specific combination of "validates real data" + "can fail."

## Rule 1 — Verify the mapping against real data before merge, not after
Before this Unit is considered Construction-complete, run the migration's own read-only
validation query directly against each database the migration will run against — not a local
seed, not just what the model's docstring or `unit.md`'s own domain-rules section (§7a)
claims the data looks like. For a state-mapping backfill, that's literally the same
`SELECT DISTINCT <column> ...` the migration's own unmapped-value check will run — just
moved earlier, so a wrong assumption is caught in Construction, not discovered live in CI
after merge.

This is a Section 4 / Section 11 Definition-of-Done addition on `unit-template.md`: a
migration with a data-dependent `RunPython` step isn't "Migration verified field-by-field
against Section 4" until its real-data assumption has been checked against each
database the migration will run against, with the query and result recorded in Section 12.

## Rule 2 — On a non-transactional-DDL database, split schema from risky data validation
If the project's database doesn't run DDL transactionally (MySQL is the confirmed case;
check before assuming Postgres needs this too — its DDL *is* transactional), never bundle
`AddField`/schema operations in the same migration file as a `RunPython` step that can
legitimately raise on bad data. Put the schema-only operations in one migration; put the
data-validation/backfill `RunPython` in a separate, subsequent migration.

Reasoning: if the two are bundled and the data step raises, the schema change has
already auto-committed and stays — but Django's migration-history record for the whole
migration rolls back, since that bookkeeping write is inside the same transaction that
failed. The result is a desync where the live schema is ahead of what migration history
says, and every later deploy attempt fails trying to re-add a column that already exists
— requiring manual reconciliation (dropping the orphaned columns/constraints by hand)
before the corrected migration can even run. Splitting the migration means a failed
data-validation retry never needs any manual schema surgery: fix the mapping, re-run the
second migration alone, done.

## Where this gets checked
- **Section 4 (Data / Model Impact)**: if this Unit's migration has a data-dependent
  `RunPython`, Section 4 flags it; record which real-data query was run against each
  database the migration will run against and what it found, plus (MySQL-backed
  projects) confirmation the schema and data operations are in separate migration
  files, in the Unit's `construction/UNIT-n/dev-output-check.md` — `unit.md` stays
  read-only once Construction starts.
- **Section 11 (Definition of Done)**: "Migration (if any) verified field-by-field
  against Section 4" now explicitly includes this check — not satisfied by reading the
  model/docstring alone.
- **Section 10 (Escalation Rule)**: if the real-data check in Rule 1 finds values the
  Unit's own `unit.md` §7a mapping doesn't account for, that's the STOP-and-ask firing
  exactly as intended — log it in `questions-log.md` and resolve before merge, the same
  as any other genuine blocker.
