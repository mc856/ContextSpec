---
description: Summarize the current ContextSpec state of this project.
---

Read `.contextspec/registry.yaml` and report:

- declared roles
- declared initiatives, with their attached roles, domains, and projects
- for each initiative, which packs already exist under `packs/` and their `generated_at` timestamps from the pack frontmatter
- any obvious inconsistencies (e.g. an initiative attaches a domain that has no `domains/<id>/` directory)

Do not modify any files. Output as a short bulleted summary.
