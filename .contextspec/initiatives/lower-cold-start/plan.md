# Plan

One phase, deterministic, zero new dependencies. The original Phases 2–3 are re-parked in `docs/v0-2-backlog.md` per `docs/decisions/2026-06-11-v0-2-distribution-first.md`.

## Phase 1 — `create-role` + QA preset

- change: new command `contextspec create-role <id> [--from <known-role>] [--force]` (spec form `create role <id>` via `preprocessArgv`, made position-independent at the same time). Mirrors `createInitiative`'s comment-preserving YAML-AST edit (`parseDocument` + `forceBlockStyle`) but on `roles:`. Three template sources, tried in order: (1) explicit `--from <role>` → clone the project's **current on-disk** `roles/<role>.md` (explicit flag beats implicit library match; a warning notes when it shadows a curated preset); (2) id matches the lens library (`pm`/`growth`/`engineer`/new `qa`) → curated preset; (3) genuine custom → structured skeleton (Mission / Owns / Needs / Reviews / Output Contract / Cannot Decide / Checklist / Common Mistakes / Suggested Memory Updates, `<placeholder>` bodies). New registry entries are `{file: roles/<id>.md, includes: []}` — no `--task` flag (see decisions #4). In the same template pass, reword checklist items across role templates to "verify still true" style per the trial's suppression finding.
- experiment: in a fresh-`init` sandbox, `create-role qa` followed by `generate-claude` emits a `qa-review.md` slash command backed by a real `roles/qa.md` — the latent `DEFAULT_ROLE_TASK` qa mapping becomes live. Dogfood (user-confirmed registry edit): add `qa` to this repo, run `/qa-review lower-cold-start` and `/engineer-review lower-cold-start` on the Phase 1 PR, count QA-only comments. Feeds hypothesis 2 and H-10.
- decision rule: if `create-role` cannot preserve registry comments/key order, or is not byte-stable on `--force` re-runs, hold the phase — the YAML-AST guarantees are protocol-level, not nice-to-have. If the QA pack reads as engineer-review relabeled, record that against hypothesis 2 at retro; the library stays QA-only either way until external demand shows.

## Follow-on (not this initiative)

The OpenSpec schema bundle (`contextspec-openspec`) consumes `create-role` as its "add a role lens" story. Tracked in the distribution-first dual track (see [`docs/decisions/2026-06-11-v0-2-distribution-first.md`](../../../docs/decisions/2026-06-11-v0-2-distribution-first.md), weeks 3–4) — a separate repo, not a `.contextspec/` initiative here.
