# ContextSpec User Guide

This guide explains **what you can do with ContextSpec and how to do it**, end to
end. ContextSpec is a local-first, role-based context layer for coding agents:
you define your product, role, and project context once, and compile it into a
task-scoped *context pack* for whatever role and initiative you're working on —
instead of re-explaining your background to Claude Code or Codex in every
session.

It does not write code, run an LLM, or sync to the cloud. It is a deterministic
compiler that turns reviewed Markdown into agent-ready context.

---

## 1. Mental model

```
.contextspec/ (you author)  ──contextspec compiler──▶  context pack (per role + task)
                                       │
                                       ├─▶ Claude Code slash commands (.claude/commands/)
                                       └─▶ Codex AGENTS.md (managed block)
```

- You curate a small set of Markdown files under `.contextspec/`.
- `registry.yaml` declares which files each role loads and which roles/domains/
  projects an initiative is attached to.
- `contextspec pack` compiles **only the slice relevant to one role + task +
  initiative** into a single Markdown pack.
- Host adapters (`generate-claude`, `generate-codex`) expose that same protocol
  as slash commands and `AGENTS.md` so the agent runs it for you.

The source of truth is the files, not the generated output.

---

## 2. Install

ContextSpec is not yet published to npm. Use a local link from the checkout:

```bash
cd /path/to/contextspec     # this repo
npm install && npm run build
npm link                    # puts `contextspec` on PATH
contextspec --version       # -> 0.1.0
```

`npm link` matters: the generated slash commands and `AGENTS.md` call
`contextspec pack ...` literally, so the binary must be on PATH for them to work.

Alternative without linking: call the bin directly —
`node /path/to/contextspec/bin/contextspec.js <command>`.

Once published, this section becomes `npm i -g contextspec`.

---

## 3. Five-minute quickstart

Run these in the **real project** you want agent context for.

```bash
cd ~/your-product

# 1. Scaffold .contextspec/
contextspec init

# 2. Fill the minimum (see §6 — don't fill everything):
#    context.md, principles.md, constraints.md, and the one role you'll use.

# 3. Create an initiative for a real piece of work you're about to do
contextspec create-initiative add-csv-export --role engineer

# 4. Fill its brief.md (problem / why now / out of scope)

# 5. Wire up your agent
contextspec generate-claude    # .claude/commands/*.md
contextspec generate-codex     # AGENTS.md managed block

# 6. Sanity-check the setup
contextspec validate           # exit 0 = consistent

# 7. Use it
contextspec pack --role engineer --initiative add-csv-export --task handoff --stdout
#   ...or, inside Claude Code:   /engineer-handoff add-csv-export
```

That's the whole loop. The rest of this guide is detail.

---

## 4. What you can do (capability map)

| You want to… | Do this |
|---|---|
| Set up context for a project | `contextspec init`, then edit the Markdown |
| Start a tracked piece of work | `contextspec create-initiative <id> [--role …]` |
| Get a role's view of an initiative | `/pm-review <id>` · `/growth-review <id>` · `/engineer-review <id>` (or `pack --task review`) |
| Hand work from one role to another | `/engineer-handoff <id>` (or `pack --task handoff`) |
| Compile context for any agent / any tool | `contextspec pack … --stdout` and paste / pipe |
| See current state across initiatives | `/context-status` |
| Capture lessons after finishing | `/context-retro <id>`, then confirm the suggested memory edits |
| Reference external notes (Obsidian, etc.) | declare a `source:` in `registry.yaml`, link via `source://id/path` |
| Check the setup is consistent | `contextspec validate [--strict]` |
| Refresh slash commands / AGENTS.md | re-run `generate-claude` / `generate-codex` (idempotent) |

---

## 5. Concepts and file layout

`contextspec init` creates:

```
.contextspec/
  context.md          # what the product is, who it's for, current stage + goal
  principles.md       # the trade-offs and red lines that must hold
  glossary.md         # shared vocabulary
  constraints.md      # hard limits: stack, compliance, what cannot change
  roles/
    pm.md             # each role: Mission / Owns / Needs / Reviews /
    growth.md         #   Output Contract / Cannot Decide / Checklist / ...
    engineer.md
  memory/
    anti-patterns.md      # append-only: pitfalls you've hit
    experiment-results.md # append-only: wins, losses, nulls
  registry.yaml       # the source of truth: roles, includes, attachments
```

These are **added by hand** when you need them (commented templates live in
`registry.yaml`):

- **`roles/qa.md`** — a QA role. Add the file, then a `qa:` entry under `roles:`.
- **`domains/<name>/`** — business-area context (flows, metrics, decisions for
  onboarding, billing, …). Attach to an initiative via `initiatives.<id>.domains`.
- **`projects/<name>.md`** — per-repo engineering context (stack, test/deploy
  conventions). Attach via `initiatives.<id>.projects`.
- **`sources:`** — external knowledge bases referenced read-only (see §9).

An **initiative** (`contextspec create-initiative`) is a unit of work:

```
initiatives/<id>/
  brief.md         # problem, why now, out of scope
  context-map.md   # pointers into the rest of .contextspec for this work
  plan.md          # phased approach
  tasks.md         # concrete units
  acceptance.md    # observable done criteria
  decisions.md     # decisions that bind this initiative
  reviews/<role>.md (optional)  # role review outputs
  retro.md         (optional)   # lessons after closing
  packs/           # COMPILED OUTPUT — generated, gitignore this
```

You don't have to fill every file. Fill what carries signal; leave the rest.

### Where does X go? (placement rules)

```
Stable product facts        -> context.md
Principles / red lines       -> principles.md / constraints.md
Business-area knowledge      -> domains/<name>/
Current work                 -> initiatives/<id>/
Repo / deploy constraints    -> projects/<name>.md
How a role judges things     -> roles/<role>.md
Confirmed long-term lessons  -> memory/
Raw external notes           -> stay external; reference via source://
```

Rule of thumb: only curated, task-relevant context belongs here. ContextSpec is
not a place to dump every note — that's what `source://` references are for.

---

## 6. Authoring your context (the part that decides whether this is worth it)

The templates are opinionated, not blank — but you should **not** rewrite them
word-for-word on day one. That itself is a "re-explain everything" tax. First
pass, fill only:

1. **`context.md`** — ~5 lines: product, user, stage, current top goal.
2. **`principles.md`** — 3–5 bullets of real trade-offs ("don't add onboarding
   friction for growth").
3. **`constraints.md`** — hard nos (stack, compliance, untouchable areas).
4. **The one role you'll actually use** — usually `roles/engineer.md`. Adjust its
   **Output Contract** and **Checklist** to your project. Leave other roles as
   template until you use them.

Everything else (`glossary.md`, unused roles, domains, projects) can wait until a
real task needs it. Grow the context as the agent's gaps reveal what's missing —
that's the intended loop, not an upfront documentation project.

---

## 7. The everyday workflows

### 7.1 Review an initiative from a role's perspective

Inside Claude Code:

```
/pm-review add-csv-export
/growth-review add-csv-export
/engineer-review add-csv-export
```

Or from the CLI (feed the pack to any agent):

```bash
contextspec pack --role pm --initiative add-csv-export --stdout
```

The agent reads the role's **Output Contract** and responds in that shape:
problem framing, risks, checklist, recommendation — grounded in your context, not
just the diff.

### 7.2 Handoff between roles

```
/engineer-handoff add-csv-export
```

```bash
contextspec pack --role engineer --initiative add-csv-export --task handoff --stdout
```

Run this **before** the agent writes code: it produces an engineering brief with
business constraints, acceptance criteria, and risks already loaded.

### 7.3 Compile a pack for any tool

`pack` is the core primitive. Use it with Cursor, Aider, a raw API call, or a
paste:

```bash
# Write to a file (default): initiatives/<id>/packs/<role>-<task>.md
contextspec pack --role engineer --initiative add-csv-export --task handoff

# Or print to stdout to pipe / copy
contextspec pack --role engineer --initiative add-csv-export --task handoff --stdout > brief.md
```

A pack is a single Markdown doc with sections in a fixed order: Task → Global
Context → Role Context → Domain Context → Initiative Context → Project Context →
Relevant Memory → Review Checklist → Output Contract → Sources.

Restrict to one attached project with `--project <name>` when an initiative spans
several repos.

### 7.4 See current status

```
/context-status
```

Reasons over active initiatives, open decisions, and pending reviews from your
`.contextspec/initiatives/*`. (No external project-management integration — it
reads your files.)

### 7.5 Retro: feed lessons back

```
/context-retro add-csv-export
```

The agent **proposes** edits to `memory/`, role checklists, or domain context.
You review and apply them yourself. ContextSpec never writes to `memory/`, role
files, or your prose automatically — confirmed memory only.

---

## 8. Using it across hosts

**Claude Code.** `contextspec generate-claude` writes idempotent slash commands
to `.claude/commands/`. With the default 3 roles you get: `pm-review`,
`growth-review`, `engineer-handoff`, `engineer-review`, plus `context-status` and
`context-retro`. Add a `qa` role to get `qa-review`. Re-running refreshes them
byte-for-byte; your manual edits to other commands are preserved with
`--no-force`.

**Codex.** `contextspec generate-codex` writes a managed block into `AGENTS.md`,
delimited by `<!-- contextspec:begin -->` / `<!-- contextspec:end -->`.
**Everything outside those markers is left untouched** — your own team rules and
conventions survive every regeneration. Re-running is byte-stable.

**Anything else.** Use `contextspec pack … --stdout` and hand the output to the
agent however that tool ingests context.

---

## 9. Referencing external knowledge (`source://`)

Keep raw notes where they live (Obsidian, Notion export, local Markdown) and
reference them read-only. In `registry.yaml`:

```yaml
sources:
  notes:
    type: markdown_dir
    path: ~/notes
    include:
      - "Customers/**"
      - "Decisions/**"
    exclude:
      - "Daily/**"
      - "Private/**"
    mode: reference_only
```

Then link from any curated file:

```md
See the churn interview in [Q2 notes](source://notes/Customers/q2-churn.md).
```

`pack` collects these links into the pack's `## Sources` section and validates
each against the source's `include`/`exclude` globs. `exclude` wins over
`include`. This keeps `.contextspec/` from quietly turning into a second
knowledge base — only references cross the boundary, not raw content.

---

## 10. Keeping the setup healthy

```bash
contextspec validate          # referenced files exist? attachments declared? source:// allowed?
contextspec validate --strict # also flag committed packs that are stale vs sources
contextspec validate --quiet  # exit code only, for scripts/CI
```

Run `validate` after editing `registry.yaml`, before regenerating, and in CI.
Errors are one line each, naming the file and offending key — no stack traces.

**Guarantees you can rely on:**

- **Deterministic.** Same inputs + same `generated_at` → byte-identical output.
  Generated files diff cleanly in PRs.
- **No LLM in compilation.** `pack` is pure file assembly; no network, no model.
- **Never overwrites your authored files.** The CLI only writes: pack output,
  `.claude/commands/*`, the managed block of `AGENTS.md`, and files created by
  `init`/`create-initiative` (unless `--force`). It will not touch your context
  files, role files, `memory/`, or `AGENTS.md` outside its markers.

---

## 11. Command reference

```bash
contextspec init [--cwd <path>] [--force]
contextspec create-initiative <id> [--role <r>]… [--domain <d>]… [--project <p>]… [--force]
contextspec pack --role <r> --initiative <id> [--task <t>] [--project <p>] [--cwd <path>] [--stdout]
contextspec generate-claude [--cwd <path>] [--no-force]
contextspec generate-codex  [--cwd <path>]
contextspec validate [--strict] [--quiet] [--cwd <path>]
```

- `pack --task` defaults to `review`. Use `--task handoff` for handoffs.
- `create-initiative` `--role/--domain/--project` are repeatable; default attaches
  all declared roles.
- Generated packs land in `initiatives/<id>/packs/` — gitignore that directory.

---

## 12. Gotchas

- **Initiative ids are kebab-case only** — lowercase, hyphens, no dots or
  underscores, no leading digit. `add-csv-export` ✓, `add_csv` ✗, `v0.1` ✗.
  Put versions in the brief, not the id.
- **`npm link` (or the full bin path) is required** until publish — otherwise
  generated slash commands can't find `contextspec`.
- **Two command forms work** — `create-initiative` and `create initiative` both
  parse, same for `generate claude/codex`. Prefer the hyphenated single-token
  form; the spaced form can misparse when global flags precede it.
- **`packs/` is generated** — don't hand-edit it; gitignore it. The source files
  are canonical.
- **QA, domains, projects are opt-in** — `init` ships only context + pm/growth/
  engineer. Add the others by editing `registry.yaml` and creating their files.

---

## 13. What ContextSpec is not for

- Not a project-management tool (no tickets, no boards).
- Not a knowledge base or note editor — reference external notes, don't store
  them here.
- Not a code generator or multi-agent orchestrator.
- Not a cloud service — local files under git, by design.

Its one job: give an agent the right structured context for the role and task at
hand, compiled fresh, every time.

---

*See also: [`README.md`](../README.md) for positioning, `VISION.md` for the why,
`CONTEXTSPEC_V0_1_SPEC.md` for the protocol, and
`docs/v0-1-implementation-notes.md` for the implementation.*
