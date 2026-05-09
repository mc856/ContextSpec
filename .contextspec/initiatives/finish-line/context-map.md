# Context Map

Pointers into the rest of `.contextspec/` for this initiative. Roles read this first when picking up the work.

## Domains

- _none_ — ContextSpec doesn't have business domains in the traditional sense; the spec sections themselves are the closest analog. Use `CONTEXTSPEC_V0_1_SPEC.md` directly when in doubt.

## Projects

- `cli` — the Node + TypeScript package that is this repo. See `projects/cli.md`.

## Memory

- `memory/anti-patterns.md` — concrete pitfalls hit while building the v0.1 slices. Reread before designing anything that touches pack compilation, AGENTS.md generation, or CLI argv handling.
- `memory/experiment-results.md` — empty by intent. We have no usability experiments yet (no users).

## Spec sections that bind this work

- §9 CLI command set — `validate` is mentioned in §9.1 deferred commands; this initiative may promote it.
- §11 Codex integration — any change to `AGENTS.md` shape lands in the managed-block format and must stay back-compatible with already-generated files.
- §12 acceptance criteria — already met by #4/#7/#8; this initiative adds non-functional acceptance (publishability, drift detection).

## External sources

None for this initiative. There is no personal knowledge base attached to the project.
