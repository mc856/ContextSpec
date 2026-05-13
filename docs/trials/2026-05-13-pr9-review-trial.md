# Trial — PR #9 review with and without pack (2026-05-13)

End-to-end review trial for v0.1 validation plan §Phase 1. Stated falsifiable
criteria, then executed.

## Inputs (frozen)

- Subject PR: `5fed5fd` (PR #9 — dogfood: check in this repo's own `.contextspec/`).
  Diff saved at `docs/trials/.work/pr9-diff.patch` (1098 lines, 28 files).
- Pack — engineer-review for `finish-line`:
  `docs/trials/.work/pack-engineer.md` (526 lines, generated from current main).
- Pack — pm-review for `finish-line`:
  `docs/trials/.work/pack-pm.md` (489 lines).
- Reviewer: independent subagent instances; each had no prior conversation
  context and was briefed only with its instructions and inputs.

Three review passes:

| Pass | Role | Pack? | Purpose |
| --- | --- | --- | --- |
| A-eng | engineer | no | baseline |
| B-eng | engineer | yes | pack-assisted |
| B-pm | pm | yes | breadth (exploratory) |

There is no A-pm baseline. Scope decision: A-vs-B comparison only needs one
role pair; B-pm is recorded as exploratory.

## Pre-stated success criteria

Stated before running the trial. They are not softened below.

1. **Provenance share.** ≥30% of B-eng comments are tagged `[pack:<section>]`
   (not `[diff]` or `[prior]`).
2. **B-unique insight.** ≥1 B-eng comment is both (a) absent from A-eng and
   (b) clearly attributable to pack context — i.e. it could not have come
   from reading the diff alone.

If either fails, the conclusion is "v0.1 pack thesis is not yet validated
for engineer-review use" and Phase 2 of the validation plan proceeds with
the smaller set of positives available.

## Results

### Criterion 1 — provenance share

B-eng produced 15 numbered comments. Tag distribution as emitted by the
subagent:

| Tag | Count | Share |
| --- | --- | --- |
| `[pack: ...]` | 9 | 60% |
| `[diff]` | 6 | 40% |
| `[prior]` | 0 | 0% |

Pack citations used: `acceptance #4`, `acceptance Phase 1`,
`principles Byte-stability`, `glossary Role`, `acceptance Cross-cutting`,
`initiative/decisions Dogfood`, `principles (memory)`,
`initiative/plan Phase 4`, `constraints Technical`.

Result: **60% ≥ 30%. Criterion 1 PASS.**

### Criterion 2 — B-unique pack-attributable insights

Pairwise overlap between A-eng (15 comments) and B-eng (15 comments) using
the comment summary as the key:

| A-eng | B-eng | Overlap? |
| --- | --- | --- |
| A1 byte-stability re-run missing | B1 same | yes |
| A2 .gitkeep unreachable | B6 same | yes |
| A3 registry repo URL | B5 same | yes |
| A4 non-null assertions | B9 same | yes (B9 grounds it in "no `any` shortcuts" acceptance line) |
| A5 role-keys exact equality | B8 same | yes |
| A6 no byte-identical regen test | B4/B12 same | yes |
| A7 growth role with empty include | — | A-only |
| A8 `__dirname` in ESM | B15 same | yes |
| A9 AGENTS.md naming | (folded into B5) | yes |
| A10 slash commands hardcode `contextspec` binary | — | A-only |
| A11 "a engineer" grammar | B11 same | yes |
| A12 context-retro reads missing `retro.md` | — | A-only |
| A13 committed slash commands not asserted to match generator | B12 same | yes |
| A14 constraints.md vs cli.md drift | — | A-only |
| A15 `## Sources` regression test | — | A-only |
| — | B2 ".claude/commands has exactly six files" | B-only |
| — | B7 slash commands write packs and dirty tree | B-only |
| — | B10 `roles/engineer.md` file diverges from pack content | B-only |
| — | B13 `context-retro.md` wording allows bypassing memory confirmation | B-only |
| — | B14 README CI claim ahead of Phase 4 | B-only |

B-only comments and their attribution status:

- **B13** — `context-retro.md` step 4 says "Wait for the user to apply the
  updates manually or confirm before writing", which leaves room for the
  command to write to `memory/`. The pack's `principles` file forbids the
  CLI/generators writing to `memory/` at all. **Attribution: pack-only.**
  The baseline reviewer had no access to that principle; the diff text
  alone does not reveal it as a violation.

- **B14** — The README change advertises that the dogfood test runs on
  "every CI run". The initiative plan in the pack shows CI is Phase 4 and
  has not shipped. **Attribution: pack-only.** Baseline saw the README
  change but had no plan to check it against.

- B2 — "exactly six files" assertion; partly inferable from diff but the
  acceptance line in the pack makes it a clear gap. Mixed.
- B10 — only visible by comparing pack content to the file in the diff.
  Pack-enabled in a different way (the pack served as a reference template).
- B7 — visible from the diff; not pack-attributable.

Two comments (B13, B14) are unambiguously pack-attributable B-unique
insights. **Criterion 2 PASS.**

### Symmetric observation — A-unique comments

Pack-assisted review also missed five comments that the baseline made:

- A7 — growth role having only one nearly-empty include file; baseline
  spotted the empty-section risk by reading the registry; pack reviewer
  did not flag it.
- A10 — slash commands hardcode `contextspec` as the binary; pack reviewer
  may have ranked it lower because the pack mentions the rename as a
  pending decision (Phase 3 npm naming).
- A12 — `context-retro` reads `retro.md` but no `retro.md` is committed
  yet for `finish-line`; baseline caught a runtime hole pack reviewer
  missed.
- A14 — drift risk between `constraints.md` and `projects/cli.md`; baseline
  noticed two files restating the stack.
- A15 — `## Sources` substring-split bug from anti-patterns has no
  regression test in this PR; baseline flagged it from the diff context;
  pack reviewer may have treated it as resolved because the pack frames
  it as historical.

This is informative for Phase 2: **the pack appears to make the reviewer
trust the project's stated state too much.** Things the pack records as
"decided" or "historical" got fewer follow-ups. This is a real risk vector
for Phase 2's negative-examples and should be quoted there.

## B-pm exploratory observations

Without an A-pm baseline, these are not used for falsification, only for
breadth signal. Notable PM-only comments visible only via the pack:

- B-pm 1 — `constraints.md` still lists `validate` as deferred to v0.2,
  but `decisions.md` promotes `validate` into this initiative. Internal
  contradiction only visible by reading both files in the pack. **High
  signal.** Worth treating as an open question for the spec.
- B-pm 5 — PR does not address Hypothesis 1's experiment in the plan; pure
  pack signal. **Medium-high signal.**
- B-pm 9 — Growth role left at template default risks silently passing the
  hypothesis-1 test; pack signal. **Medium signal.**
- B-pm 12 — Missing `decisions.md` entry capturing the `.gitignore` rule
  for `packs/`; PM checklist anchored. **Medium signal.**

These reinforce Criterion 2 from a different angle: cross-file consistency
checks (B-pm 1) and process-checklist gaps (B-pm 5, 9, 12) are exactly the
class of review point that the pack uniquely enables.

## Conclusion

> **v0.1 pack thesis is validated for engineer-review on this trial.**
> Both pre-stated criteria pass. Pack assistance contributed at least two
> insights that a diff-only reviewer demonstrably could not have made
> (B13 — principle violation in slash command wording; B14 — doc ahead of
> plan). PM-side breadth signal is consistent.

Caveat: one PR, one repo, one reviewer-model. This is not a market claim,
it is a single end-to-end existence proof. The thesis stays a hypothesis
that has now survived one falsification attempt rather than zero.

## Carries into Phase 2 (spec semantic contracts)

The trial yields concrete examples to harvest. Tentative mapping —
finalized in Phase 2:

- **Positive examples** for `## Review Checklist`: B13 (principle anchor)
  and B14 (cross-file consistency to plan). Both demonstrate that a
  checklist anchored to other pack files produces a comment a baseline
  reviewer cannot reach.
- **Positive examples** for `context-map.md`: B-pm 1 (the contradiction it
  surfaced is exactly the kind of multi-file linkage a context map
  should make legible).
- **Negative example** for `## Review Checklist`: the asymmetry above —
  pack reviewer trusted "decided" framings too much and missed A7, A10,
  A14, A15. A negative example might be a checklist phrased as "items
  already addressed" that suppresses fresh examination; the spec should
  warn against this shape.
- **Heuristic candidates**:
  - "A good `## Review Checklist` item names another pack file by section,
    not just a topic."
  - "Items framed as 'decided' or 'historical' suppress re-examination;
    when in doubt, frame as 'verify still true'."

## Inputs and outputs on disk

- `docs/trials/.work/pr9-diff.patch`
- `docs/trials/.work/pack-engineer.md`
- `docs/trials/.work/pack-pm.md`

These are kept in `.work/` rather than alongside the trial doc because the
packs contain `generated_at` and will drift on regeneration; the trial
doc above quotes only stable lines.
