# Shared Architecture Docs — living, cumulative, not per-Unit

Governs `aidlc-docs/shared/domain-model.md`, `logical-design.md`, and
`infrastructure-design.md` — the cross-cutting home for domain/API/infra knowledge that
would otherwise die with each Unit's own packet. **Genuinely global, not Intent-scoped**:
unlike `deferred-work.md`/`gate-approval-construction.md` (which reset per Intent, in
`aidlc-docs/intents/<slug>/construction/shared/`), these three live at the project root
and accumulate across every Intent — see `common/multi-intent-parallel-work.md` for why
the two "shared" folders are deliberately different scopes. **Not a new design
ceremony**: no upfront authoring pass before Units are built, no new approval gate. They
grow incrementally, as a normal part of a Unit's own Closing Actions (`unit-template.md`
Section 13) — the same "artifact hygiene is part of the task" discipline this framework
already applies everywhere else.

## Why this exists
Section 7a already says to "reference `domain-model.md`... rather than re-describing the
whole domain here" — but nothing ever created that file. A Unit that establishes a new
domain entity, a new cross-cutting API shape, or a new infra pattern currently records it
only in its own Section 4/5/7, where the *next* Unit that needs the same thing has no way
to find it except re-reading old Units' packets one by one. These three files are that
missing index — not a duplicate of per-Unit content, the persistent memory of it.

## The three files

**`domain-model.md`** — entities, relationships, and which module/app owns each one.
"Bounded contexts" is the master doc's original DDD phrasing — most brownfield projects
this framework runs on (hr-iris-core included) are a monolith that doesn't practice DDD,
so don't force that vocabulary if it doesn't fit; ownership boundaries between existing
apps/modules is the same underlying idea in plain terms. Updated when a Unit introduces a
new entity/relationship, or changes an existing one's ownership. Most Units touch nothing
new here — that's expected, not a gap.

**`logical-design.md`** — cross-cutting API shape, module/app boundaries, storage
patterns, state machines. "Service boundaries" is the master doc's microservices-era
phrasing — on a single-deployment monolith (one Django project, multiple apps, e.g.
`dashboard`/`api`), the same idea is which app/module owns a given concern. Not a
restatement of every Unit's own Section 5 — only the *enduring* shape: a new class of
external endpoint, a new module boundary, a new storage pattern or state machine other
Units will need to match later.

**`infrastructure-design.md`** — deployment topology, scaling, environment config,
cross-cutting. This is the natural destination for Section 7c's existing STOP-and-ask
outcome ("genuinely new infrastructure... Section 10 STOP-and-ask to Architect/Dev before
Construction starts") — once that question is answered, the answer gets recorded here,
not just inside the one Unit that asked it.

## When a Unit updates one of these
Part of Section 13's Closing Actions, not a separate step: if this Unit introduced or
changed a domain entity, a cross-cutting API shape, or an infra pattern, update the
relevant file before the Unit is considered closed. If it didn't touch any of these
(the common case), say so explicitly — "No shared architecture doc updates needed" — same
N/A-over-silence discipline as everywhere else in this framework.

## Grounding reads these first
`elaboration-protocol.md` Step 1 and `similarity-consistency-checklist.md` items 1/3/5
("does this already exist," "is it still good," "new standard or one-off") should check
these three files before a blind codebase grep — they're the canonical index of
established domain/API/infra decisions now, not just one more place to search.

## What this is not
- Not `code-gen-plan.md` — that's `unit.md` Sections 1-8 under a different name; no
  separate file needed, this project's Unit packet already serves that role.
- Not `api-spec.yaml` — only generated if this project's own tooling already produces an
  OpenAPI spec (e.g. `drf-spectacular`). If it doesn't, Section 5's prose stays the
  authoritative contract description; this is never manually hand-authored just to match
  a filename.
