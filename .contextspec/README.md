# `.contextspec/` — this project, dogfooded

This directory is ContextSpec applied to itself. Everything you see here
is the same shape `contextspec init` produces in *your* repo — a real
example of a curated v0.1 setup, kept in sync with the code via
`test/dogfood.test.ts`.

If you're browsing for the first time:

- [`registry.yaml`](registry.yaml) — the source of truth for roles,
  projects, and initiatives. Everything else hangs off this.
- [`context.md`](context.md), [`principles.md`](principles.md),
  [`glossary.md`](glossary.md), [`constraints.md`](constraints.md) —
  product-wide framing loaded into every pack.
- [`roles/`](roles/) — role lenses (PM, Growth, Engineer, QA). Each has
  an Output Contract that defines the shape of a review or handoff.
- [`initiatives/`](initiatives/) — live and closed initiatives. The
  shipped v0.1 release is `finish-line/` (closed); the current cycle is
  `lower-cold-start/`. Each carries `brief.md` / `plan.md` /
  `tasks.md` / `decisions.md` / `acceptance.md` / `retro.md` — the
  phase-by-phase ceremony you see is the protocol, not internal
  process leak.
- [`memory/`](memory/) — curated, append-only knowledge
  (anti-patterns, experiment results). Updated via retro, not edited
  ad hoc.

For end-user setup and the daily review/handoff/retro loops, see
[`docs/USER_GUIDE.md`](../docs/USER_GUIDE.md).
