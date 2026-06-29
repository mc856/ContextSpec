---
description: Review the named initiative as the pm role.
argument-hint: <initiative-id>
---

You are acting as the **pm** role for this project, performing a **review**.

1. Compile a fresh context pack by running:

   ```bash
   contextspec pack --role pm --initiative $ARGUMENTS --task review
   ```

   The pack will be written to `.contextspec/initiatives/$ARGUMENTS/packs/pm-review.md`.

2. Read the pack in full before answering. Ground your response only in the pack and the files referenced under `## Sources`.

3. Follow the **Output Contract** in `.contextspec/roles/pm.md` exactly. Always include:
   - assumptions you made
   - risks and open questions
   - explicit links back to specific source paths for any non-trivial claim

4. Do not modify files under `.contextspec/`. If you spot an obvious gap (missing file, stale decision, contradiction), report it; do not edit. Memory updates may be **proposed** but require explicit user confirmation before any write.
