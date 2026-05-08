# Memory

Long-term, curated learnings. Not a chat log, not a dump of raw notes.

Per spec §8 rule 6 and §11, items here are written only after human confirmation. Agents may propose updates from retro outputs; the human owner of the initiative accepts or rejects them before they are committed.

## Files (created on demand)

| File | What it holds |
|---|---|
| `lessons.md` | Cross-cutting lessons that affect multiple roles or domains. |
| `experiment-results.md` | Past growth experiments with hypothesis, sample, decision, outcome. |
| `customer-feedback.md` | Distilled patterns from customer interviews and support tickets. |
| `anti-patterns.md` | Engineering or product anti-patterns to avoid. |
| `incidents.md` | Production incidents whose root cause has lasting context value. |

`contextspec init` creates only this README. Other files are created when a retro proposes an entry that justifies their existence. Empty memory files should not exist.

## Entry format

Each entry should answer four questions:

1. What happened.
2. Why it matters going forward.
3. What we should do differently next time.
4. Where the original evidence lives (often a `source://` link).

Entries are append-only in spirit; corrections happen via new entries that supersede older ones, not by rewriting history.
