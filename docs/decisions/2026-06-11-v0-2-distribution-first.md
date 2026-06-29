# ADR — v0.2 is distribution-first; initiative work limited to evidence-anchored kernels

- **Date:** 2026-06-11
- **Status:** Accepted
- **Supersedes:** the three-phase scope of `lower-cold-start` as registered on 2026-06-11

## Context

v0.1 closed: `contextspec@0.1.0` published to npm on 2026-05-25, CI green,
`finish-line` fully accepted.

Two competing v0.2 directions surfaced a day apart:

- A 12-week distribution-first dual track (2026-06-10): contribute to
  OpenSpec, get ContextSpec into the OpenSpec community schemas catalog
  and awesome lists, keep npm alive with patch releases. v0.2 picks "1–2
  items related to OpenSpec interop, don't spread out."
- `.contextspec/initiatives/lower-cold-start/` (2026-06-11): a three-phase
  feature initiative (`create-role` + lens library; `init --profile` +
  archetype/org-shape auto-detection; agent-assisted role drafting). None
  of its phases relate to interop.

A same-day audit of the proposal found, additionally:

- Phase 2's org-shape signal ("single git author in the last 50 commits")
  misclassifies this very repo as `team` — the last 50 commits carry three
  author identities (an agent committer plus two emails of one human) —
  contradicting the plan's own dogfood experiment.
- A Phase 2 acceptance criterion cannot pass against `src/init.ts`'s
  overwrite guard as written.
- Phase 2 omitted its largest task (the static `REGISTRY_YAML` template
  must become a function of the chosen role set).
- The Reviewer preset had no demand evidence, against the bar set by
  `docs/decisions/2026-05-13-drop-monetization-role.md` (rationale 2:
  no maintenance spend ahead of evidence) and the backlog's own
  "skeleton for the rest until demand shows."

Meanwhile the project has **zero external users** (`.contextspec/context.md`
§Stage), and the falsifiers for H-01, H-05, and H-06 in
`docs/open-questions.md` all require real users to trigger. The weekly
budget is 5–10 hours; it cannot run two routes.

## Decision

1. v0.2 follows the distribution-first dual track. Feature work must
   serve distribution or be anchored to existing evidence.
2. `lower-cold-start` is re-scoped to its evidence-anchored kernel, a
   single phase: `create-role` + a curated QA preset + a structured
   skeleton fallback. Anchors: spec §10 promises `qa-review`;
   `src/generateClaude.ts` already maps `qa → review` with no
   `ROLE_QA_MD` behind it; H-05 names the registry hand-edit as the
   scariest edit.
3. `init --profile`/`--role` + archetype/org-shape detection, and
   agent-assisted role-content drafting, return to `docs/v0-2-backlog.md`
   carrying the audit lessons, so the rework is not lost.

## Rationale

1. **Every untested hypothesis needs users to falsify.** Distribution is
   the critical path to evidence; polishing the `init` funnel before
   anyone enters it optimizes step one of a zero-traffic funnel.
2. **The retained kernel is the only part with anchors today**, and it
   doubles as material for the OpenSpec schema bundle ("add a role lens
   with one command" is the bundle's story).
3. **The known crack in the core claim goes unaddressed otherwise.** The
   one H-02 trial passed but showed the pack suppressing five
   baseline-only comments (`docs/notes/trials/2026-05-13-pr9-review-trial.md`,
   "Symmetric observation"). Harvesting its "verify still true" lesson
   into the role templates is cheap, evidence-driven, and rides along
   with the QA preset work.

## Alternatives considered

- **Build `lower-cold-start` as proposed.** Rejected: two blocker-grade
  defects in Phase 2, no interop relevance, and the whole initiative
  presumes users that don't exist yet.
- **Mothball ContextSpec; contribute to OpenSpec full-time.** Rejected:
  the two tracks reinforce each other (community identity brings traffic;
  the original project supplies contribution credibility), and 0.1.0 plus
  the methodology assets are already sunk and live.

## Consequences

- `.contextspec/initiatives/lower-cold-start/` files are rewritten to the
  single-phase scope; its `decisions.md` records the cut-downs with their
  evidence.
- `docs/v0-2-backlog.md` re-parks the deferred phases with the audit
  lessons attached as preconditions.
- `README.md` is refreshed (stale "in design" status, badges, shipped
  scope) and `CONTRIBUTING.md` is added, per the execution plan's week
  1–2 items.
- Renaming the GitHub repo `mc856/codex → contextspec` is recommended
  (the current name collides with OpenAI Codex and undercuts every
  distribution move) but is an owner action, recorded here as pending.
- H-03 / H-05 status changes in `docs/open-questions.md` remain
  retro-gated; nothing moves until there is an observation to cite.
