# v0.2 Backlog

Forward-looking parking lot for work that is **out of scope for v0.1**
(`finish-line`). Nothing here starts until v0.1 ships. Each entry is a
*candidate initiative*, not a commitment.

When v0.1 ships, promote an entry with
`contextspec create-initiative <id>` (dogfood the command); this entry
becomes the brief, the captured conclusions become its `decisions.md`,
and any hypothesis it moves gets its status updated in
`docs/open-questions.md`.

Capture conclusions here, not frozen specs — designs below are still
warm and expected to change before they become initiatives.

---

## Candidate 1 — `lower-cold-start`: role-set freedom + assisted context authoring

**Problem.** At `init` today, the cold-start cost is concentrated in the
**project-specific context files** (`context.md`, `principles.md`,
`constraints.md`), which ship as empty `<placeholder>` scaffolds and must
be written from a blank page. Separately, the **role set is hardcoded**:
`init` always writes `pm` + `growth` + `engineer` (`src/init.ts:37-39`),
with no way to choose at init time and no command to add a role
afterward. The repo's own dogfood shows the symptom — it ships
`growth.md` (and a `/growth-review` command) that is dead weight for a CLI
tool with no growth motion (see `finish-line/decisions.md`).

**Strategic framing.** Making roles cheaply extensible is the **relief
valve for H-03** ("four built-in roles are the right minimal set",
currently `untested`). If users can add a role with one command, we no
longer have to predict the role set correctly — the cost of being wrong
drops from "change the protocol" to "run a command". It also reduces
H-05 friction (founders hand-editing YAML).

### Conclusions reached (the stable part)

The right split follows **reusable vs project-specific**:

| Thing | Who supplies it | Mechanism | Fiction risk |
|---|---|---|---|
| Role *definition* (how a role judges) | ContextSpec preset | static, shipped | none — a reusable lens, not a product claim |
| Role *set* (which roles to enable) | ContextSpec **recommends** | **deterministic**: repo detection → archetype map | none |
| Project *context* (product / constraints) | **agent drafts**, human confirms | dynamic, at bootstrap, grounded in the real repo | avoided by grounding + human confirm |

Two anti-patterns this rules out:
- **No static content preset for context files.** Any generic "our
  product is X" is fiction and violates the project's no-fiction stance
  (`VISION.md` "useful before intelligent"; the growth-customization
  rejection in `finish-line/decisions.md`). The honest `<placeholder>`
  is better than plausible boilerplate.
- **No LLM inside the compiler.** Draft generation must not happen inside
  `contextspec init` — that would break the no-LLM-in-compilation
  invariant (H-06). The compiler stays pure; draft generation is a
  **host command** the agent runs (the existing adapter pattern).

### Proposed surface (still warm — for the eventual brief)

```bash
# Choose the role set at init (deterministic; zero new deps):
contextspec init --profile web-saas | dev-tool | api-service | mobile
contextspec init --role pm --role engineer        # explicit set
# Optional TTY sugar (adds a prompt dependency — do this LAST):
contextspec init   # detect → recommend, pre-checked, editable multi-select

# Add a role after init (symmetric with create-initiative; reuses the
# comment-preserving YAML-AST edit; generate-claude then emits its command):
contextspec create-role <id> [--from <known-role>] [--task <task>] [--force]
```

Detection → archetype → role set (a *curated*, human-authored map):

```
package.json has bin / no web framework  -> dev-tool   : engineer (+docs)
next / react / vue                        -> web-saas   : pm, growth, engineer, qa
pyproject + fastapi / flask               -> api-service: engineer, qa
react-native / flutter / ios              -> mobile     : pm, growth, engineer, qa
no clear signal                           -> default web-saas, hint --profile
```

New-role template comes from one of three honest sources:
1. id matches a known preset (`pm`/`growth`/`engineer`) → use that preset;
2. `--from <role>` → clone an existing role as a starting point;
3. genuinely custom (e.g. `designer`) → a **structured skeleton**
   (Mission / Owns / Needs / Reviews / Output Contract / Cannot Decide /
   Checklist). The skeleton is a *shape*, not a product claim — honest.

The agent bootstrap is reserved for **context drafting only**; the role
set is already fixed deterministically by then. The agent may *suggest*
role-set tweaks ("you have a billing module — consider monetization"),
but that is sugar on a deterministic baseline.

### Open decision to make before building

Today only three role presets exist (`pm`/`growth`/`engineer` in
`src/templates.ts`); **QA is referenced in the spec (§10, `qa-review`)
but has no template**. Decide: author curated presets for QA (at least)
and possibly Monetization/Reviewer/Coordinator, or let them fall back to
the generic skeleton until a real need appears. Recommendation: author
**QA** as a preset (the spec already promises `qa-review`); skeleton for
the rest until demand shows.

### Proposed landing order (each independently shippable)

1. **`create-role`** + **author the QA preset** — cheap, testable, zero
   new deps, fits the existing architecture. Delivers "add a role anytime".
2. **`init --profile` / `init --role`** — deterministic selection, still
   zero deps. Delivers "choose roles at init".
3. **Interactive multi-select for `init`** — the only piece that adds a
   prompt dependency + interactivity-testing burden (a codebase that has
   so far stayed dep-light and hand-rolled its glob matcher). Pure UX
   sugar over step 2. Do last, and only if a real user asks.
4. **(separate) agent-assisted context bootstrap** — `generate-claude`
   also emits a `contextspec-bootstrap` command; the host agent reads the
   repo, drafts `context`/`constraints`/`glossary`, human confirms.

### Hypotheses moved

- **H-03** (minimal role set): de-risked — extensibility makes a wrong
  guess cheap rather than protocol-breaking.
- **H-05** (founders edit YAML/MD without friction): reduced friction on
  the scariest edit (`registry.yaml`).

---

## Candidate 2 — `docs/` structure cleanup (defer; do after v0.1 ships)

`docs/` is a flat folder mixing four kinds of content with no organizing
principle:
- user-facing (`USER_GUIDE.md`, `USER_GUIDE.zh-CN.md`)
- living reference (`open-questions.md`, `v0-1-implementation-notes.md`)
- dated point-in-time artifacts (`methodology-review-2026-05-12.md`,
  `solo-founder-fit-2026-05-17.md`, `v0-1-validation-plan-2026-05-13.md`)
- subdirs (`decisions/`, `trials/`)

Strain points: "living" vs "snapshot" docs are indistinguishable; user-
facing docs sit next to internal process notes (a published-package
reader hits methodology navel-gazing); there is no forward-looking home
(this very backlog file is the first).

**Deliberately deferred.** A reorg now would be meta-gardening in place
of shipping v0.1. When picked up, the minimal cut is: separate
user-facing from internal (e.g. `docs/internal/`), and route dated
snapshots to an archive/trials/reviews home. Not a big taxonomy.

---

## Process

- Entries are candidate initiatives, ordered loosely by leverage.
- Promote with `contextspec create-initiative <id>` once v0.1 ships.
- This file is reviewed at each initiative retro alongside
  `docs/open-questions.md`.
