# AGENTS.md

<!-- contextspec:begin -->
## ContextSpec

This repository uses [ContextSpec](https://github.com/mc856/ContextSpec) v0.1 to manage role-specific agent context. Before making non-trivial changes:

1. Read `.contextspec/context.md`, `.contextspec/principles.md`, `.contextspec/glossary.md`, and `.contextspec/constraints.md` for product-wide framing and limits.
2. Read the relevant role file under `.contextspec/roles/` (e.g. `roles/engineer.md`) and treat its **Output Contract** as the format for your response.
3. If the user names an initiative, read everything under `.contextspec/initiatives/<id>/` in this order: `brief.md`, `context-map.md`, `plan.md`, `tasks.md`, `acceptance.md`, `decisions.md`, then any `reviews/*.md`, then `retro.md`. The `packs/` subdirectory holds compiled output and is generated, not edited.
4. If the `contextspec` CLI is available, prefer running it to compile a fresh task-scoped context pack:

   ```bash
   contextspec pack --role <role> --initiative <id> --task <task>
   ```

   The compiled pack at `.contextspec/initiatives/<id>/packs/<role>-<task>.md` is the canonical task context. Use it instead of re-reading every input file ad hoc.
5. Memory under `.contextspec/memory/` is curated, append-only knowledge. You may **propose** updates during retro work, but do not write to `memory/` without explicit user confirmation.
6. `.contextspec/registry.yaml` is the source of truth for roles, domains, projects, and initiatives. Adding to it is a scope change; surface it to the user rather than editing silently.
<!-- contextspec:end -->
