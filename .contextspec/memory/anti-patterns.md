# Anti-Patterns

Append-only. Each entry: short title, one-paragraph case, and the rule it taught us.

## 2026-05-08 — Splitting on a Markdown heading by substring

**Case.** The pack-test fixture extracted the trailing `## Sources` source list with `text.split('## Sources', 2)[1]`. It silently failed on a fixture where `context-map.md` legitimately mentioned the heading inside a backtick: `before listing it in \`## Sources\``. The split landed inside the prose, not at the heading, and 75% of the body got matched as sources.

**Rule.** Anchor on heading position with a regex that requires start-of-line: `/(?:^|\n)## Sources\n/`. Markdown heading parsing is not a substring search. This applies to any code that "looks for a heading" — pack compilation, future `validate`, anything walking generated output.

## 2026-05-08 — Assuming `cac` parses multi-word command names

**Case.** Spec §1 documents the CLI as `contextspec create initiative <name>` and `contextspec generate claude`. The first instinct was to register `'create initiative <name>'` as a cac command name. cac splits the command name string on spaces and treats only the first token as the command — so `create initiative <name>` would have parsed as command `create` with positional `initiative` and `<name>`. The two-word form would have silently resolved to the wrong handler.

**Rule.** Any CLI parsing library that treats the command name as a single token cannot directly serve a spec that uses multi-word commands. Collapse the spec form to a single token at the entry point (`preprocessArgv` in `src/cli.ts`) so both forms work, and document both in `--help`.

## 2026-05-08 — Empty flow-style YAML mappings spread to children

**Case.** `init`'s registry template ends with `initiatives: {}`. When `create-initiative` parsed and edited it, the new entries inherited flow style: `{ q2-onboarding: { path: ..., roles: [pm, growth, engineer] } }`. Valid YAML, but every diff after that point would re-format the flow on add/remove, making review noisy.

**Rule.** When converting an empty flow-style container to a populated one via the YAML AST, set `node.flow = false` on the container *and* on every newly created child node before stringifying. The `forceBlockStyle` helper in `src/createInitiative.ts` walks a created subtree to enforce this.

## 2026-05-08 — Regenerating user-shared files whole-file

**Case.** First sketch of `generate codex` would have written `AGENTS.md` from a fixed template every run. AGENTS.md is a shared surface — humans add team rules, internal coding conventions, links. A whole-file rewrite would clobber that on every regeneration.

**Rule.** Any generator that writes to a file the user also writes to must own only a marked block of that file (HTML comments work in Markdown), preserve everything outside the markers, and be byte-stable when only the managed block is in scope. Tested on insertion (no markers yet), update (markers present), and idempotent re-run.

## 2026-05-18 — Letting parser stack traces escape from a user-facing CLI

**Case.** `contextspec validate` originally loaded `registry.yaml` directly inside the CLI action. Missing-file and semantic validation failures printed clean one-line diagnostics, but malformed YAML bypassed that contract and dumped the underlying `yaml` parser stack trace to the terminal. The command was technically failing, but it violated the "concise, user-correctable output" expectation that Phase 2 acceptance depends on.

**Rule.** User-facing CLI commands should treat config parsing as an error boundary, not just the business-logic validator. Wrap config loading in a command-level helper that converts parser failures into a single actionable line and reuse that helper in tests so the formatting contract is enforced alongside the exit code.
