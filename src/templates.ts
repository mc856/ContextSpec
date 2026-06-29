/**
 * Skeleton templates emitted by `contextspec init` and `contextspec
 * create-initiative`. Templates are intentionally short: just enough
 * structure for a user to start filling in. Specific examples (e.g.
 * "team invite conversion") belong in the example fixture, not here.
 */

export const REGISTRY_YAML = `# ContextSpec registry — see CONTEXTSPEC_V0_1_SPEC.md §4.
version: "0.1"

# Files loaded for every role, every initiative.
context:
  includes:
    - context.md
    - principles.md
    - glossary.md
    - constraints.md

# Optional: external knowledge bases referenced via source://<id>/<path>.
# Uncomment and edit to enable. Source paths support ~ for home.
# sources:
#   personal_knowledge_base:
#     type: markdown_dir
#     path: ~/notes
#     include:
#       - "Customers/**"
#       - "Decisions/**"
#     exclude:
#       - "Daily/**"
#       - "Private/**"
#     mode: reference_only

roles:
  pm:
    file: roles/pm.md
    includes: []
  growth:
    file: roles/growth.md
    includes:
      - memory/experiment-results.md
  engineer:
    file: roles/engineer.md
    includes:
      - memory/anti-patterns.md

# Optional: business-area context. Attach to an initiative via
# \`initiatives.<id>.domains\`.
# domains:
#   onboarding:
#     includes:
#       - domains/onboarding/context.md

# Optional: per-repo / per-deployable engineering context.
# projects:
#   web-app:
#     repo: git@github.com:org/web-app
#     includes:
#       - projects/web-app.md

# Initiatives are added by \`contextspec create-initiative <id>\`.
initiatives: {}
`;

export const CONTEXT_MD = `# Product Context

One short paragraph: what we build, who it's for, and what we're optimizing right now. Keep this stable — change it only when the strategy changes.

## What we build

<one or two sentences>

## Stage

<early prototype / private beta / GA / mature>

## Target user

<who this is for, in their own words>

## What we are optimizing right now

<the single thing we trade other things off against this cycle>
`;

export const PRINCIPLES_MD = `# Principles

Stable, opinionated rules that bias every decision. Add a principle only after you've used it to settle a real disagreement.

- <principle 1>
- <principle 2>
- <principle 3>
`;

export const GLOSSARY_MD = `# Glossary

Terms that have a specific meaning in this product. Use it to keep roles, briefs, and packs aligned. Add an entry when a term has been misread at least once.

- **<term>** — <definition>.
`;

export const CONSTRAINTS_MD = `# Constraints

Hard constraints that bound every plan. If a constraint is broken, that decision must be explicit and documented.

## Business

- <e.g. budget, runway, partner contracts>

## Technical

- <e.g. framework choices, deployment targets, data residency>

## Product

- <e.g. accessibility commitments, privacy posture>

## Out of scope

- <things explicitly not pursued this cycle>
`;

export const ROLE_PM_MD = `# Role: PM

## Mission

Frame the problem, own the decision, and keep scope honest. Hand engineering and growth a brief that's small enough to ship and clear enough to argue with.

## Owns

- product brief and decisions for the active initiative
- acceptance criteria
- what is in/out of scope this cycle

## Needs

- engineer for feasibility, sequencing, and platform constraints
- growth for funnel impact, experiment design, and segmentation

## Reviews

- briefs, plans, acceptance criteria, decisions
- changes that affect product surface area

## Output Contract

When asked for something, return:
- a short framing
- the decision or recommendation
- the trade-off considered
- what is intentionally not yet decided

## Cannot Decide

- engineering plan or technical sequencing
- experiment statistical design or instrumentation
- timelines for engineering teams

## Checklist

- is the problem framed in user terms?
- is the success criterion measurable?
- have alternatives been considered?
- is the out-of-scope statement explicit?
- have claims framed as "decided" or "historical" been re-verified, not treated as settled?

## Common Mistakes

- conflating discovery with delivery
- writing acceptance criteria as a feature list
- skipping retro

## Suggested Memory Updates

After retro, propose updates to:
- \`memory/anti-patterns.md\`
- \`principles.md\` (only when a stable principle is established)
`;

export const ROLE_GROWTH_MD = `# Role: Growth

## Mission

Move the metric we said we'd move, with experiments designed to teach us something even when they fail.

## Owns

- funnel definitions and instrumentation requirements
- experiment design, sample sizing, and stop rules
- post-experiment readout and decision

## Needs

- engineer for instrumentation feasibility and shipping
- pm for what counts as success

## Reviews

- experiment plans before they ship
- proposed metrics for new initiatives

## Output Contract

When asked for an experiment review, return:
- hypothesis assessment (claim, falsifiability, prior)
- funnel impact (which step, expected lift, risk to guardrails)
- instrumentation requirements
- experiment design (unit, split, primary, guardrails, duration, stop rules)
- risks and recommendation

## Cannot Decide

- product surface area or scope (PM)
- engineering sequencing (engineer)

## Checklist

- is the hypothesis falsifiable?
- is the primary metric pre-specified?
- are guardrails defined and enforceable?
- can we ship instrumentation before launch?
- have claims framed as "decided" or "historical" been re-verified, not treated as settled?

## Common Mistakes

- moving the metric definition mid-experiment
- declaring a win on a guardrail-violating arm
- running underpowered tests for headline metrics

## Suggested Memory Updates

After each experiment, append to:
- \`memory/experiment-results.md\` (winner, loser, or null — all three are useful)
`;

export const ROLE_ENGINEER_MD = `# Role: Engineer

## Mission

Ship the smallest correct change that moves the initiative forward, and leave the codebase easier to change next time.

## Owns

- technical plan and sequencing
- code, tests, instrumentation
- production reliability of the surfaces we touch

## Needs

- pm for scope and acceptance
- growth for instrumentation and experiment shape

## Reviews

- technical plans before implementation begins
- changes that touch shared infra, data model, or auth

## Output Contract

When asked for a handoff or technical plan, return:
- problem and constraints in one paragraph
- chosen approach and the alternative considered
- sequencing (what ships in what order, what's reversible)
- test plan
- risks and mitigations

## Cannot Decide

- product scope or what counts as success (PM)
- experiment design or metric definitions (growth)

## Checklist

- is the smallest reversible step shipping first?
- are the tests at the right level (unit / integration / e2e)?
- is instrumentation in place before launch?
- has migration / rollback been considered?
- have claims framed as "decided" or "historical" been re-verified, not treated as settled?

## Common Mistakes

- shipping a refactor as part of a feature change
- writing tests against the implementation, not the contract
- leaving feature flags on past their decision deadline

## Suggested Memory Updates

After completion, append to:
- \`memory/anti-patterns.md\` (with a short, concrete example)
`;

export const ROLE_QA_MD = `# Role: QA

## Mission

Verify that what ships matches what was promised, and make the gap visible before users find it.

## Owns

- test strategy and coverage judgment for the active initiative
- defect reports and severity calls
- the release-readiness recommendation

## Needs

- pm for acceptance criteria and what counts as done
- engineer for test hooks, fixtures, and reproduction environments

## Reviews

- acceptance criteria before implementation starts (are they testable?)
- changes against the initiative's acceptance file before release

## Output Contract

When asked for a QA review, return:
- a verdict per acceptance criterion (met / not met / not verifiable), each with evidence
- defects found, each with severity and a reproduction path
- risk areas left untested, and why
- a release recommendation (ship / ship with known issues / hold)

## Cannot Decide

- product scope or the acceptance criteria themselves (PM)
- how to fix what's broken (engineer)

## Checklist

- is every acceptance criterion phrased so a test could fail it?
- is each "met" verdict grounded in observed behavior, not the plan or a past run?
- have claims framed as "decided" or "historical" been re-verified, not treated as settled?
- are edge cases and failure paths exercised, not just the happy path?
- is the regression surface of the change named explicitly?

## Common Mistakes

- testing the implementation's behavior instead of the acceptance contract
- marking criteria "met" from documentation rather than observed behavior
- treating a green test suite as proof when the suite never covered the risk

## Suggested Memory Updates

After completion, append to:
- \`memory/anti-patterns.md\` (defect classes worth a permanent rule)
`;

/** Title-case a kebab-case role id for display (\`data-analyst\` → \`Data Analyst\`). */
export function roleDisplayName(id: string): string {
  return id
    .split('-')
    .map((p) => (p.length === 0 ? p : p[0]!.toUpperCase() + p.slice(1)))
    .join(' ');
}

/**
 * Structured skeleton for genuinely custom roles: the sections are the
 * protocol's shape, the placeholders are the user's claims. Honest about
 * being a shape, not a product claim.
 */
export const ROLE_SKELETON_MD = (id: string) => `# Role: ${roleDisplayName(id)}

## Mission

<one or two sentences: what this role protects, and what it hands over>

## Owns

- <decision or artifact this role is accountable for>

## Needs

- <role> for <what this role cannot judge alone>

## Reviews

- <what this role must see before it ships>

## Output Contract

When asked for something, return:
- <the sections every response from this role must contain>

## Cannot Decide

- <decisions that belong to another role>

## Checklist

- <question this role asks on every review>
- have claims framed as "decided" or "historical" been re-verified, not treated as settled?

## Common Mistakes

- <failure mode this role is prone to>

## Suggested Memory Updates

After completion, propose updates to:
- <which memory file, and for what kind of lesson>
`;

/**
 * Curated role lenses shipped with the CLI. \`create-role <id>\` uses this
 * as its first template source when no \`--from\` is given. Curating a new
 * lens means believing in it — see the evidence bar in
 * docs/decisions/2026-05-13-drop-monetization-role.md.
 */
export const LENS_LIBRARY: Record<string, string> = {
  pm: ROLE_PM_MD,
  growth: ROLE_GROWTH_MD,
  engineer: ROLE_ENGINEER_MD,
  qa: ROLE_QA_MD,
};

export const MEMORY_README_MD = `# Memory

Confirmed long-term lessons. This is curated knowledge — it should be small, opinionated, and reread.

Append-only by convention. When something is invalidated, mark it superseded rather than deleting it.

Common files:
- \`anti-patterns.md\` — engineering pitfalls and the specific cases that taught us
- \`experiment-results.md\` — every shipped experiment, including null and lost arms
`;

export const MEMORY_ANTI_PATTERNS_MD = `# Anti-Patterns

Append-only. Each entry: short title, one-paragraph case, and the rule it taught us.
`;

export const MEMORY_EXPERIMENT_RESULTS_MD = `# Experiment Results

Append-only record of growth experiments, oldest first. Include winners, losers, and nulls — all three are useful.
`;

export const INITIATIVE_BRIEF_MD = (id: string) => `# ${id}

One paragraph: the problem, the user, and what we're choosing to do about it this cycle.

## Why now

<what changed that makes this the right thing to work on now>

## Hypotheses

1. <claim> — <how we'd know if it's wrong>

## Out of scope

- <things we are deliberately not doing in this initiative>
`;

export const INITIATIVE_CONTEXT_MAP_MD = `# Context Map

Pointers into the rest of \`.contextspec/\` for this initiative. Roles read this first when picking up the work.

## Domains

- <domain id> — <why it's relevant>

## Projects

- <project id> — <surfaces touched>

## Memory

- \`memory/<file>.md\` — <what to reread before designing>

## External sources

- \`source://<id>/<path>\` — <what to verify against>
`;

export const INITIATIVE_PLAN_MD = `# Plan

How we sequence the work. Each phase should be reversible if it has to be.

## Phase 1 — <name>

- change: <what we ship>
- experiment: <split, primary metric, guardrails, duration>
- decision rule: <what we do with each outcome>
`;

export const INITIATIVE_TASKS_MD = `# Tasks

Concrete units of work, sized to land in days, not weeks. Mark blockers explicitly.

## Phase 1

- [ ] <task>
- [ ] <task>
`;

export const INITIATIVE_ACCEPTANCE_MD = `# Acceptance

What \"done\" means for this initiative — at the level of behavior, not implementation.

## Per-phase

### Phase 1

- <observable behavior or metric>
- <observable behavior or metric>

## Cross-cutting

- instrumentation in place before any phase ships
- experiment readouts written within 1 week of stop
- feature flags removed within 30 days of acceptance
`;

export const INITIATIVE_DECISIONS_MD = `# Decisions

Initiative-scoped decisions that bind the rest of the work. Bigger decisions belong in \`domains/<d>/decisions.md\` or \`principles.md\`.

## <YYYY-MM> — <decision>

- decision: <what was decided>
- alternative: <what we did not pick and why>
- impact: <what changes because of this>
`;
