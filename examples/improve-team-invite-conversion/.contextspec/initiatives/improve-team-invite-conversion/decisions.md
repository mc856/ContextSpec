# Initiative Decisions

Decisions specific to this initiative. Decisions about onboarding in general live in `domains/onboarding/decisions.md`.

## 2026-04-22 — Three hypotheses, sequenced phases

We decided not to run all three hypotheses in parallel. Traffic does not support three concurrent A/B tests on overlapping cohorts, and phase 2's downside risk warrants isolation. Sequenced phases were chosen over a multivariate test for the same reason.

## 2026-04-24 — Personal note is opt-in for the inviter, not auto-generated and sent

The growth review challenged whether the personal note should be auto-filled and sent without inviter confirmation, to avoid empty-note variants in production. We rejected this. Sending generated copy under a real user's name violates principle 4 (inviter context beats generic copy) at a deeper level: the inviter must endorse what is sent in their name. Default suggestion is shown in the textarea; the inviter can edit, accept, or clear it.

## 2026-04-25 — Bootstrap signal queries respect workspace-level permissions

In review, we noticed the original task description for P2-T1 fetched "three most recent issues" without a permission filter. The decision is to filter at the query level, not at render time. A test must enforce this.

## Open questions

- **OQ-1 (assigned: PM)**: Should phase 3 ship before phase 1's experiment concludes, or wait? Phase 3 is not an experiment, but it changes copy on the same surface family. Pending PM decision after phase 1 week 1 readout.
- **OQ-2 (assigned: Engineer)**: Is the personal note stored per invite or per workspace template? Engineer review proposes per-invite. Confirm before P1-T1.
- **OQ-3 (assigned: Growth)**: For phase 2, do we include the inviter's own most recent activity in the "three most recent issues", or exclude it? Inclusion may inflate signal artificially. Pending growth decision before P2-T1.
