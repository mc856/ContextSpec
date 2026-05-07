# Example: improve-team-invite-conversion

A hand-written `.contextspec/` example used to validate the v0.1 protocol before any CLI exists.

## What this validates

| Question | How this example answers it |
|---|---|
| Is the `.contextspec/` directory too heavy? | Only the files actually needed are present. `memory/` ships with `README.md` plus two real files; absent ones are simply not created. |
| Is `registry.yaml` clear enough to hand-write? | The registry mounts only the roles in use (PM, Growth, Engineer — no QA), one domain, one project, one initiative, one source. |
| Do role templates carry their weight? | Each role file fills the §6 headings with concrete content tied to the initiative. |
| Do initiative files actually support a role review? | `initiatives/improve-team-invite-conversion/reviews/growth.md` was written using only the other initiative files plus the role + domain context. |
| Is the context pack format usable by Claude Code / Codex? | Two compiled packs live under `initiatives/.../packs/`: `growth-review.md` and `engineer-handoff.md`. |
| Does `source://` keep external knowledge reference-only? | `domains/onboarding/decisions.md` and `sources/personal-knowledge.md` link out to a (notional) Obsidian vault using `source://personal_knowledge_base/...`; no external content is inlined. |
| What does a CLI need to generate? | Every file in this directory is something `contextspec init`, `contextspec create initiative`, or `contextspec pack` would produce. |

## Spec version

This example targets `CONTEXTSPEC_V0_1_SPEC.md` as of changelog entry **2026-05-07**.

## What this example deliberately does NOT do

- It is not a real product. "Tessera" and its numbers are fabricated for illustration.
- It does not include every role. QA is omitted to confirm registry does not require all four built-in roles.
- It does not include `retro.md` content, because the initiative is mid-flight.
- It does not exercise `monetization` or `coordinator` roles — those are out of v0.1 scope.
- The two packs were compiled by hand; they show the format the future CLI should produce, not actual CLI output.

## How to read this example

Read in roughly this order:

1. `.contextspec/context.md`, `principles.md`, `glossary.md`, `constraints.md`
2. `.contextspec/registry.yaml`
3. `.contextspec/roles/growth.md`
4. `.contextspec/domains/onboarding/*`
5. `.contextspec/initiatives/improve-team-invite-conversion/brief.md` and `context-map.md`
6. `.contextspec/initiatives/improve-team-invite-conversion/packs/growth-review.md`
7. `.contextspec/initiatives/improve-team-invite-conversion/reviews/growth.md`

The pack at step 6 is what a coding agent would actually consume; everything else is what the compiler reads.
