# Engineer Review — lower-cold-start Phase 1 (2026-06-12)

Subject: commits `e524469` + `c21e83a`, reviewed via the compiled `engineer-review` pack. Same protocol caveat as `reviews/qa.md`: reviewer = change author; smoke-level evidence.

## Findings

1. **[major] Prototype-chain lookup in template-source resolution.** `LENS_LIBRARY[opts.id]` (twice in `createRole.ts`: source selection and the `--from` shadow warning) resolves inherited keys — `create-role constructor` yields `Object.prototype.constructor` and crashes in `writeFileSync`. Use an own-property check. [diff]
2. **[major] `opts.from` is unvalidated user input used in a path join.** `join(contextRoot, 'roles', `${opts.from}.md`)` traverses on `../`. Validate against `ID_RE` like the id itself; this also makes the clone-source error message consistent. [diff]
3. **[minor] `retitleH1` assumes the H1 is line 1.** A role file starting with a blank line or comment gets a *prepended* H1 (duplicate titles). Acceptable for files our own scaffolds produce; worth a test if user-authored role files diverge. [diff]
4. **[minor] `forceBlockStyle` semantic change is shared.** The empty-collection inline rule now also applies to `createInitiative` via `yamlEdit.ts`. Verified no behavioral change there (its created nodes never contain empty collections: `roles` is non-empty by construction, `domains`/`projects` only set when non-empty) — but the coupling is new; the existing `init.test.ts` comment-preservation case is the canary. [diff; pack: initiative/decisions yamlEdit]
5. **[minor] Invariant 3 doc drift** — same as QA defect 6: `docs/v0-1-implementation-notes.md` cross-cutting invariant 3 must list `create-role` among the scaffolding writers, in the same PR per the doc's update protocol. [pack: initiative/acceptance Cross-cutting]
6. **[info] Spec form `create role` collides with nothing today**, but the position-independent scan in `preprocessArgv` collapses the *first* adjacent pair anywhere in argv; a positional argument literally equal to `create` followed by `role` would be mangled. No current command has free-text positionals, so this is theoretical; noted for the day one does. [diff]

## Invariants check (all four)

- **Byte-stable output**: `create-role --force` re-run byte-stability is asserted; `generate-claude`/`generate-codex` re-runs verified byte-identical against the live repo after the qa registration.
- **No LLM / network in compiler**: `grep -rE "fetch|https?://" src/` shows no network call paths (URLs appear only in comments/templates).
- **CLI never edits user-authored files**: holds in behavior (skip-if-exists + `--force` gate, adoption semantics for pre-existing files); the *wording* of the constraint/principle needs the update QA defect 3 describes.
- **Path-based routing**: untouched (`route.ts` unmodified; `roles/<id>.md` routes as role files by location).

## Recommendation

Land the two code fixes (findings 1–2) plus doc-truth updates before tagging `0.2.0`. No sequencing risk; all fixes are leaf-level and test-coverable in the existing suites.
