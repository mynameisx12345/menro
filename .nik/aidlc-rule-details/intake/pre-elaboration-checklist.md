# Pre-Elaboration Readiness Checklist

## Purpose
Everything on this list is gathered by the team **before** Mob Elaboration is convened —
not during it. The live session should spend its time on requirement gathering (the
dynamic question flow in `inception/elaboration-protocol.md`), not on hunting for a repo
link or figuring out who the QA seat is. This is the human-prepared counterpart to
`bootstrap-protocol.md` (which is the framework's own *automated* detection) — this
checklist is what makes sure bootstrap has real things to find, and covers the parts
that can't be auto-detected at all (who's attending, the raw Intent itself, priority).

**Rule**: if an item below is genuinely not applicable, mark it N/A explicitly — don't
leave it blank. A blank item is indistinguishable from "forgot to check."

---

## 1. The Intent itself (required, no substitute)
- [ ] Raw Intent statement — the actual business need, in the requester's own words
- [ ] Priority/urgency (and why — hard deadline, regulatory, customer-facing incident?)
- [ ] Target release or timeframe, if known
- [ ] Any related/dependent tickets, Intents, or Units already in flight

## 2. Project / repo context
- [ ] Repo URL or path, and the branch this work will be based on
- [ ] Confirmed access for everyone who needs to read/write it
- [ ] Is this a new project (greenfield) or does it live in an existing repo (brownfield)?
- [ ] If monorepo: which package/app within it

## 3. Architecture & existing rules
- [ ] Link to architecture docs (README/ARCHITECTURE.md/docs folder), if they exist
- [ ] Link to existing conventions/rules files (whichever files fill the project's
      architecture, conventions, standing-rules and agent-limits roles), or a
      consolidated PROJECT-RULES.md if one exists
- [ ] `foundation-reconcile.md` run for this Intent — include this line only if
      `PROJECT-RULES.md` §1 records the Foundation opt-in (Draft); otherwise leave it out
- [ ] Any existing ADRs relevant to the area this Intent touches
- [ ] If none of the above exist: say so explicitly — this means grounding will lean
      harder on Reverse Engineering and the live session's own code search

## 4. Existing code / system state (brownfield only)
- [ ] Which existing module(s)/area(s) does this Intent plausibly touch
- [ ] Any existing similar feature elsewhere in the app worth pattern-matching against
      (link the file/screen)
- [ ] Known technical debt or fragile areas near what's being touched, if anyone
      already knows of one

## 5. PM / board tooling
- [ ] Which tool tracks this work (Jira/Linear/GitHub Projects/other) and project/board
- [ ] Ticket ID, or confirmation one will be created from this Intent
- [ ] Epic/parent, labels, or components this falls under, if the tool uses them

## 6. Design / UX (skip entirely if this Intent has no UI surface — say so explicitly)
- [ ] Design system / component library reference (link)
- [ ] Screenshots, wireframes, or a design-tool link, if any exist yet
- [ ] Brand/style guide reference, if this introduces anything visually new

## 7. People — who's actually in the room
- [ ] PO/BA seat — name
- [ ] UX seat — name, or "not needed, no UI surface"
- [ ] Architect/Engineer seat — name
- [ ] QA seat — name
- [ ] Process Facilitator — name
- [ ] Domain specialist(s), if this Intent needs one — name(s), or "none needed"

## 8. Data & compliance
- [ ] Data classification tier this Intent is expected to touch (public/internal/
      confidential/PII), if known up front
- [ ] Any regulatory or contractual constraint already known (data residency,
      retention, client-specific handling rules)

## 9. Environment / infrastructure
- [ ] Target environment(s) this will eventually run in (existing dev/uat/prod-
      equivalent, or new infrastructure needed)
- [ ] Any new external/third-party integration this is expected to need
- [ ] Any infra dependency already known to be missing (new service, new credential,
      new provisioned resource)

## 10. Prior art
- [ ] Any prior discussion, doc, meeting note, or decision already made that's relevant
- [ ] Any spike, prototype, or research already done for this Intent

---

## Gate — ready to convene the mob
Mob Elaboration should not be scheduled/started until every section above is either
filled in or explicitly marked N/A. An incomplete checklist isn't a hard blocker on its
own (some gaps are exactly what the live session should surface) — but every gap that
*was* knowable in advance and wasn't filled in is time the live session will burn on
logistics instead of requirements. Facilitator's call on whether a specific gap is worth
delaying the session for.
