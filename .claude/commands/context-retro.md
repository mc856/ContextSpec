---
description: Drive a retrospective for the named initiative and propose memory updates.
argument-hint: <initiative-id>
---

You are running a retrospective for initiative `$ARGUMENTS`.

1. Read `.contextspec/initiatives/$ARGUMENTS/retro.md`. If it does not exist, report that and stop.
2. Read `.contextspec/initiatives/$ARGUMENTS/{brief,plan,tasks,acceptance,decisions}.md` and any `reviews/*.md` for context.
3. Identify candidate updates to:
   - `memory/anti-patterns.md` — engineering pitfalls observed
   - `memory/experiment-results.md` — confirmed wins, losses, and nulls
   - `principles.md` — only when a stable principle has been established
   - `constraints.md` — only when a hard constraint has been newly discovered
4. Print each proposed update as a diff-style block. **Do not write anything to disk.** Wait for the user to apply the updates manually or confirm before writing.
