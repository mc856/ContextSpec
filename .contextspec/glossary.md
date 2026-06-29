# Glossary

Terms with a specific meaning inside ContextSpec. Use this to keep specs, role files, and packs aligned.

- **Initiative** — a unit of work scoped tightly enough that one role can review it in one sitting. Each initiative has its own directory under `initiatives/<id>/`. Not the same as an "epic" or a "project".

- **Role** — a perspective + an output contract, declared in `registry.yaml.roles.<id>` and described in `roles/<id>.md`. The broader product vision discusses more possible roles, but the v0.1 built-in role set is PM, Growth, Engineer, and QA. `init` pre-scaffolds PM, Growth, and Engineer; QA remains supported in the spec and CLI surfaces even though it is not scaffolded by default. Roles are not job titles; they're decision frames.

- **Domain** — a business area whose context is stable across initiatives (e.g. "onboarding", "billing"). Domains are optional. Use them when the same flows/metrics get loaded into many initiatives.

- **Project** — a deployable / repo-scoped engineering context. Projects describe a stack and conventions. An initiative may attach 0..N projects.

- **Pack** — a Markdown file at `initiatives/<id>/packs/<role>-<task>.md` produced by `contextspec pack`. The pack is the canonical task input for a coding agent in that role for that initiative. Generated, not edited.

- **`source://<id>/<path>`** — a URI for external knowledge that's referenced but not imported. `<id>` matches a key under `registry.yaml.sources`; `<path>` is validated against that source's `include`/`exclude` globs. Listed in pack `## Sources`, never inlined.

- **Curated knowledge** — knowledge that lives inside `.contextspec/` (memory, principles, decisions). Reviewed, append-only, small. Distinct from **raw knowledge** which lives outside (notes, transcripts, journals).

- **Output contract** — the per-role section in `roles/<id>.md` that specifies what shape a response from that role takes. Slash commands and AGENTS.md tell the agent to follow it; the user enforces it during review.

- **Byte-stable** — same inputs + same `generated_at` produce identical bytes. A property of `pack`, `generate codex`, and `generate claude` outputs. Verified by tests.

- **Managed section** — the block in `AGENTS.md` between `<!-- contextspec:begin -->` and `<!-- contextspec:end -->`. Owned by the CLI; everything else in the file is owned by the user.
