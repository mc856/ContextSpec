# ContextSpec

Role-based context for Claude Code and Codex.

ContextSpec helps AI-native builders and small teams turn product, business, engineering, QA, and decision knowledge into structured context packs for coding agents.

## Status

ContextSpec is currently in product and protocol design. The next implementation target is the v0.1 local file protocol and context pack compiler described in [`CONTEXTSPEC_V0_1_SPEC.md`](CONTEXTSPEC_V0_1_SPEC.md).

## Why ContextSpec

Instead of repeating the same background in every AI session, you define your context once:

- product context
- role responsibilities
- domain knowledge
- active initiatives
- project constraints
- lessons and decisions

Then use role-based commands like:

```text
/pm-review improve-invite-flow
/growth-review improve-invite-flow
/engineer-handoff improve-invite-flow
/qa-review improve-invite-flow
```

## Knowledge base boundary

ContextSpec is not a project management tool or a knowledge base.
It is a local-first context layer for AI coding workflows.

Personal knowledge bases store raw knowledge. ContextSpec curates agent-ready context.
It can reference or distill notes, docs, customer feedback, and decisions from tools like Obsidian, Notion, Logseq, or local Markdown, but its source of truth is reviewed, task-relevant context that can be compiled into role-based context packs.

## Planned v0.1

- `.contextspec/` file protocol
- `registry.yaml` schema
- PM, Growth, Engineer, and QA role templates
- initiative templates
- Markdown context pack generation
- Claude Code slash command generation
- Codex `AGENTS.md` generation

Deferred until after the context pack compiler works:

- UI
- cloud sync
- vector search
- personal knowledge base sync
- large-scale document import
- multi-agent orchestration
