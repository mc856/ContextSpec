# Personal Knowledge — curated reference notes

This file is a curated index of relevant material from the user's personal knowledge base. Per spec §8.2, this is **not** the same thing as `registry.yaml > sources`: the registry declares the external root (`~/ObsidianVault`) and access rules; this file is a small, hand-curated map of which notes are worth referencing for the active initiative.

External notes are referenced via the `source://` URI scheme (spec §5.5). The pack compiler validates each link against `registry.sources.personal_knowledge_base.{include,exclude}` before adding it to a pack's `## Sources` section. Content from the linked notes is never inlined.

## For improve-team-invite-conversion

### Onboarding decisions

- [2025 Q3 onboarding interviews](source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md) — interviews behind the 14-day expiry decision in `domains/onboarding/decisions.md`.
- [2026-01 invite copy rollback](source://personal_knowledge_base/Decisions/2026-01-invite-copy-rollback.md) — the rollback that codified principle 4.

### Product surface notes

- [Team-link adoption notes](source://personal_knowledge_base/Product/team-links-adoption.md) — quantitative adoption of reusable invite links since their launch. Relevant if hypothesis 3 expands.

### Customer feedback patterns (raw)

- [Support tickets — onboarding tag, 2026 Q1](source://personal_knowledge_base/Customers/support-onboarding-2026Q1.md) — raw support tickets tagged onboarding. Use as a source for retro-time customer-feedback memory updates; do not inline.

## What does NOT belong in this file

- Daily notes, journaling entries, or anything inside the excluded `Daily/**` and `Private/**` patterns. The compiler will drop those references with a warning even if they appear here.
- Inlined excerpts from external notes. References are link-only.
- New product decisions. Those belong in `domains/<domain>/decisions.md` after human confirmation.
