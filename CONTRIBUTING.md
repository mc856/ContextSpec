# Contributing to ContextSpec

Thanks for looking. This is a small, deliberately dep-light TypeScript CLI; the bar for contributions is correctness and fit, not size.

## Dev setup

Node ≥ 20.

```bash
npm install
npm run lint    # tsc --noEmit
npm run build
npm test        # vitest, ~1s locally
```

## Before you write code

1. Read [`docs/v0-1-implementation-notes.md`](docs/v0-1-implementation-notes.md) — start with **Cross-cutting invariants**, then the section for the module you're touching. Every PR must preserve all four invariants:
   - byte-stable output on fixed inputs
   - no LLM / no network in the compiler hot path
   - the CLI never writes to user-authored files
   - path-based routing wins over config-based routing
2. Read `.contextspec/memory/anti-patterns.md` if your change touches the same module as a recorded pitfall (YAML AST editing and Markdown-heading parsing are the famous ones).
3. This repo dogfoods its own protocol: `.contextspec/` is checked in and `test/dogfood.test.ts` compiles against it. If your change breaks the live registry, the tests will tell you.

## PR checklist

Borrowed from the implementation notes — state in your PR description:

- which spec sections (`CONTEXTSPEC_V0_1_SPEC.md`) your change exercises
- which existing tests cover it; which new tests you added
- that generated outputs stay byte-stable (run the generator twice, diff)
- that `docs/v0-1-implementation-notes.md` is updated in the same PR if behavior or architecture changed

Other conventions:

- **No new runtime dependencies without prior discussion.** The only runtime deps are `cac` and `yaml`; the glob matcher is hand-rolled on purpose.
- Templates live as TS string constants in `src/templates.ts`, not as resource files.
- Notices go to stderr; only pack content (with `--stdout`) goes to stdout.
- Tests use real fixtures (`examples/`) or `mkdtempSync` sandboxes — no inline fake registries.

## AI-assisted contributions

Welcome — much of this codebase was built that way. State the tool in your PR description (e.g. "Generated with Claude Code, reviewed by me"). You own what you submit: run the tests, read your own diff.

## Issues

Bug reports with a reproducible command sequence are gold. For feature ideas, check [`docs/v0-2-backlog.md`](docs/v0-2-backlog.md) and [`docs/open-questions.md`](docs/open-questions.md) first — if your idea maps to an open hypothesis, say which one.
