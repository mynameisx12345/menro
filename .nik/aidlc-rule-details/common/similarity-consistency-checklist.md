# Similarity & Consistency Checklist

Run this during grounding (`elaboration-protocol.md` Step 1), before any question gets
written. Every "unclear" or "no" answer below becomes a tagged question in
`elaboration-questions.md` — routed to the seat who'd actually know, not a generic dump
addressed to "the team."

## 1. Does this already exist? (the AI checks — this is never a question to the team)
Search is the AI's job, not something to ask about. Never open with "does this already
exist?" — go find out, then bring the team a result, not a blank question.

- **Found a match** → don't ask whether it exists, tell the team what was found (cite
  the file/feature) and ask the actual decision: **should this Intent follow the same
  behavior/approach?**
  - **Ask BA/PO** if the open question is whether that's the *right behavior* for this
    Intent too.
  - **Ask Architect/Dev** if the open question is whether that's the *right
    implementation* to build the new work from.
- **Found nothing** → don't silently conclude nothing exists and move on. Searches miss
  things — a legacy flow, an external system, undocumented behavior, something outside
  what was actually searched. **Ask the team**: is there something already handling this
  that the AI isn't aware of? Only once that comes back clean does this proceed to item 5.

## 2. More than one version, and they disagree?
If #1 turned up more than one place doing something like this, and they don't do it the
same way — someone has to pick. Not the AI, silently. And don't just hand over the fork —
**state the actual trade-off you found** between the versions (simpler-but-slower,
correct-but-touches-more-files, legacy-vs-newer, whichever it actually is). "Pick A or B"
with no reasoning wastes the one thing worth automating here.
- **Ask BA/PO** which behavior is the intended one, with the trade-off stated.
- **Ask Architect/Dev** which implementation is actually sound to build from, with the
  trade-off stated — this and the BA/PO question are different concerns; don't collapse
  them into one ask **unless the same person holds both seats**, in which case ask once,
  combined, rather than asking the same person the same thing twice in two framings.
- If the real answer turns out to be "neither, this is meant to be different" — get that
  said out loud, don't infer it from silence.

## 3. Is the existing one actually still good?
Don't copy a pattern just because it's there. Check the project's standing decisions
(whichever file fills that role, plus ADRs) and any open ticket against it first — an
existing pattern isn't automatically the right one.
- Already flagged as tech debt / known-wrong → **ask Architect/Dev** before following it
  anyway.
- **Confirm it's actually alive, not just present.** A grep match isn't proof of an
  active pattern — trace whether the code is actually called/routed/reachable before
  citing it as precedent. This project has a real, verified case of exactly this
  failure: `post_eztech_log` looked like a live Celery producer to a naive search, but
  was unrouted dead code by the time anyone checked. Citing dead code as "the
  established approach" is worse than finding nothing, because it's confident and wrong.
  If reachability is unclear, **ask Architect/Dev** rather than assume.
- Clean, alive, no flags → proceed, cite it.

## 4. Full match, or only partial?
If the existing thing covers most but not all of what this Intent needs — that's a
decision, not a default. Extend the existing thing, or build something separate next to
it?
- **Ask BA/PO**: is the partial behavior acceptable as-is, or does it need to go further?
- **Ask Architect/Dev**: is extending the existing thing safe, or does it strain what it
  was actually built for?

## 5. Nothing like this exists — new standard, or a one-off?
Don't decide this on vibes ("feels reusable"). The actual test: **if two Units built
this independently, one level down, could they choose incompatibly — and is that choice
both non-obvious and a real trade-off?** All three have to be true for an ADR to be
worth writing now:
- **Divergence-possible** — nothing already constrains the choice, so two independent
  builds really could land differently.
- **Non-obvious** — there isn't one clearly-correct answer everyone would land on anyway.
- **Real trade-off** — the options actually cost something different, not a distinction
  without a difference.
- All three true → **ask Architect/Dev** to write the ADR now, before three more Units
  quietly repeat the same shape differently.
- Any one false → genuinely a one-off (or a non-decision) — note it and move on, no
  ceremony needed.
- **If this genuinely needs a new module/component** (not just a new file inside an
  existing one): where it goes and what it's named is also a decision, not a default —
  follow the project's own existing module layout convention (e.g. this project's
  `dashboard/modules/<feature>/` / `api/modules/<feature>/` pattern) rather than placing
  it wherever seems convenient. If the existing convention doesn't obviously cover this
  case, **ask Architect/Dev** rather than pick a spot.

## 6. Does QA already have a stake in what's being touched?
If existing test coverage (unit, integration, or the web-automation smoke/regression
suite) already exercises what this Intent changes, that's a live constraint on the
approach, not a footnote for later.
- **Ask QA**: does this break, or require updating, anything already under coverage?

## 7. Does this touch another system (a third-party/vendor integration)?
"Works in dev/uat" is not proof it'll work in production for an external integration —
vendor contracts can draw a hard, non-negotiable line at what a production credential is
allowed to do, one that no amount of internal fixing resolves after the fact (see worked
example below). If the Intent touches any external system:

1. **Check first, per item 1 of this checklist**: has this *exact* integration (same
   external system, same kind of operation — a read vs. a write to it are not the same
   claim) already been proven working **against production's real constraints**, not
   just dev/uat's? If yes, cite that proof and skip straight to building — no new POC
   needed.
2. **If no equivalent proof exists**, this is a decision for PO/Architect, not a default:
   **ask** — is a POC needed before full development, or does the team have enough
   confidence to proceed without one? Don't silently assume either answer.
3. **If a POC is chosen**: it must validate against the *actual production* credential/
   permission/contract scope for that vendor — not just dev/uat's (often more
   permissive) environment. A POC that only proves dev/uat works answers a different,
   easier question than the one that matters.
4. **If proceeding without a POC**: that's also an explicit, recorded decision — not
   something that happens by default because nobody raised it.

## 8. Does this Intent conflict with a standing rule? (Foundation projects only — Draft)
> Maturity: Draft (since 3.5.0). N/A for a project whose `PROJECT-RULES.md` §1 has no
> Foundation opt-in; items 2 and 3 above still apply to it as before.

The AI checks the Intent against the rules in the Capability Register and in the files the
role map names (standing rules, agent limits, conventions). If the Intent would break one:
- Raise a **conflict item** to the **Architect** — not a general question to the team.
- The Architect picks one of four outcomes (rule stands and the Intent adapts / one-off
  exception, not recorded / recorded exception / the Intent changes the rule), per
  `intake/foundation-reconcile.md`, "Setup conflicts".
- Settle it before Gate 1. If it is still open at Gate 1 it is recorded and shown there,
  and the signer acknowledges it; it does not stop the gate while Foundation is Draft
  (`common/maturity-flags.md`, "At a gate").

Name the rule by what it is and where the role map says it lives — never assume a
particular file name.

## Worked examples (real, from hr-iris-core)

**Same-category disagreement (item 2)**: `celery-io` was scoped for face-recognition
work only, but the change-shift EzTech sync and its email notification were routed onto
it anyway — while the equivalent EzTech job, `daily_eztech_sync_check`, was a plain cron
command, not Celery at all. Two implementations of the same category of thing,
disagreeing, with nobody ever asked which one was right. One worked case, not a scope
limit — applies to any implementation choice (pagination, error handling, auth checks),
not only queueing/scheduling.

**Vendor-contract constraint (item 7)**: dev/uat's EzTech (Odoo) integration used an
admin-level account, so writes to `hr.employee` worked fine there. Production's
credential didn't have that permission — and when the team asked EzTech support to
grant it, support confirmed that's outside the contract and won't be expanded. The
feature had already been built and deployed by the time this surfaced. A POC validated
only against dev/uat would never have caught this — it needed to be checked against
production's actual, contractually-fixed access scope before development started, not
discovered at deployment.
