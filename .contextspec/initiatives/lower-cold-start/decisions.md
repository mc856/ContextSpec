# Decisions

Initiative-scoped decisions that bind the rest of `lower-cold-start`. Architectural points that affect what's currently true across the codebase get mirrored into `docs/v0-1-implementation-notes.md` in the same PR.

## 2026-06-11 — Re-scoped to the evidence-anchored kernel; v0.2 is distribution-first

- decision: this initiative ships one phase — `create-role` + QA preset + skeleton fallback. The original three-phase scope (archetype detection, agent-assisted drafting) is cut per [`docs/decisions/2026-06-11-v0-2-distribution-first.md`](../../../docs/decisions/2026-06-11-v0-2-distribution-first.md), which also frames v0.2 as a distribution-first dual track.
- alternative: build the three-phase proposal as registered. Rejected — the same-day audit found two blocker-grade defects in Phase 2, none of the phases served the distribution plan written one day earlier, and every deferred hypothesis needs external users to falsify — users that distribution, not features, will produce.
- impact: the kernel doubles as material for the OpenSpec schema bundle; the deferred phases are re-parked in `docs/v0-2-backlog.md` with the audit lessons attached as preconditions.

## 2026-06-11 — Lens library vs. enabled set is a real split; this initiative ships only the library side

- decision: the **lens library** is the set of curated role definitions in `src/templates.ts` (today PM, Growth, Engineer; adding QA). The **enabled set** is which lenses a project turns on — today via `init`'s default plus `create-role` additions. Archetype-driven enabled-set selection is deferred with the rest of Phase 2.
- alternative: keep the backlog's one-tier model coupling "curated" with "always enabled at init." Rejected — it conflates the no-fiction question ("is the lens honest?") with the routing question ("does this project need it?"), and `create-role` needs the library as a template source regardless.
- impact: a preset can be curated once without committing `init` to ship it; QA joins the library without changing `init`'s default set.

## 2026-06-11 — Curate only QA; Reviewer demoted to the skeleton / `--from` path

- decision: the library write in scope is `ROLE_QA_MD` only. Reviewer — originally slated for curation alongside QA — is served by the skeleton or `--from` until a real invocation produces review output distinct from existing roles.
- alternative: curate Reviewer now on the strength of the "highest-value lens after engineer" hunch. Rejected — QA is anchored (spec §10 promise; the latent `qa → review` mapping in `src/generateClaude.ts:30`); Reviewer has zero demand evidence, and `docs/decisions/2026-05-13-drop-monetization-role.md` rationale 2 set the bar: no maintenance spend ahead of evidence. The backlog itself said "skeleton for the rest until demand shows."
- impact: every id outside the library falls to `--from` or the structured skeleton, which is honest about being a shape, not a claim.

## 2026-06-11 — No `--task` flag on `create-role`

- decision: `create-role` takes `<id>`, `--from`, `--force`, `--cwd` only.
- alternative: carry the backlog's `--task <task>` flag. Rejected — the registry `RoleDecl` is `{file, includes}` with no task field, and the default task lives in `generateClaude.ts`'s hardcoded `DEFAULT_ROLE_TASK` map; persisting a custom task is a registry schema change (spec §4) that nothing currently demands. `qa` already has its mapping; unknown roles default to `review`, which is correct for review-shaped lenses.
- impact: revisit only if a user asks for a non-`review` default task on a custom role; that request triggers the schema discussion, not a silent flag.

## 2026-06-11 — New roles register with `includes: []`

- decision: `create-role` writes the registry entry as `{file: roles/<id>.md, includes: []}`.
- alternative: presume memory wiring per role (e.g. give `qa` `memory/anti-patterns.md` the way `engineer` has it). Rejected — the shipped defaults for `pm`/`growth`/`engineer` were curated choices; a generated guess about which memory file a new lens needs is exactly the plausible-but-unfounded content the no-fiction stance rules out.
- impact: users wire includes themselves after seeing their first pack; the empty list is visible and editable in the registry the command just touched.

## 2026-06-11 — Drop `growth` from this initiative's registry attachment

- decision: `lower-cold-start` is registered with `roles: [pm, engineer]`. `growth` is excluded.
- alternative: match `finish-line` and attach `[pm, growth, engineer]`. Rejected — this repo has no growth motion yet (`finish-line/decisions.md`, "Growth role left at template default"; the "dead weight" characterization is `docs/v0-2-backlog.md`'s), and the point of this initiative is that role-set choices should be cheap. The cost of being wrong is one `registry.yaml` line.
- impact: `/growth-review lower-cold-start` will not produce a meaningful pack unless `growth` is re-attached. The repo-wide growth slash command still exists.

## 2026-06-11 — Archetype / org-shape detection returns to the backlog, with evidence

- decision: `init --profile` / `--role` and the solo/team auto-detection do not ship in this initiative.
- alternative: keep them as Phase 2. Rejected on audit evidence: (a) the proposed solo signal — "single git author in the last 50 commits" — classifies this very repo as `team` (three author identities: an agent committer plus two emails of one human), failing the plan's own dogfood experiment; (b) the acceptance criterion ran `init` where `registry.yaml` already exists, which `src/init.ts`'s guard rejects before printing anything; (c) the static `REGISTRY_YAML` template must become a function of the chosen role set first — a task the plan never listed; (d) auto-apply vs recommend-only was specified both ways in different files.
- impact: when revived, opt-in `--solo` / `--team` flags are the floor, registry-template parameterization is the first task, and the apply-vs-recommend question is decided before any acceptance is written. All recorded in `docs/v0-2-backlog.md`.

## 2026-06-11 — Committed slash commands realigned to generator output

- decision: accept the regenerated `.claude/commands/*.md` over the committed variants. Phase 1's byte-stability check surfaced that the four committed role commands had hand-written `description` lines that never matched `generateClaude`'s output — drift present since the dogfood commit (`5fed5fd`), exactly what trial comments A13/B12 flagged, and carrying the "a engineer-role" grammar bug A11 flagged.
- alternative: adopt the hand-written wording into the generator instead. Rejected — the hand-written variant contains the known grammar bug, and the protocol's stance is that slash commands are pure derivatives of the registry; the generator is the source of truth.
- impact: `generate-claude` re-runs are now actually byte-stable against the committed files, closing the drift. Future hand-edits to generated commands will be overwritten by design; wording improvements go through `src/generateClaude.ts`.

## 2026-06-11 — Agent-assisted role-content drafting returns to the backlog

- decision: the `contextspec-draft-role` slash command does not ship in this initiative.
- alternative: keep it as Phase 3. Rejected — the grounding contract (citation thresholds, refuse-to-draft) is prose a host agent may ignore; it cannot be enforced in code, and the drafted acceptance ("exits with a 'not enough grounding' message") described behavior no prompt can guarantee. The compiler-purity boundary itself is sound (host command only), but shipping it before any external user exists validates nothing.
- impact: revisit after the OpenSpec bundle ships and at least one external user's cold-start pain is observed — that observation also settles whether role files or context files are the right drafting target, which the original proposal and the backlog disagreed on.
