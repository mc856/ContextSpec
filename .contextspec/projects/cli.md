# Project: cli

The `contextspec` CLI (this repo). Single Node + TypeScript package, ESM only, distributed via npm.

## Repo

- single repo, single package
- entry point: `bin/contextspec.js` (shebang) → `dist/cli.js` (built)
- library exports: `src/index.ts` re-exports `compilePack`, `initContextSpec`, `createInitiative`, `createRole`, `generateClaude`, `generateCodex`, `loadRegistry`, `validateContextSpec`, `runValidateCommand`, types

## Stack

- Node 20+
- TypeScript 5.6+, target ES2022, module NodeNext
- Strict mode + `noUncheckedIndexedAccess` + `noImplicitOverride`
- ESM only (`"type": "module"`)
- Build: `npm run build` → `tsc` → `dist/`
- Tests: `npm test` → `vitest run`

## Runtime dependencies

Two only:
- `yaml` — registry parsing and structured editing (preserves comments via `parseDocument`)
- `cac` — CLI parsing. Caveat: cac treats command names as single tokens, so `create initiative`, `create role`, `generate claude`, and `generate codex` are collapsed to their hyphenated forms in `preprocessArgv` (position-independent scan) before cac sees them.

Adding a runtime dependency is a registry-affecting decision and requires a `decisions.md` entry.

## Conventions

- One module per concern: `registry.ts`, `route.ts`, `resolve.ts`, `compile.ts`, `sources.ts`, `init.ts`, `createInitiative.ts`, `createRole.ts`, `yamlEdit.ts`, `generateClaude.ts`, `generateCodex.ts`, `validate.ts`, `validateCommand.ts`, `templates.ts`, `cli.ts`.
- All paths inside `.contextspec/` are stored as POSIX-style relative strings; only the resolver converts to absolute paths.
- Routing is path-based, not config-based. Section assignment is in `src/route.ts`. Don't add config knobs that override this.
- Templates are TS string constants in `src/templates.ts`. They ship in the published `dist/` (no separate template directory needed at runtime).

## Test approach

- Unit-ish: `pack.test.ts` runs the example fixture (`examples/improve-team-invite-conversion/`) through `compilePack` end-to-end; asserts ordering, byte-stability, routing edge cases, source-link validation. The fixture is the spec executable.
- Workflow: `init.test.ts`, `generate.test.ts` use `mkdtempSync` to sandbox each test in a fresh temp directory.
- Live dogfood: `dogfood.test.ts` compiles a pack against this repo's own `.contextspec/`; protects against drift when files referenced in the registry get renamed or deleted.
- Always assert byte-stability on generated output (pack, AGENTS.md, slash commands).

## Out of scope for this project

- A bundler (`tsc` is enough).
- A CommonJS build. ESM only; if a downstream needs CJS, they can wrap.
- A REPL / watch mode. v0.1 is one-shot CLI.
- Cross-platform smoke tests beyond Linux + macOS. Windows support is best-effort until a user asks.

## Active feature flags / guardrails

None. The CLI has no flags or branches keyed off env. If we add one, document it here.
