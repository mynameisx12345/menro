# Unit Separation Protocol

## Purpose
Governs how confirmed requirements (post-Definition-of-Ready) get cut into Units at the
Inception → Construction boundary. Replaces a naive "1 user story = 1 Unit" mapping —
that's a starting assumption, not a rule — with criteria that actually predict whether a
Unit will be 1-shot-constructable, plus one configurable signal instead of a hardcoded
number.

## The real criteria (in priority order)

### 1. Independent testability — the actual constraint
A Unit's whole reason for existing is that it can pass its own `unit-template.md`
Section 9 sequence (unit tests → integration → manual-in-app → automation) **on its
own**, without another Unit landing first. If a story can't be verified end-to-end
without a second story shipping first, that's not two Units — it's one Unit with an
internal dependency, or a sequencing problem to flag explicitly (see item 3).

### 2. Vertical, never horizontal
Split by independently-shippable behavior, never by architectural layer. "Backend half"
and "frontend half" as two Units is the wrong cut — it doesn't reduce risk, it just
relocates the integration risk from Construction (where Section 9c would catch it) into
the handoff between two Units (where nothing catches it until both exist).

### 3. Dependency chains are a split point, not a merge argument
If B genuinely can't start until A's schema/API lands, that's two Units in sequence
(`unit.md` Section 0's "Depends on" field), not a reason to combine them into one. Don't
merge just to avoid managing a dependency — name the dependency instead.

**Direction only ever points backward**: a Unit's "Depends on" field may only name a Unit
sequenced *before* it in the build order. A dependency pointing to a later Unit isn't a
dependency — it means either the sequence is wrong or the split itself is wrong. Stage
3's traceability check verifies this in both directions before ticketing, the same way
it already checks for circular dependencies (which this isn't — a forward reference is
still a straight line, not a loop, and just as unbuildable standalone).

### 4. Merging trivial, tightly-coupled stories is also legitimate
The reverse cut matters too: several stories that are each too small to be their own
Unit, and that always change together in practice, should combine into one Unit rather
than being split for the sake of matching story boundaries 1:1.

### 5. Repeated file overlap is a smell, not a verdict
If three or more Units all modify the same file with no real reason for the split
between them (a genuine feedback-loop — each needs to see how the previous one landed
before proceeding — a risk-mitigation reason, or a context-size limit), that's a signal
the split may be creating avoidable integration risk rather than reducing it. Route it as
one question to Architect/Dev, same posture as the size signal below — never an
auto-merge, just *"should these actually be one Unit, or is the overlap justified?"*

## The size signal (configured, not hardcoded)
Duration is real, but it's a **signal about 1-shot feasibility, not an effort estimate**
— a Unit that's genuinely going to run long is also the kind of Unit Elaboration was
least likely to have actually de-risked completely. That's what the signal is actually
for; it is not capacity planning.

- The threshold is a **per-project configured value**, read from `PROJECT-RULES.md`
  (set during Bootstrap or updated later by the Process Facilitator). Default to 3 days
  only if the project hasn't set one — never hardcode a number into this file itself,
  since `.nik/` is meant to run the same way across projects with different
  velocities.
- Crossing the threshold **never auto-splits anything**. It triggers exactly one
  question, routed to **Architect/Dev** (they're the ones who'd know if it actually
  decomposes): *"This Unit's estimate exceeds the configured size signal — is this
  genuinely one cohesive, independently-testable slice that's just large, or does it
  decompose further?"*
- If the answer is "genuinely large, one slice" — proceed as one Unit, note the size
  explicitly in `unit.md`, and treat that Unit as higher escalation-risk during
  Construction (Section 10 gets used more here, by design — that's the honest
  consequence of a Unit that's structurally hard to fully de-risk up front, not a
  process failure).
- If it decomposes — apply criteria 1-4 above to find the actual cut, don't just chop it
  in half by size.

## Where this runs
At the end of Mob Elaboration, after Definition of Ready — feeds `unit-breakdown.md`
(the generated per-Intent index, in `aidlc-docs/intents/<intent-slug>/inception/`, not
this file). This file is the rule; that one is the result. Every Unit ID this produces
is the full `<intent-slug>/UNIT-n` form, per `multi-intent-parallel-work.md` — never a
bare `UNIT-n`, even when only one Intent is in flight.
