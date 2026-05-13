# ContextSpec v0.1 Spec

This document turns the product blueprint into an implementation-ready v0.1 protocol.

ContextSpec v0.1 is intentionally small: a local file protocol, a registry, templates, and a context pack compiler for Claude Code and Codex workflows.

---

## 1. Goals

ContextSpec v0.1 should make a project usable by coding agents without repeatedly re-explaining product and role context.

v0.1 must support:

1. A local `.contextspec/` directory.
2. A `registry.yaml` file that declares context, roles, domains, projects, initiatives, and external sources.
3. Role templates for PM, Growth, Engineer, and QA.
4. Initiative templates for active work.
5. Markdown context pack generation.
6. Claude Code command generation.
7. Codex `AGENTS.md` generation.

---

## 2. Non-goals

v0.1 does not include:

1. A UI.
2. Cloud sync.
3. Permissions.
4. Vector search.
5. Automatic RAG over raw documents.
6. Notion, Obsidian, or Logseq sync.
7. Large-scale document ingestion.
8. Multi-agent orchestration.
9. Team member management.
10. Deep Linear, Jira, or GitHub integration.

ContextSpec v0.1 may reference personal knowledge bases, but it does not manage them.

---

## 2.1 Context and Knowledge Taxonomy

ContextSpec separates raw knowledge from agent-ready context.

Knowledge is source material. Context is selected, structured, task-relevant knowledge prepared for a role and workflow.

v0.1 uses five layers:

```text
Layer 0: Raw Knowledge
Layer 1: Curated Knowledge
Layer 2: Structured Context
Layer 3: Task Context
Layer 4: Compiled Context Pack
```

### Layer 0: Raw Knowledge

Raw knowledge usually lives outside ContextSpec by default.

Examples:

- personal notes
- customer interview transcripts
- meeting notes
- product journals
- research docs
- raw decision drafts

Raw knowledge may be referenced through `sources`, but it is not automatically copied into `.contextspec/`.

### Layer 1: Curated Knowledge

Curated knowledge is reviewed, compressed, reusable knowledge that can become part of `.contextspec/`.

Examples:

- confirmed customer feedback
- experiment results
- lessons learned
- product principles
- engineering anti-patterns
- stable business constraints

Curated knowledge usually lives in:

- `memory/`
- `domains/`
- `context.md`
- `principles.md`
- `constraints.md`

### Layer 2: Structured Context

Structured context is curated knowledge organized by purpose.

| Category | Location | Purpose |
|---|---|---|
| Global context | `context.md`, `principles.md`, `glossary.md`, `constraints.md` | Product-wide facts, principles, terms, and constraints. |
| Role context | `roles/*.md` | Responsibilities, review criteria, output contracts, and limits. |
| Domain context | `domains/*` | Business-area flows, metrics, decisions, and constraints. |
| Initiative context | `initiatives/*` | Current work, plans, tasks, acceptance, decisions, and retro. |
| Project context | `projects/*.md` | Repo, stack, tests, deployment, and engineering constraints. |
| Memory | `memory/*` | Confirmed long-term lessons, feedback, results, and anti-patterns. |
| Source references | `sources/*` and `registry.yaml.sources` | External knowledge locations and reference boundaries. |

### Layer 3: Task Context

Task context is the selected subset of structured context needed for a specific role and task.

Example:

```yaml
role: growth
task: review
initiative: improve-team-invite-conversion
project: web-app
domains:
  - onboarding
```

### Layer 4: Compiled Context Pack

A context pack is the generated Markdown artifact given to Claude Code, Codex, or another coding agent.

It should contain only what the current role and task need. A context pack is generated output, not the source of truth.

### Placement Rules

Use these rules when deciding where content belongs:

| If the content is... | Put it in... |
|---|---|
| Raw notes, transcripts, journals, or long documents | External source / `sources` |
| Stable product facts | `context.md` |
| Principles or red lines | `principles.md` / `constraints.md` |
| Role responsibilities or review standards | `roles/*.md` |
| Business-area flows, metrics, or decisions | `domains/*` |
| Current feature, project, or experiment work | `initiatives/*` |
| Repo-specific technical constraints | `projects/*.md` |
| Confirmed long-term lessons | `memory/*` |
| Current task input for an agent | Generated context pack |

---

## 3. File Layout

A minimal v0.1 project uses this layout:

```text
.contextspec/
  context.md
  principles.md
  glossary.md
  constraints.md

  roles/
    pm.md
    growth.md
    engineer.md
    qa.md

  domains/
    onboarding/
      context.md
      flows.md
      metrics.md
      decisions.md

  initiatives/
    improve-team-invite-conversion/
      brief.md
      context-map.md
      plan.md
      tasks.md
      acceptance.md
      decisions.md
      reviews/
        <role>.md
      packs/
        <role>-<task>.md
      retro.md

  projects/
    web-app.md

  memory/
    README.md

  sources/
    <curated-reference>.md

  registry.yaml
```

Notes on the layout:

1. `memory/` only ships with a `README.md` placeholder describing the schema. Files like `lessons.md`, `experiment-results.md`, `customer-feedback.md`, and `anti-patterns.md` are created on demand when the user actually has content. v0.1 must not generate empty memory files at `init`.
2. `.contextspec/sources/*.md` holds curated reference notes that may link into external sources via the `source://` syntax in §5.4. It is not the same thing as the top-level `sources:` map in `registry.yaml`, which declares external roots; see §8.2.
3. `initiatives/<id>/reviews/<role>.md` is where role review outputs are written. The filename is always `<role>.md`.
4. `initiatives/<id>/packs/<role>-<task>.md` is where compiled context packs are written. See §7.2.

### 3.1 Path Resolution

| Field | Resolved relative to |
|---|---|
| `context.includes[*]` | `.contextspec/` |
| `roles.<id>.file` | `.contextspec/` |
| `roles.<id>.includes[*]` | `.contextspec/` |
| `domains.<id>.includes[*]` | `.contextspec/` |
| `projects.<id>.includes[*]` | `.contextspec/` |
| `projects.<id>.repo` | `.contextspec/` (i.e. `../web-app` means a sibling of the project root containing `.contextspec/`) |
| `initiatives.<id>.path` | `.contextspec/` |
| `sources.<id>.path` | The user's home (supports `~`) or absolute paths only |

Absolute paths and `~` paths are allowed only for `sources.<id>.path`. All other fields must use paths relative to `.contextspec/`.

---

## 4. `registry.yaml` Schema

### 4.1 Required Top-level Fields

```yaml
version: 0.1
context:
  includes: []
roles: {}
```

### 4.2 Optional Top-level Fields

```yaml
sources: {}
domains: {}
projects: {}
initiatives: {}
```

### 4.3 Example

```yaml
version: 0.1

context:
  includes:
    - context.md
    - principles.md
    - glossary.md
    - constraints.md

sources:
  personal_knowledge_base:
    type: markdown_dir
    path: ~/ObsidianVault
    include:
      - Product/**
      - Customers/**
      - Decisions/**
    exclude:
      - Daily/**
      - Private/**
    mode: reference_only

roles:
  growth:
    file: roles/growth.md
    includes:
      - context.md
      - principles.md
      - memory/experiment-results.md

  engineer:
    file: roles/engineer.md
    includes:
      - context.md
      - principles.md
      - memory/anti-patterns.md

domains:
  onboarding:
    includes:
      - domains/onboarding/context.md
      - domains/onboarding/flows.md
      - domains/onboarding/metrics.md
      - domains/onboarding/decisions.md

projects:
  web-app:
    repo: ../web-app
    includes:
      - projects/web-app.md

initiatives:
  improve-team-invite-conversion:
    path: initiatives/improve-team-invite-conversion
    roles:
      - growth
      - engineer
    domains:
      - onboarding
    projects:
      - web-app
```

### 4.4 Field Rules

| Field | Required | Notes |
|---|---:|---|
| `version` | Yes | Must be `0.1` for this spec. |
| `context.includes` | Yes | Ordered list of global context files. |
| `roles.<id>.file` | Yes | Role definition file. |
| `roles.<id>.includes` | No | Extra files loaded for this role. |
| `domains.<id>.includes` | No | Domain files loaded when an initiative references the domain. |
| `projects.<id>.repo` | No | Repo path. Resolved relative to `.contextspec/` (see §3.1). Absolute paths allowed. |
| `projects.<id>.includes` | No | Project constraint files. |
| `initiatives.<id>.path` | Yes, when initiative is registered | Initiative directory path. |
| `initiatives.<id>.roles` | No | Roles relevant to the initiative. |
| `initiatives.<id>.domains` | No | Domains relevant to the initiative. |
| `initiatives.<id>.projects` | No | Projects relevant to the initiative. |
| `sources.<id>.type` | No | v0.1 only defines `markdown_dir`. |
| `sources.<id>.mode` | No | Defaults to `reference_only`. |

### 4.5 Include Resolution

When a context pack is compiled, multiple `includes` lists may name the same file. v0.1 uses these rules:

1. Includes are **additive**. `roles.<id>.includes` does not replace `context.includes`; it is appended after.
2. Duplicates are **deduplicated** by resolved path. The first occurrence wins; later duplicates are silently dropped.
3. Within a single list, files are loaded in **declaration order**. Across lists, the order follows §5.3 (global → role file → role includes → domain → initiative → project → memory → source references).
4. Because of dedup, role/domain/memory `includes` may freely re-list global files for clarity without affecting output.

### 4.6 Missing File Behavior

v0.1 should use conservative file handling:

1. Missing required files fail the command.
2. Missing optional include files produce warnings.
3. Empty sections are allowed but must be marked as empty in generated context packs.
4. A context pack must list skipped files in `## Sources`.

---

## 5. Context Pack Format

Context packs are Markdown files with YAML frontmatter.

### 5.1 Frontmatter

```yaml
---
contextspec_version: 0.1
role: growth
task: review
initiative: improve-team-invite-conversion
project: web-app
generated_at: 2026-05-07T00:00:00Z
sources:
  - context.md
  - principles.md
  - roles/growth.md
  - domains/onboarding/metrics.md
---
```

### 5.2 Body

```md
# Context Pack

## Task

## Global Context

## Role Context

## Domain Context

## Initiative Context

## Project Context

## Relevant Memory

## Review Checklist

## Output Contract

## Sources
```

### 5.2.1 Semantic Guidance for Narrative Sections

The headings in §5.2 are mechanical: the compiler always emits them and routes
files into them by path. But what a reviewer should *write* under
`## Review Checklist` and `## Output Contract` is not a routing question — it
is the difference between a pack that helps and a pack that does not. The
following examples and heuristics are anchored in
`docs/trials/2026-05-13-pr9-review-trial.md`.

**`## Review Checklist` — positive example.**
A good checklist item names another pack file by section, so the reviewer
must cross-reference rather than skim the diff. From the trial, this
shape produced comments a diff-only reviewer could not have made
(trial B13, B14):

```md
- Confirm no slash command writes to `memory/`. (anchor: principles —
  "the CLI never writes to memory")
- Verify any README claim about CI is consistent with the current phase
  in `initiatives/<id>/plan.md`. (anchor: plan — Phase boundaries)
```

**`## Review Checklist` — negative example.**
A checklist phrased as already-resolved suppresses re-examination. The
trial showed pack-assisted reviewers missing five comments the baseline
caught (A7, A10, A12, A14, A15), in part because items framed as
"decided" or "historical" read as closed. Avoid items shaped like:

```md
- The `## Sources` substring-split bug has been fixed.
- The `validate` command is deferred to v0.2.
```

Phrase as *verify still true* rather than *recall that it was decided*:

```md
- Verify any new fixture line containing an inline `## Sources` still
  routes under the parent file's section.
- Verify the live spec, constraints, and decisions agree on which
  commands ship in this initiative.
```

**`## Output Contract` — positive example.**
A good contract line lets an external reviewer mark a PR as missing it
without re-reading the diff. From the trial (B-pm 12):

```md
- Every observed trade-off has a corresponding entry in
  `initiatives/<id>/decisions.md`. A trade-off mentioned only in the PR
  description does not count.
```

**`## Output Contract` — negative example.**
A contract line that cannot be falsified does not constrain the reviewer:

```md
- The review is thorough.
- The review covers all important aspects.
```

**Heuristics.**

- A `## Review Checklist` item should name at least one other pack file by
  section. Topic-only items ("check tests", "check naming") are not strong
  enough to surface multi-file inconsistencies.
- Frame checklist items as *verify still true*, not as *recall the
  decision*. Decided-framings suppress fresh examination.
- An `## Output Contract` line is good only if an external reviewer can
  mark a PR as missing it. If the line cannot fail, it cannot pass either.
- Both sections should be short. A checklist of 30 items is a checklist
  that no reviewer applies.

### 5.3 Loading Order

Context packs should load information in this order:

```text
global context
→ role file
→ role includes
→ domain includes
→ initiative files
→ project includes
→ memory includes
→ source references
```

### 5.4 Source Citations

Each included file should be listed in `## Sources` using its path relative to `.contextspec/` when possible.

External source paths should be listed only when they are explicitly allowed by `sources.*.include` and not excluded by `sources.*.exclude`.

### 5.5 Source Reference Syntax

External knowledge is referenced from curated `.contextspec/` files via Markdown links using the `source://` URI scheme:

```md
See [the original onboarding interview notes](source://personal_knowledge_base/Customers/2026-04-onboarding.md) for raw quotes.
```

Rules:

1. The host segment (`personal_knowledge_base` above) must match a key in `registry.yaml` under `sources:`.
2. The path segment is resolved relative to that source's `path`.
3. The pack compiler must verify that the resolved path matches the source's `include` patterns and is not in `exclude`. Disallowed references emit a warning and are dropped from `## Sources`.
4. Allowed references are listed in `## Sources` as `source://<id>/<path>` (not as absolute filesystem paths).
5. v0.1 never inlines external content. `source://` links remain links; the pack compiler must not copy file contents from external sources.

### 5.6 Compilation Strategy

v0.1 packs are compiled by **deterministic concatenation**, not summarization. The compiler must not require an LLM and must produce byte-stable output for a given set of inputs and a given `generated_at` timestamp.

Rules:

1. Each included file's body is inserted verbatim into the routed section (§5.7). Headings inside a file are preserved as-is.
2. No rewriting, summarization, extraction, or reordering of file contents.
3. Between consecutive files in the same section, the compiler inserts a separator: a blank line, a `### <path-relative-to-.contextspec>` subheading, and a blank line. This makes file boundaries visible to reviewers.
4. Sections that receive no files must still appear in the pack body, marked `_(empty)_`. Empty sections must also be listed in `## Sources` as skipped, per §4.6.
5. Smarter strategies (LLM-driven distillation, per-section token budgets, semantic compression) are deferred. Future versions may opt in via an explicit flag without changing the v0.1 default.

### 5.7 Section Routing

Section assignment is determined by the **path** of the included file, not by which include list referenced it. The same file always lands in the same section even when referenced from multiple include lists.

Routing table:

| Path (relative to `.contextspec/`) | Pack section |
|---|---|
| Any path listed in `context.includes` | `## Global Context` |
| `roles/**` | `## Role Context` |
| `domains/**` | `## Domain Context` |
| `initiatives/<active-initiative>/**` | `## Initiative Context` |
| `projects/**` | `## Project Context` |
| `memory/**` | `## Relevant Memory` |
| `sources/**` | `## Initiative Context` (curated reference notes are treated as initiative-scoped narrative) |
| `source://` link | `## Sources` only (never inlined into a body section) |
| Any other path | `## Role Context` with a warning |

Additional rules:

1. `initiatives/<other>/**` paths (initiatives other than the one being compiled) are not included automatically. If explicitly named in another initiative's include list, they route to `## Initiative Context` and the compiler emits a warning that cross-initiative inclusion is rare.
2. `packs/**` is **excluded from routing**. Compiled packs are derived artifacts and must never be re-included into another pack.
3. Initiative-file loading order within `## Initiative Context`:
   1. `brief.md`
   2. `context-map.md`
   3. `plan.md`
   4. `tasks.md`
   5. `acceptance.md`
   6. `decisions.md`
   7. any other top-level initiative files, alphabetically
   8. `reviews/<role>.md` for each role attached to the initiative, in `registry.yaml > initiatives.<id>.roles` declaration order
   9. `retro.md`
4. The role file (`roles/<id>.md`) is loaded before any other `roles/**` includes, even if registered later.

### 5.8 Frontmatter `sources` and `## Sources`

`sources:` in the pack frontmatter and the `## Sources` body section must list **the same items in the same order**. They are two views of the same list.

Order:

1. Tiers follow §5.3 loading order: global → role file → role includes → domain → initiative → project → memory → `source://` references.
2. Within each tier, items follow declaration order in `registry.yaml`. For initiative files, the order in §5.7 applies.
3. Deduplication is by resolved path (§4.5); only the first occurrence is listed.
4. `source://` links always appear last, in the order they were encountered while walking the curated `.contextspec/` files in §5.3 order.
5. Items are formatted as paths relative to `.contextspec/` (e.g. `roles/growth.md`) or as `source://<id>/<path>` for external references. The two formats are intentionally distinguishable so a reader knows whether the file is local or external.
6. Skipped or missing files (per §4.6) are listed at the end of `## Sources` under a `_skipped:_` italic line, but are not added to the frontmatter `sources:` array.

---

## 6. Role Template Format

Each role file should use the same headings so agents can rely on stable structure:

```md
# Growth Manager

## Mission

## Owns

## Needs

## Reviews

## Output Contract

## Cannot Decide

## Checklist

## Common Mistakes

## Suggested Memory Updates
```

v0.1 built-in roles:

1. `pm`
2. `growth`
3. `engineer`
4. `qa`

Additional roles can be added by users, but the CLI only needs to generate the four built-ins for v0.1.

`PRODUCT_BLUEPRINT.md` §5.2 lists seven roles. The drop from seven to four
for v0.1 is recorded in `docs/decisions/2026-05-13-drop-monetization-role.md`.

---

## 7. Initiative Template Format

`contextspec create initiative <name>` should generate:

```text
brief.md
context-map.md
plan.md
tasks.md
acceptance.md
decisions.md
reviews/
retro.md
```

### 7.1 Required Initiative Files

| File | Purpose |
|---|---|
| `brief.md` | Problem, user, goal, non-goals. |
| `context-map.md` | Related roles, domains, projects, memory, and sources. |
| `plan.md` | Proposed execution plan. |
| `tasks.md` | Work breakdown. |
| `acceptance.md` | Acceptance criteria. |
| `decisions.md` | Decisions made during the initiative. |
| `retro.md` | Post-completion learning and proposed memory updates. |

`reviews/` holds role review outputs. v0.1 uses the filename convention `reviews/<role>.md` (e.g. `reviews/growth.md`, `reviews/qa.md`). Multiple reviews from the same role overwrite the file by default; historical versions are preserved through git.

### 7.2 Pack Output Location

`contextspec pack --role <role> --initiative <name> --task <task>` writes the compiled context pack to:

```text
.contextspec/initiatives/<name>/packs/<role>-<task>.md
```

Rules:

1. If `--task` is omitted, the default task is `review`, producing `<role>-review.md`.
2. Existing pack files are overwritten without prompting. Packs are derived artifacts.
3. Packs **should be committed** to git in v0.1 so reviewers can diff them. Users who prefer not to commit derived files may add `.contextspec/initiatives/*/packs/` to `.gitignore`.
4. The CLI may also print the pack to stdout via a `--stdout` flag (deferred); v0.1 only requires the file output.

---

## 8. Source Reference Rules

Sources represent external knowledge locations such as personal notes or customer interview folders.

v0.1 source behavior:

1. Sources are read-only.
2. `mode` defaults to `reference_only`.
3. Source content is not automatically copied into `.contextspec/`.
4. Source content is not automatically embedded into context packs.
5. Source paths may appear in `## Sources` only when explicitly referenced by curated `.contextspec/` files.
6. Any proposed import from a source must be user-confirmed before it becomes memory, domain context, or global context.

A future version may add import helpers, but v0.1 only defines the boundary.

### 8.1 `context-map.md` vs `registry.yaml` initiatives

Both `registry.yaml` and `initiatives/<id>/context-map.md` describe what an initiative depends on. Their roles are different and must not be conflated:

| Artifact | Audience | Purpose |
|---|---|---|
| `registry.yaml > initiatives.<id>` | Pack compiler (machine) | Declares which roles, domains, and projects the pack loader should attach. |
| `initiatives/<id>/context-map.md` | Humans and reviewing agents | Narrative explaining *why* those roles, domains, projects, memory items, and sources are relevant, and noting items that were considered and excluded. |

The compiler reads only `registry.yaml`. `context-map.md` is included verbatim into the pack's `## Initiative Context` section.

#### What makes a good `context-map.md`

The map's job is to make multi-file linkages legible. Examples anchored in
`docs/trials/2026-05-13-pr9-review-trial.md`.

**Positive example.**
A map paragraph that names two or more other pack files so the reviewer
reads them together. From the trial (B-pm 1), this shape revealed an
internal contradiction between `constraints.md` and `decisions.md` that
neither file alone showed:

```md
This initiative depends on the cli project (`projects/cli.md`) and on the
v0.1 spec's command surface (`constraints.md` §Technical). It revises
two earlier decisions, so `decisions.md` must be read together with
`constraints.md` — they describe overlapping scope and any divergence
between them is a bug.
```

**Negative example.**
A map that only restates `registry.yaml`. Trial reviewers gained no extra
signal from this shape; it duplicated machine information without adding
narrative:

```md
This initiative includes the engineer role, the cli project, and the
finish-line memory section.
```

**Heuristics.**

- Each paragraph should name at least two other pack files and say *why
  they should be read together*, not just *that they are included*.
- Note what was *considered and excluded*, not only what is included. The
  exclusion list is often the more informative half.
- If a paragraph could be deleted without losing information that is not
  already in `registry.yaml`, delete it.

### 8.2 `registry.sources` vs `.contextspec/sources/`

These two are easy to confuse. v0.1 keeps them strictly separate:

| Name | What it is | Owned by |
|---|---|---|
| `registry.yaml > sources` | Machine-readable declaration of external roots (e.g. an Obsidian vault path) with `include` / `exclude` globs and `mode`. | The protocol. |
| `.contextspec/sources/*.md` | Human-curated reference notes inside the project that link out via `source://` (§5.5). | The user. |

A `source://<id>/...` link only resolves if `<id>` exists in `registry.yaml > sources`. The `.contextspec/sources/` directory is optional; users may choose to embed `source://` links anywhere in `.contextspec/` instead.

---

## 9. CLI Commands

v0.1 implementation should prioritize the smallest useful command set:

```bash
contextspec init
contextspec create initiative <name>
contextspec pack --role <role> --initiative <name> [--project <project>] [--task <task>]
contextspec generate claude
contextspec generate codex
```

### 9.1 Deferred Commands

These commands are useful but can be implemented after the context pack compiler works:

```bash
contextspec review --role <role> --initiative <name>
contextspec handoff --from <role> --to <role> --initiative <name>
contextspec status
contextspec retro <initiative>
```

---

## 10. Claude Code Integration

`contextspec generate claude` should create Markdown slash commands under:

```text
.claude/commands/
  pm-review.md
  growth-review.md
  engineer-handoff.md
  qa-review.md
  context-status.md
  context-retro.md
```

A generated review command should instruct Claude Code to:

1. Load or generate a context pack for the requested initiative.
2. Use the selected role.
3. Follow the role output contract.
4. Include risks, open questions, and source references.

---

## 11. Codex Integration

`contextspec generate codex` should generate or update `AGENTS.md`.

The generated instructions should tell Codex to:

1. Read `.contextspec/context.md` before non-trivial changes.
2. Read relevant role files from `.contextspec/roles/`.
3. Read initiative context when an initiative is named.
4. Use `contextspec pack` when available.
5. Propose memory updates during retro work, but not write them without user confirmation.

---

## 12. v0.1 Acceptance Criteria

v0.1 is acceptable when a user can:

1. Run `contextspec init` and get a valid `.contextspec/` directory.
2. Run `contextspec create initiative improve-team-invite-conversion` and get initiative files.
3. Run `contextspec pack --role growth --initiative improve-team-invite-conversion` and get a Markdown context pack.
4. Generate Claude Code commands.
5. Generate Codex `AGENTS.md` instructions.
6. Inspect all generated files in git.
7. Understand how personal knowledge bases are referenced without being imported wholesale.
8. Verify byte-stability: regenerating a pack from
   `examples/improve-team-invite-conversion/` under a fixed `generated_at`
   produces a file byte-identical to the committed fixture.

---

## 13. Recommended Next Artifact

Before implementing the CLI, create a hand-written example project at:

```text
examples/improve-team-invite-conversion/
```

The example should include a complete `.contextspec/` directory and at least one generated context pack under `initiatives/<id>/packs/`. This validates the protocol before code is written.

---

## 14. Changelog

This changelog tracks substantive edits to the v0.1 protocol so downstream implementations can detect when assumptions change. Each entry should describe what changed and why, not who edited it.

### 2026-05-08 — Context and knowledge taxonomy

Aligned the protocol with the README and product blueprint by making the context-vs-knowledge boundary explicit in the spec.

- §2.1: added a five-layer taxonomy (`Raw Knowledge -> Curated Knowledge -> Structured Context -> Task Context -> Compiled Context Pack`).
- §2.1: defined the purpose of each layer and clarified that raw knowledge may be referenced via `sources` without being imported into `.contextspec/`.
- §2.1: added a structured-context category table covering global, role, domain, initiative, project, memory, and source-reference context.
- §2.1: added placement rules to clarify where facts, principles, role guidance, initiative work, project constraints, and long-term lessons belong.

### 2026-05-08 — Pack compilation rules (post-example)

Surfaced while writing `examples/improve-team-invite-conversion/`. The hand-written packs forced three previously-implicit decisions that the v0.1 CLI must commit to. All three are additive; existing rules are unchanged.

- §5.6 Compilation Strategy: v0.1 packs are deterministic concatenation only. No LLM, no summarization. Byte-stable output for a given input set and `generated_at`. File boundaries are made visible via `### <path>` separators between consecutive files in the same section.
- §5.7 Section Routing: a routing table maps each included file's **path** to a pack section. Routing is path-based, not include-list-based, so the same file always lands in the same section even when referenced from multiple lists. `packs/**` is excluded from routing entirely. Initiative files have a defined load order (`brief → context-map → plan → tasks → acceptance → decisions → others alphabetical → reviews/<role>.md → retro`).
- §5.8 Frontmatter `sources` and `## Sources`: the two are required to list the same items in the same order, with `source://` links always last and skipped items in an italic `_skipped:_` trailer in the body section only.

### 2026-05-07 — Protocol clarifications (pre-implementation)

Clarified eight ambiguities surfaced while preparing the first hand-written example. No semantic changes that break the original spec; all edits are additive constraints that previously implicit decisions now make explicit.

- §3 File Layout: `memory/` ships only with `README.md`; empty memory files are no longer auto-generated. Added `initiatives/<id>/packs/` and `reviews/<role>.md`.
- §3.1 Path Resolution: new table specifying which fields are relative to `.contextspec/` and which allow absolute / `~` paths.
- §4.4: `projects.<id>.repo` resolution rule made explicit.
- §4.5 Include Resolution: includes are additive and deduplicated by resolved path; first occurrence wins.
- §5.5 Source Reference Syntax: introduced the `source://<id>/<path>` Markdown link convention with allow/deny enforcement against `registry.sources`.
- §7 Reviews filename convention fixed as `reviews/<role>.md`.
- §7.2 Pack Output Location: packs land in `initiatives/<name>/packs/<role>-<task>.md`; default task is `review`; packs are committed by default.
- §8.1: clarified that `context-map.md` is human narrative, while `registry.yaml > initiatives` is the machine-readable mapping consumed by the compiler.
- §8.2: clarified that `registry.yaml > sources` (external roots) and `.contextspec/sources/*.md` (curated reference notes) are different objects.

### 2026-05-13 — Semantic guidance for narrative pack sections

- §5.2.1 added: positive and negative examples plus four heuristics for
  `## Review Checklist` and `## Output Contract`. Anchored in the
  end-to-end review trial at `docs/trials/2026-05-13-pr9-review-trial.md`.
- §8.1 sub-section added: positive and negative examples plus three
  heuristics for `context-map.md`.
- §12 acceptance criterion #8 added: byte-stable regeneration against the
  committed example fixture is now part of the acceptance contract.
