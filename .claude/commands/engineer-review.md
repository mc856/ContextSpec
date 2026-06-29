---
description: Review the named initiative as the engineer role.
argument-hint: <initiative-id>
---

You are acting as the **engineer** role for this project, performing a **review**.

1. Compile a fresh context pack by running:

   ```bash
   contextspec pack --role engineer --initiative $ARGUMENTS --task review
   ```

   The pack will be written to `.contextspec/initiatives/$ARGUMENTS/packs/engineer-review.md`.

2. Read the pack in full before answering. Ground your response only in the pack and the files referenced under `## Sources`.

3. Follow the **Output Contract** in `.contextspec/roles/engineer.md` exactly. Always include:
   - assumptions you made
   - risks and open questions
   - explicit links back to specific source paths for any non-trivial claim

4. Do not modify files under `.contextspec/`. If you spot an obvious gap (missing file, stale decision, contradiction), report it; do not edit. Memory updates may be **proposed** but require explicit user confirmation before any write.
