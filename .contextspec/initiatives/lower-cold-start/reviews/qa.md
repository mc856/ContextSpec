# QA Review — lower-cold-start Phase 1 (2026-06-12)

Subject: commits `e524469` (feat: create-role) + `c21e83a` (chore: dogfood qa registration), reviewed against `acceptance.md` via the compiled `qa-review` pack.

**Protocol caveat (read first).** Reviewer is the same agent/session that authored the change — *not* the independent cold-start protocol of `docs/notes/trials/2026-05-13-pr9-review-trial.md`. Findings are real and path-anchored, but the hypothesis-2 readout from this review is smoke-level evidence, not trial-grade. An independent re-run is the follow-up.

## Verdict per acceptance criterion

| Criterion | Verdict | Evidence |
|---|---|---|
| `create-role qa` writes preset, registry comment-preserving, exit 0 | **met** | `createRole.test.ts` cases 2/5; live dogfood run 2026-06-12 (`c21e83a`) |
| `--from engineer` clones current on-disk file, retitled H1 | **met** | test case 3 (customizes the file first, asserts marker survives) |
| `create-role data` → skeleton with placeholder markers in every section | **met, with a note** | every section carries an `<angle-bracket>` marker, but not the literal string `<placeholder>`; the test samples only 4 sections rather than all 9 [pack: acceptance Phase 1] |
| refuse without `--force`; byte-stable with `--force` | **met** | test cases 6/7 assert registry untouched + byte-equal re-run |
| `generate-claude` emits `qa-review.md` after registration | **met** | test case 11; live `/qa-review` generated, re-run byte-stable |
| `--cwd` before spec-form command works, spawned-bin test | **met** | `cli.test.ts` case 1 (the documented risk-#2 regression) |
| `npm test` green, ≥6 cases, **no existing test changes behavior** | **met with caveat** | 11 new cases; **but `dogfood.test.ts` was edited** (role-set assertion gained `qa`) — caused by the user-confirmed registry change, not by `create-role` code; the criterion as written is technically not satisfied by the initiative as a whole [pack: acceptance Phase 1] |
| "verify still true" in templates; dogfood mirror user-confirmed only | **met** | templates updated in `e524469`; mirror applied 2026-06-12 post-confirmation (`c21e83a`) |

## Defects found

1. **[major] `create-role constructor` crashes instead of falling back to the skeleton.** `LENS_LIBRARY[opts.id]` is a plain-object lookup; ids like `constructor` hit `Object.prototype` (truthy, non-string) and `writeFileSync` throws a TypeError. The kebab-case validator does not exclude such ids. Reproduce: `contextspec create-role constructor` on any fresh init. Fix: own-property guard. [diff]
2. **[major] `--from` is not validated; path traversal escapes `.contextspec/roles/`.** `--from '../../x'` resolves outside the roles directory and, if a matching `.md` exists, clones arbitrary files. Reproduce: `contextspec create-role foo --from ../context`. Fix: validate `from` against the same id regex. [diff]
3. **[major] Hard constraint wording is now violated by the shipped command.** `constraints.md` ("The CLI must not modify user-authored files (memory, roles, top-level context). It only writes to: `initiatives/<id>/packs/`, `.claude/commands/`, and the managed section of `AGENTS.md`") does not admit `create-role` writing `roles/<id>.md`. Its own header requires a broken constraint to be explicit and documented. Same tension in `principles.md` ("Files are the source of truth"). Fix: reword both to "creates scaffolds, never edits after creation without `--force`", and record the decision. [pack: constraints Product; pack: principles]
4. **[minor] `constraints.md` still lists "A `validate` command (deferred to v0.2)" as out of scope** — `validate` shipped in v0.1 (`finish-line/decisions.md` promoted it on 2026-05-08). This exact contradiction was flagged as B-pm 1 in the PR #9 trial on 2026-05-13 and is still unfixed. [pack: constraints Out of scope]
5. **[minor] `projects/cli.md` is stale on three counts**: library-exports list omits `createRole` and the `validate*` exports; module list omits `validate.ts` / `validateCommand.ts` / `createRole.ts` / `yamlEdit.ts`; the cac caveat omits `create role`. [pack: project cli]
6. **[minor] Invariant 3's allowed-writes list in `docs/v0-1-implementation-notes.md`** says "Files created during `init` and `create-initiative`" — `create-role` extends the CLI's write surface and the invariant text was not updated in the same PR, against the doc's own update protocol. [pack: initiative/acceptance Cross-cutting]

## Risk areas left untested

- Windows path behavior of `create-role` (repo policy: best-effort until a user asks — recorded, not blocking).
- `--from` cloning a role whose registry entry has non-empty `includes` (the clone gets `includes: []` by design; no test asserts the *combination*).
- Concurrent edits: `create-role` read-modify-writes `registry.yaml` non-atomically (same exposure as `create-initiative`; pre-existing).

## Release recommendation

**Ship with known issues** — defects 1–2 are real but low-likelihood inputs; fix in the same initiative before tagging `0.2.0`. Defects 3–6 are documentation-truth fixes that the no-fiction stance treats as non-optional; they are cheap and should land with this review.
