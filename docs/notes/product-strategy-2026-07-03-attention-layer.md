# Product strategy note — the attention-allocation thesis (2026-07-03)

Status: **hypothesis-grade, n=1.** Records a founder/agent working discussion
on 2026-07-03, the first day of real multi-workspace usage. Nothing here is
roadmap; each hypothesis carries its evidence bar. Reviewed at initiative
retros alongside `docs/open-questions.md`.

## 1. Two scarcities, one resource

The v0.1 founding assumption: agent context windows are finite, so
different domains of work (implementation/QA vs product/planning vs
commercialization/ops) need deliberate context scheduling. That assumption's
customer is the **agent's** attention.

Real usage surfaced the second scarcity: the **founder's** attention. A
one-person company has exactly one scarce resource, and every thread switch
pays a state-rebuild tax twice — once re-briefing the agent, once
re-briefing yourself ("where was this? why did I decide that? what's
next?"). Organizations amortize this tax through institutional machinery
(colleagues' continuous memory, handoff formats, managers, calendars); a
company of one has none of it, so switching stays expensive and parallel
threads quietly die.

These converge rather than compete. As windows grow toward millions of
tokens, "fits in the window" depreciates as a value proposition — but the
2026-05-13 trial showed the durable value was never fit: two lenses read
the *same* code and caught *different* problems. Packs shape what the agent
attends to, not how much it can read. Curation is attention-shaping, not
compression.

**Unified thesis: ContextSpec is an attention-allocation layer for
one-person companies — routing the right frame to the agent, and the right
next-thing to the human.** `pack` is the first outlet; a status/next view
would be the second outlet of the same layer.

Strategic corollary: host tools growing built-in memory (a known window
risk) solve **storage**. Role-framed selection — remembering everything vs
looking with QA's eyes — is a different product.

## 2. Solo PM is the same pain, second consumer

Team PM tools solve inter-person visibility and coordination. A company of
one has no coordination problem; it needs exactly three things: **resume**
(where was this thread), **prioritize** (which thread now), **remind**
(which dated commitment fires). All three are memory-and-scheduling
problems — contiguous with the context problem, over the same files.

Observed evidence (n=1 but loud): in a single working session the founder
asked "what's next?" five times, and the agent answered each time by
reading initiative files — tasks checkboxes, acceptance criteria, dated
tripwires in constraints. The agent was serving as chief of staff, ad hoc,
from data that already exists in the protocol.

## 3. Form hypothesis: status is a pack

The PM layer needs **no new data**. It is a second deterministic
compilation over existing files: aggregate unchecked tasks, due tripwires,
and stale initiatives across workspace members; emit one token-cheap entry
file. Same trust contract as `pack` (no LLM in the compiler), same
staleness machinery (`validate --strict` precedent). A committed status
file has a bonus: its git log is a time series of the company's state —
the weekly log habit as a compiler side effect.

**Single-source rule.** Agents keep writing at the source — the owning
initiative's `tasks.md` and `decisions.md` — never to a separate
authoritative state file. A stochastic writer maintaining authoritative
aggregate state is the industrialization of the failure mode the trial
documented ("pack made the reviewer over-trust the project's self-reported
state") plus the retro's "recorded findings rot without an owner". A
derived view can drift and be rebuilt; a lying source of truth cannot.

## 4. Write-permission tiers (design sketch)

Per-item propose-confirm burns the attention it claims to save. The
efficient shape: **writes are automatic, review is asynchronous and
batched, revert is cheap** (git makes every write recoverable; the audit
surface is the status file's diff). Two synchronous exceptions, by blast
radius:

- `memory/` — long-lived, enters every future pack; a poisoned lesson
  compounds. Human confirmation stays (AGENTS.md already draws this line).
- Acceptance sign-off — declaring "done" is the one call a company of one
  cannot outsource.

Agent writes carry attribution (session/role) so later readers can
calibrate trust. Known gap: silent *non*-writes (agent forgets to record).
Cheap deterministic detector: flag "repo had N commits this week, its
tasks.md unchanged — possibly unrecorded work". A hint, not a judgment.

## 5. Depth vs breadth

Roles-within-a-project (depth: checks and balances inside one business) is
validated by dogfood. Workspace-above-projects (breadth: one person's
portfolio of businesses) is the founder's observed habit — sessions start
at the multi-repo parent — and is parked as backlog Candidate 4. Boundary
that keeps the expansion safe: the workspace layer does **routing,
discovery, and aggregation only**. The day it needs its own database is
the day it becomes a PM tool, which `README.md` §Knowledge base boundary
already forbids.

## 6. Evidence bars

- Unified thesis into public `VISION.md`: after a second external user
  independently exhibits chief-of-staff usage or the session-at-parent
  habit.
- `status` command prototyping: after H-01 has any external evidence at
  all — building the second outlet before anyone uses the first repeats
  the mistake the 2026-06-11 ADR corrected.
- Write-tier implementation: needs nothing now; the convention already
  lives in AGENTS.md and the router skill. Formalize only when a second
  agent host creates real write-conflict pressure.
