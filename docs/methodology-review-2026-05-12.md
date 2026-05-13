# Methodology Review — 2026-05-12

A retrospective of ContextSpec's vision / planning / spec / implementation through
the lens of the superpowers framework (brainstorming → spec → plan → TDD →
verification-before-completion → code-review → systematic-debugging).

This review is methodology-only. It does not propose protocol changes; it
proposes process changes. Reviewed artifacts:

- `VISION.md` (227 lines)
- `PRODUCT_BLUEPRINT.md` (1719 lines)
- `CONTEXTSPEC_V0_1_SPEC.md` (736 lines)
- `docs/v0-1-implementation-notes.md` (448 lines)
- merged work: PR #4 (pack), #7 (init + create-initiative), #8 (generate)

## 1. Layer-by-layer findings

### 1.1 Vision (`VISION.md`)

**Strengths.** Problem statement is sharp ("the bottleneck is context", lines
9–10). Seven principles are internally consistent.

**Gaps under the framework.**

- No falsifiable success criteria. "Useful before intelligent" (line 188) is a
  good principle but does not say what "winning at 12 months" looks like.
- No named first users. The brainstorming skill would have forced "who are the
  first 10 people who will use this, by name or by archetype". `VISION.md`
  §"Who We Build For First" describes archetypes, not validation targets.
- Principle #2 ("Roles are responsibility boundaries, not personas",
  lines 164–174) is a strong claim, but the blueprint then hard-codes seven
  specific roles without user research. There is an unprocessed jump between
  the principle and the action.

### 1.2 Planning (`PRODUCT_BLUEPRINT.md`)

**Strengths.** Phase 0 → 5 is clear. Non-goals are explicit. The §18 "gaps"
list is unusually honest for a planning doc.

**Gaps under the framework.**

- **Unvalidated assumptions are not flagged as assumptions.** The doc asserts
  solo founders already use Claude Code / Codex and want a curation layer, but
  cites no user interviews.
- **Role set is intuition, not evidence.** Seven roles (PM, Growth,
  Monetization, Engineer, QA, Reviewer, Coordinator) are committed early.
  §18缺失4 admits role quality "may be make-or-break" — yet the set is locked
  before any user validates it.
- **Phase 0 ("manual validation") has no surviving artifact.** There is no
  note in the repo of "I ran the workflow on paper / by hand and observed X".
- **Monetization role silently disappears** between blueprint (§5.2, §13) and
  spec (§6 lists only PM/Growth/Engineer/QA). The drop is undocumented.
- **KB boundary vs `sources/`** tension is acknowledged (§4.1 vs §5.7) but
  unresolved. Without an explicit guardrail, `sources/` is likely to drift
  into a lightweight KB.

### 1.3 Spec (`CONTEXTSPEC_V0_1_SPEC.md`)

**Strengths.** Mechanical invariants are extremely testable: byte-stability
(§5.6), include resolution order (§5.3), section routing (§5.7), dedup
semantics (§4.5), frontmatter ↔ body parity for sources (§5.8). The spec also
mandates a golden example before code (§13).

**Gaps under the framework.**

- **Semantic templates are under-specified.** `initiatives/<id>/context-map.md`
  has a purpose statement (§8.1) but no template. `## Review Checklist` and
  `## Output Contract` appear in §5.2 with no rules for what populates them.
- **Acceptance criteria are user-flow level, not snapshot level.** §12 says
  "`contextspec pack ...` produces Markdown" but gives no golden snippet of
  what a correct pack looks like for a known input. TDD-grade contracts would
  pin output bytes for a fixture.
- **No v0.1 → v0.2 migration story.** v0.2 hints exist (§5.6, §8) but there
  is no statement of what compatibility v0.2 will preserve.

### 1.4 Implementation (`docs/v0-1-implementation-notes.md` + merged PRs)

**Strengths.** The implementation-notes file is module-by-module with purpose,
design choice, test coverage, and open questions per module. This is close
to a post-hoc spec and is unusually disciplined for a solo project.

**Gaps under the framework.**

- **Tests followed code.** The `## Sources` substring-matching bug
  (recorded in anti-patterns) was caught by a test added after the fix. A
  red → green TDD loop would have caught it before merge.
- **No per-PR plan or brainstorm artifact.** PRs #4 / #7 / #8 have PR
  descriptions but no `docs/plans/<slice>.md` capturing brainstormed scope,
  open questions, and a verification checklist before code.
- **No `requesting-code-review` checkpoint.** Solo-project reality, but the
  skill exists as a self-review checklist and was not used.
- **No `verification-before-completion` checklist on PRs.** "Tests pass" is
  asserted in commit messages without explicit evidence linkage.

## 2. Cross-cutting patterns

The same shapes appear at every layer.

**Pattern A — Macro flow is right, micro flow is missing.**
VISION → BLUEPRINT → SPEC → CODE is itself close to brainstorming → spec →
plan → implement. But each merged PR did not run that loop at its own scale.
Per-slice spec and plan documents are absent.

**Pattern B — Mechanical contracts are tight, semantic contracts are loose.**
Routing, ordering, dedup, byte-stability are all testable. What a *good*
`context-map.md` or `## Review Checklist` looks like is not. The compiler can
be byte-correct while the output is unhelpful to an agent.

**Pattern C — Unvalidated assumptions are not registered.**
No artifact lists "we assume X; observation Y would falsify it". The
blueprint's §18 gaps come closest but frames them as design TBDs, not as
empirical hypotheses.

**Pattern D — Dogfood is missing.**
The repo ships `examples/improve-team-invite-conversion/` for outside readers.
ContextSpec itself does not have a `.contextspec/`. The cheapest, highest
signal-to-noise validation of v0.1 — running ContextSpec on the ContextSpec
project — has not been done.

**Pattern E — Silent drops and silent drift.**
The Monetization role disappears between blueprint and spec without
explanation. The KB-boundary / `sources/` tension is named but unresolved.
In a single-author project there is no reviewer to ask "why did this go
away?". A registered open-questions log is the substitute.

## 3. Biggest risk

> v0.1 is polishing the byte-stability of the compiler, but the product's
> core value claim — that role-based context packs make coding agents produce
> better PM / Growth / Engineer reviews — has not been observed once with a
> real user on a real task.

The blueprint's user journey (§14) is Create → Review → Handoff → Status →
Retro. v0.1 ships only Create + Pack. Review / Handoff / Retro are deferred.
But Pack generation is a means; review quality is the end. The thesis is
currently unsupported by evidence.

Under "useful before intelligent" + "verification before completion", the
next investment should not be more compiler features. It should be one
end-to-end run: take an existing pack, give it to Claude Code, do a real
review on a real PR, and write down what helped, what was unused, and what
was missing.

## 4. Recommended next moves

Ordered by ROI (highest first). All are cheap; none require new code.

1. **Dogfood ContextSpec on itself.** Add `.contextspec/` to this repo. Create
   one initiative — e.g. `v0-2-planning` — with `brief.md`,
   `context-map.md`, `decisions.md`, and a `reviews/pm.md` produced by
   Claude Code from a real pack. This will surface every under-specified
   semantic template within an afternoon.

2. **One end-to-end review trial.** Pick a real PR in this repo. Generate a
   pack for `engineer-review` and a pack for `pm-review`. Run both via Claude
   Code. Record observations in `docs/v0-1-dogfood-notes-<date>.md`: which
   pack sections were referenced, which were ignored, which were missing.

3. **Register open assumptions.** New file `docs/open-questions.md` listing
   6–10 unvalidated hypotheses with their falsifiers. Seed it with: the
   seven-role set, the KB boundary, the Monetization-role drop, the
   `sources/` drift risk, the assumption that solo founders will edit YAML.

4. **Per-slice spec for v0.2 work.** Each v0.2 PR gets a `docs/plans/<slice>.md`
   written before code: scope, out-of-scope, golden examples, verification
   checklist. The PR cannot merge without ticking the verification list.

5. **Add semantic contracts to the spec.** For `context-map.md`,
   `## Review Checklist`, and `## Output Contract`, add a minimal positive
   example and a minimal negative example to `CONTEXTSPEC_V0_1_SPEC.md`. This
   converts "we'll see what good looks like" into "here is what good looks
   like".

## Out of scope for this review

- Protocol changes to v0.1 (this review is methodology only).
- Code review of merged implementation. The implementation appears to match
  the spec by inspection of `v0-1-implementation-notes.md`; a separate
  pass with the `code-review` skill would verify that claim.
- Market / positioning critique. The vision is taken as given.
