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
      retro.md

  projects/
    web-app.md

  memory/
    lessons.md
    experiment-results.md
    customer-feedback.md
    anti-patterns.md

  sources/
    personal-knowledge.md

  registry.yaml
```

All paths in `registry.yaml` are resolved relative to `.contextspec/`, except explicit absolute paths and `~` paths in `sources`.

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
| `projects.<id>.repo` | No | Relative or absolute repo path. |
| `projects.<id>.includes` | No | Project constraint files. |
| `initiatives.<id>.path` | Yes, when initiative is registered | Initiative directory path. |
| `initiatives.<id>.roles` | No | Roles relevant to the initiative. |
| `initiatives.<id>.domains` | No | Domains relevant to the initiative. |
| `initiatives.<id>.projects` | No | Projects relevant to the initiative. |
| `sources.<id>.type` | No | v0.1 only defines `markdown_dir`. |
| `sources.<id>.mode` | No | Defaults to `reference_only`. |

### 4.5 Missing File Behavior

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

---

## 13. Recommended Next Artifact

Before implementing the CLI, create a hand-written example project at:

```text
examples/improve-team-invite-conversion/
```

The example should include a complete `.contextspec/` directory and at least one generated context pack. This validates the protocol before code is written.
