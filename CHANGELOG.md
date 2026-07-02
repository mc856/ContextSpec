# Changelog

All notable changes to ContextSpec will be documented in this file.

## v0.2.0 — 2026-07-02

- add `contextspec create-role <id>` (spec form `create role <id>`): registers the role in `registry.yaml` with comments preserved, and writes `roles/<id>.md` from a curated preset, `--from <existing-role>` clone, or a structured skeleton fallback.
- add a curated QA role preset (`qa-review` now has a real template behind it, closing the spec §10 gap).
- reword role-template checklists to "verify still true" framing, so packs prompt re-verification instead of inheriting the project's self-reported state (lesson from the 2026-05-13 review trial).
- make CLI spec-form preprocessing position-independent, so `contextspec --cwd <dir> create role <id>` works with leading flags.
- harden `create-role` against prototype-key role ids (`constructor`) and `--from` path traversal.

## v0.1.0 — 2026-05-25

- [#4](https://github.com/mc856/contextspec/pull/4): ship deterministic context pack compilation for role-scoped task handoffs and reviews.
- [#7](https://github.com/mc856/contextspec/pull/7): add `init` and `create initiative` scaffolding for a working `.contextspec/` setup.
- [#8](https://github.com/mc856/contextspec/pull/8): generate Claude slash commands and Codex `AGENTS.md` from the registry.
- finish-line: add dogfood coverage, `contextspec validate`, and release hardening for the first npm publish.
