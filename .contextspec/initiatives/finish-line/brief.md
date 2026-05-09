# finish-line

Get ContextSpec v0.1 from "the founder runs it from a local checkout" to "a stranger can `npm i -g contextspec`, run `init`, and have a working setup in under five minutes". Three v0.1 slices already shipped (pack, init/create-initiative, generate). What's missing is the trust glue: dogfood, validate, publish, CI.

## Why now

- Spec §12 acceptance is met by the three merged PRs (#4, #7, #8). Functionally, v0.1 works. But there is no published artifact, no CI gate, no `validate` for users to discover broken state, and no live-fixture test ensuring the project's own `.contextspec/` stays consistent with the code.
- Without dogfood, the templates get stale silently — `init` ships role/context content that nobody actually reads.
- Without `validate`, the first time a user mistypes a path in `registry.yaml`, they get a `compilePack` warning buried in `--stdout` output. That's a bad first impression for a protocol that wants to be "obviously correct".

The total scope is small (a few hundred lines + config) and it's the last thing keeping v0.1 from being a real release.

## Hypotheses

1. **Dogfooding will surface at least one template gap.** — falsified if the live `.contextspec/` compiles cleanly with no rewrites of `init` templates and no need to add a new top-level concept.
2. **`contextspec validate` is the smallest useful safety net before publishing.** — falsified if early users hit problems that `validate` would not have caught (e.g. they need a watcher, not a checker).
3. **GitHub Actions CI on every PR is enough; release-on-tag for npm.** — falsified if the matrix needs Windows or multiple Node versions to ship usefully (would push us toward something heavier).

## Out of scope

- Browser/web UI of any kind.
- A daemon or watcher process.
- Cloud sync, multi-machine state, or telemetry.
- A v0.2 feature backlog. Anything not on the path to "first stranger can install and use" goes in `decisions.md` as deferred.
- Rewriting any of the three already-shipped slices (#4, #7, #8). Bug fixes only.
