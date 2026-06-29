# v0.2 Backlog

Forward-looking parking lot for candidate initiatives. Nothing here starts
until promoted with `contextspec create-initiative <id>` (dogfood the
command); the entry becomes the brief, the captured conclusions become its
`decisions.md`, and any hypothesis it moves gets its status updated in
`docs/open-questions.md`.

The v0.2 cycle follows the distribution-first dual track per
[`docs/decisions/2026-06-11-v0-2-distribution-first.md`](decisions/2026-06-11-v0-2-distribution-first.md).
Feature candidates below wait unless they serve distribution or are
anchored to evidence.

Capture conclusions here, not frozen specs — designs below are still
warm and expected to change before they become initiatives.

---

## Candidate 1 — `lower-cold-start`: role-set freedom + assisted context authoring

**Status (2026-06-11).** Partially promoted. The evidence-anchored kernel
— `create-role` + QA preset + skeleton fallback — became the re-scoped
`lower-cold-start` initiative (`.contextspec/initiatives/lower-cold-start/`).
The rest of the original design is re-parked below, carrying the lessons
from the 2026-06-11 proposal audit as preconditions.

**Problem (original).** At `init`, the cold-start cost is concentrated in
the **project-specific context files** (`context.md`, `principles.md`,
`constraints.md`), which ship as empty `<placeholder>` scaffolds. Separately,
the **role set is hardcoded**: `init` always writes `pm` + `growth` +
`engineer` (`src/init.ts:37-39`). The role-set half is now in flight; the
context-file half (the larger cost) is still parked here — see "Agent-assisted
context bootstrap" below.

**The stable split** (unchanged, validated by the audit):

| Thing | Who supplies it | Mechanism | Fiction risk |
|---|---|---|---|
| Role *definition* (how a role judges) | ContextSpec preset | static, shipped | none — a reusable lens, not a product claim |
| Role *set* (which roles to enable) | ContextSpec **recommends** | **deterministic** | none |
| Project *context* (product / constraints) | **agent drafts**, human confirms | dynamic, at bootstrap, grounded in the real repo | avoided by grounding + human confirm |

Two anti-patterns this rules out (unchanged): no static content preset for
context files (plausible boilerplate is fiction); no LLM inside the
compiler (H-06).

### Re-parked: `init --profile` / `--role` + archetype detection

Deferred from the 2026-06 initiative. **Preconditions recorded from the
audit — do not re-propose without addressing all four:**

1. **Registry-template parameterization comes first.** `REGISTRY_YAML` in
   `src/templates.ts` is a static string hardcoding `pm/growth/engineer`
   with per-role `includes`; choosing roles at `init` requires generating
   the `roles:` block (and an includes policy) dynamically, and the
   result must pass `contextspec validate`.
2. **Decide auto-apply vs recommend-only once**, and write plan and
   acceptance from the same answer. The 2026-06 proposal specified both.
3. **Org-shape (`solo`/`team`) detection is opt-in flags at the floor.**
   The proposed signal — "single git author in the last 50 commits" —
   misclassified this very repo as `team` (an agent committer plus two
   emails of one human), and a genuinely fresh repo has no history at
   all. Auto-detection needs author-identity normalization, bot/agent
   handling, and a zero-history default before it is more than a demo.
4. **Acceptance must be executable against `src/init.ts`'s overwrite
   guard** — `init` refuses where `registry.yaml` exists, before printing
   anything.

The tech-stack dimension of the archetype map (dev-tool / web-saas /
api-service / mobile, detected from `package.json` / `pyproject.toml` /
framework signals) survived the audit intact and is the lower-risk half.

### Re-parked: agent-assisted drafting (context files and/or role content)

Deferred from the 2026-06 initiative. The compiler-purity boundary is
sound (host command only; the CLI never calls an LLM — H-06), but:

- The grounding contract (citation thresholds, refuse-to-draft) is prose
  a host agent may ignore; acceptance must be written as recorded dogfood
  observations, not as deterministic behavior ("exits with a message").
- Pin the threshold numbers in a decision *before* the initiative starts.
- Open question the next proposal must answer first: **which target?**
  This backlog originally reserved drafting for context files (the
  concentrated cost); the 2026-06 proposal redirected it to role content.
  The first external user's observed cold-start pain decides — do not
  re-litigate it from the armchair.

### Re-parked: Reviewer preset

Demoted to the skeleton / `--from` path. Promote to a curated
`ROLE_REVIEWER_MD` only after a real invocation produces review output
distinct from PM/engineer review (the evidence bar of
`docs/decisions/2026-05-13-drop-monetization-role.md`, rationale 2).

### Hypotheses moved

- **H-03** (minimal role set): de-risked by `create-role` —
  extensibility makes a wrong guess cheap rather than protocol-breaking.
  Status moves are retro-gated.
- **H-05** (founders edit YAML/MD without friction): `create-role`
  removes the scariest edit (`registry.yaml`). Status moves are
  retro-gated.

---

## Candidate 2 — `docs/` structure cleanup (minimal cut landed 2026-06-28)

`docs/` now separates user-facing from internal:

- user-facing at top level: `USER_GUIDE.md`, `USER_GUIDE.zh-CN.md`
- living reference at top level: `open-questions.md`,
  `v0-1-implementation-notes.md`, this backlog
- public reference subdir: `decisions/` (ADRs)
- internal subdir: `internal/` holds dated snapshots
  (`methodology-review-2026-05-12.md`,
  `solo-founder-fit-2026-05-17.md`,
  `v0-1-validation-plan-2026-05-13.md`) and `internal/trials/`
- gitignored: `private/` (local-only working notes, archived in
  `mc856/contextspec-archive`)

A first-time reader hitting the repo lands on user-facing docs and ADRs
without tripping over methodology snapshots. Anything still feeling
"navel-gazing" after this cut goes in a future entry — the goal here was
the minimal traffic-readiness cut before catalog/awesome-list submissions,
not a full taxonomy.

---

## Candidate 3 — OpenSpec interop (tracked elsewhere)

The `contextspec-openspec` schema bundle and catalog submission are the
two-track convergence point of the distribution-first dual track
(see [`docs/decisions/2026-06-11-v0-2-distribution-first.md`](decisions/2026-06-11-v0-2-distribution-first.md),
weeks 3–4). The bundle lives in its own repo and is **not** a
`.contextspec/` initiative here; this entry exists so the backlog reflects
where v0.2 effort actually goes. Interop learnings that require changes
in *this* repo (e.g. an export adapter) get promoted into a real
initiative when they appear.

---

## Process

- Entries are candidate initiatives, ordered loosely by leverage.
- Promote with `contextspec create-initiative <id>`.
- This file is reviewed at each initiative retro alongside
  `docs/open-questions.md`.
