# 1-Shot Feedback

Captures the exact moment this framework is supposed to prevent: a Unit already marked
Done, delivered, and someone comes back needing a change anyway. `end-to-end-checklist.md`
already names this as the actual success measure — this file is what was missing:
somewhere to capture it *when it fails*, and turn that into either a real framework fix
or real coaching feedback, instead of a one-off annoyance nobody tracks.

## Trigger
Any correction, clarification, or rework request on a Unit that already passed its exit
gate (Section 14/15) — regardless of how small the ask seems. A "quick tweak" is still a
1-shot failure; don't let the size of the fix decide whether this gets logged.

## Process

1. **Capture the actual ask, verbatim.** Not a paraphrase — what was literally requested,
   by whom, and when. A vague "make it better" retold later loses exactly the detail
   needed to trace root cause.
2. **Trace it.** Walk backward: which Section/mechanism *should* have caught this, if
   any?
   - A gap-checklist category (Elaboration) that was marked Answered but the answer was
     actually wrong or incomplete?
   - A Section 9 test that should have caught this but didn't (a real verification-gap,
     not just "we didn't think of it")?
   - An escalation trigger (Section 10) that should have fired but didn't?
   - Nothing — genuinely nothing in the framework as it stands would have surfaced this?
3. **Classify root cause** — three possible verdicts, never forced into a binary:
   - **NIK gap** — no existing rule would have caught this even if followed perfectly.
     A real framework fix is needed. Propose the specific file and section to change,
     with the same rigor as any other rule-file edit — **never applied silently**; this
     gets presented and confirmed like every other change to `.nik/`.
   - **Player gap** — an existing rule *would* have caught this if actually followed
     (9c wasn't really run live, an escalation was ignored, grounding was skipped, the
     packet was rushed). This is **not** a framework change. Log it as individual/team
     coaching feedback, kept separate — piling more ceremony onto NIK to compensate for
     a step someone skipped doesn't fix the actual problem, and it punishes everyone else
     who was already following the rule correctly.
   - **Both** — a rule existed but was genuinely easy to miss or ambiguously worded, *and*
     someone also didn't follow it carefully. Log both threads — the rule gets sharpened
     for clarity, and the individual coaching still happens. Don't let "the rule could
     have been clearer" become an excuse that erases the miss, and don't let "someone
     missed it" become an excuse to skip clarifying a genuinely ambiguous rule.
4. **If Player gap recurs across more than one person** on the same rule — that's itself
   worth a second look. A rule several different people independently miss is trending
   toward a NIK gap (a discoverability/clarity problem), not a string of unrelated
   individual mistakes. Don't keep filing it as coaching feedback indefinitely without
   ever asking whether the rule itself is the actual problem.

## Output — logged to `aidlc-docs/1-shot-feedback-log.md`
Global, append-only, cross-Intent — the whole point is spotting a pattern across many
Units, not just diagnosing one incident in isolation.

```markdown
## [ISO timestamp] — Unit <intent-slug>/UNIT-n
**What was asked (verbatim)**: [the actual correction request]
**Traced to**: [which Section/mechanism should have caught this, or "nothing — genuine
gap"]
**Verdict**: NIK gap / Player gap / Both
**If NIK gap**: [specific file + section proposed for change, and current status —
proposed / confirmed / applied]
**If Player gap**: [logged as coaching feedback for <role/person>, not a framework
change]
**If recurring** (same rule, multiple people): [flag here — this is the signal to
re-examine whether it's actually a NIK gap]
```

## Relationship to other mechanisms
- **Mid-Workflow Changes** (`steering/core-workflow.md`) still governs *how the actual
  fix gets executed* (Minor/Moderate/Major, who needs to be involved) — this file only
  governs *diagnosing why the fix was needed in the first place*. Both run: diagnose
  here first, then classify and execute the fix through Mid-Workflow Changes.
- **Bolt Retro** (`operations/bolt-retro.md`) Phase 2 already asks "was it a gap in these
  rule files, or a one-off mistake" — this log is that question's actual evidence
  source. Bolt Retro's Gather phase should read `1-shot-feedback-log.md` directly, not
  reconstruct the same analysis from scratch each retro.
