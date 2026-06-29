# Open Questions

Long-lived project-level assumptions. Each entry has an assumption, a
falsifier, current status, and current evidence.

This file is governed by the two-layer rule described in
`PRODUCT_BLUEPRINT.md`: assumptions that survive past the current
initiative live here; assumptions that only matter inside one initiative
live in that initiative's `decisions.md` (or a future
`hypotheses.md`).

Capped at 10 entries. Adding an 11th means retiring or merging an
existing one.

Status values: `untested` / `partial-evidence` / `validated` / `falsified`.

---

## H-01 — Target user is solo founders and small (2–10) product teams

**Assumption.** ContextSpec's first users are AI-native solo founders and
small product teams already using Claude Code or Codex, who want to stop
repeating context in every session.

**Falsifier.** Any sustained user pull from a different segment (e.g.
mid-size engineering teams using ContextSpec for internal documentation
hygiene rather than agent context). Or: no solo founder adoption after
ContextSpec is publishable.

**Status.** `untested`. No user interviews on file.

**Evidence.** `VISION.md` §"Who We Build For First"; `PRODUCT_BLUEPRINT.md`
§3.

---

## H-02 — Role-based packs improve agent review quality

**Assumption.** Loading a role-shaped context pack before a review task
produces measurably better review output than the same agent reviewing
only a diff.

**Falsifier.** A trial where pack-assisted review yields no comments
unreachable by a diff-only baseline reviewer, or where pack-assisted
reviewers consistently miss more than they add.

**Status.** `partial-evidence`. One trial passed both pre-stated
criteria for engineer review (60% comments pack-tagged; 2 clearly
pack-unique insights), with an observed asymmetry that the pack also
*suppressed* five baseline-only comments.

**Evidence.** `docs/notes/trials/2026-05-13-pr9-review-trial.md`.

---

## H-03 — Four built-in roles (PM, Growth, Engineer, QA) are the right minimal set

**Assumption.** The four shipped roles cover the review and handoff loops
that the v0.1 target audience actually runs. Other blueprint roles
(Monetization, Reviewer, Coordinator) can be deferred or user-added
without protocol changes.

**Falsifier.** A user reports a review or handoff need that none of the
four role checklists covers, *and* extending an existing checklist would
make it incoherent.

**Status.** `untested`. De-risked but not evidenced: `create-role`
(2026-06-12) makes a wrong guess cheap rather than protocol-breaking,
and the QA preset now exists, so the cost of this assumption being wrong
has dropped — but no external user has exercised the set.

**Evidence.** `docs/decisions/2026-05-13-drop-monetization-role.md`;
`CONTEXTSPEC_V0_1_SPEC.md` §6. Smoke-level signal: a QA-lens pack review
produced acceptance/constraint-anchored findings an engineer-lens review
did not (`.contextspec/initiatives/lower-cold-start/reviews/qa.md`) —
weak evidence only, as the reviewer was the change's author; the
independent re-run is tracked in the `lower-cold-start` retro.

---

## H-04 — `source://` reference-only is enough to keep ContextSpec from drifting into a KB

**Assumption.** Keeping external knowledge out of `.contextspec/` and
referencing it only via `source://` links is sufficient to prevent
`.contextspec/sources/` from gradually becoming a lightweight knowledge
base.

**Falsifier.** A real project's `.contextspec/sources/` accumulates
content that is itself raw knowledge rather than curated reference —
e.g. transcripts pasted in, decisions duplicated from upstream tools.

**Status.** `untested`.

**Evidence.** `CONTEXTSPEC_V0_1_SPEC.md` §8.2; `VISION.md` §"What
ContextSpec Is Not"; review pattern E from
`docs/notes/methodology-review-2026-05-12.md`.

---

## H-05 — Solo founders will edit `registry.yaml` and Markdown directly without friction

**Assumption.** The target user is comfortable enough with YAML and
Markdown that the absence of a UI is not a blocker for v0.1 adoption.

**Falsifier.** Repeated reports of users abandoning ContextSpec because
they cannot or will not hand-edit `registry.yaml` or the role files.

**Status.** `partial-evidence` (2026-06-12). The scariest hand-edit —
adding a role to `registry.yaml` plus authoring `roles/<id>.md` — is now
a single command (`contextspec create-role`), used for real in the
dogfood (`c21e83a`: registered `qa`, comments preserved, no hand-edit).
Founder-only evidence; the assumption about *other* founders remains
open.

**Evidence.** `PRODUCT_BLUEPRINT.md` §4 (UI explicitly deferred); the
plan's "local-first is a feature" stance;
`.contextspec/initiatives/lower-cold-start/retro.md` §Hypothesis 1.

---

## H-06 — Byte-stable compilation is the right trust contract

**Assumption.** Deterministic, no-LLM compilation (`generated_at` aside)
is the trust dimension users actually want — diffability and
reproducibility — and it generalizes; LLM-rewriting compilation would
break the trust model rather than improve it.

**Falsifier.** Users explicitly ask for summarization or distillation
faster than they ask for clearer ordering / routing rules; or a real
review fails because the pack was too long and verbatim rather than too
brief.

**Status.** `untested`.

**Evidence.** `CONTEXTSPEC_V0_1_SPEC.md` §5.6.

---

## H-07 — The eight-file initiative template covers common workflows

**Assumption.** `brief / context-map / plan / tasks / acceptance /
decisions / reviews/ / retro` is the right cut for what a small team
needs per initiative, with no missing required file and no useless one.

**Falsifier.** Dogfood and example users either consistently leave one
of the eight files empty, or consistently end up creating a ninth
mandatory file that is not in the template.

**Status.** `partial-evidence`. The dogfood `finish-line` initiative
currently has no `reviews/` or `retro.md`. Whether that is a transient
or a structural signal is open.

**Evidence.** `CONTEXTSPEC_V0_1_SPEC.md` §7.1;
`.contextspec/initiatives/finish-line/`.

---

## H-08 — Claude Code and Codex are the right first integration targets

**Assumption.** Generating Claude Code slash commands and Codex
`AGENTS.md` covers a high-leverage majority of the v0.1 target audience's
agent surface, and other agents (Cursor, Aider, etc.) can wait.

**Falsifier.** Substantial early-user demand for a different agent
integration before either Claude Code or Codex integration is
stable.

**Status.** `untested`.

**Evidence.** `CONTEXTSPEC_V0_1_SPEC.md` §10–11; `PRODUCT_BLUEPRINT.md`
§10–11.

---

## H-09 — Local-first beats cloud-first for the target audience at the v0.1 stage

**Assumption.** Solo founders and small teams prefer plain files under
git over a hosted service, at least until team scaling forces a sync
layer.

**Falsifier.** Repeated requests for cloud sync, web UI, or hosted pack
storage from users who have actually tried the local-first version.

**Status.** `untested`.

**Evidence.** `VISION.md` §Principles #3 "Local-first and versioned";
`PRODUCT_BLUEPRINT.md` §4.

---

## H-10 — The v0.1 pack thesis generalizes beyond engineer-review

**Assumption.** The result from H-02's first trial — that role packs
help on engineer review — extends to PM, Growth, and QA reviews; to
handoff packs; and to non-trivial real-world workflows beyond a single
test PR.

**Falsifier.** A subsequent trial with a PM, Growth, or QA role pack
fails the same criteria H-02's trial passed; or a non-dogfood project
runs the same loop and reports no value.

**Status.** `untested`. The single trial in scope so far was engineer
role only; PM was exploratory and had no baseline to compare against.

**Evidence.** `docs/notes/trials/2026-05-13-pr9-review-trial.md`.

---

## Process

- This file is reviewed at the end of every initiative's retro. Entries
  may move between `untested` → `partial-evidence` → `validated` /
  `falsified` based on observations recorded in trials, ADRs, or retros.
- An entry that moves to `validated` or `falsified` stays in the file
  until the next entry is added; this preserves the trail of which
  assumptions actually got tested.
- New entries replace existing ones at the 10-cap, not appended.
  Suggest a replacement when proposing an addition.
