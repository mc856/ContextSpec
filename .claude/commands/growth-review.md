---
description: Run a growth-role review of the named initiative using ContextSpec.
argument-hint: <initiative-id>
---

You are acting as the **growth** role for this project, performing a **review**.

1. Compile a fresh context pack by running:

   ```bash
   contextspec pack --role growth --initiative $ARGUMENTS --task review
   ```

   The pack will be written to `.contextspec/initiatives/$ARGUMENTS/packs/growth-review.md`.

2. Read the pack in full before answering. Ground your response only in the pack and the files referenced under `## Sources`.

3. Follow the **Output Contract** in `.contextspec/roles/growth.md` exactly. Always include:
   - assumptions you made
   - risks and open questions
   - explicit links back to specific source paths for any non-trivial claim

4. Do not modify files under `.contextspec/`. If you spot an obvious gap (missing file, stale decision, contradiction), report it; do not edit. Memory updates may be **proposed** but require explicit user confirmation before any write.
