# Experiment Results

Append-only record of growth experiments, oldest first.

## 2025-11 — Skip workspace bootstrap for ≥5-member workspaces

- **Hypothesis**: Members joining established workspaces "self-onboard"; the bootstrap page adds friction without value for them.
- **Variant**: Skip `/w/:workspace_id/welcome` when workspace has ≥5 members at accept time.
- **Sample**: 1,820 accepted invitees per arm.
- **Primary metric**: `accepted → activated within 7 days`.
- **Result**: Variant lost. -3.1pp activation, p=0.04. Both guardrails neutral.
- **Decision**: Killed. Bootstrap page now ships unconditionally. Codified in `domains/onboarding/decisions.md` (2025-11 entry).
- **Lesson**: "Self-onboarding" intuition was wrong; the bootstrap page is doing more work than the per-step funnel suggested.

## 2026-01 — Generic invite subject line (rolled back, not a planned experiment)

- **What**: A copy refresh shipped without the inviter's name in the subject line.
- **Detection**: Open rate dropped 9% within 48 hours.
- **Action**: Rolled back. Codified principle: inviter context beats generic copy.
- **Lesson**: Email subject lines deserve guardrail monitoring even when not under experiment.

## 2026-02 — Email mismatch auto-claim (proposed, not run)

- **Hypothesis**: Auto-attaching a signing-up user to the inviting workspace when their email differs from the invited email would lift conversion.
- **Status**: Killed pre-experiment after a support-ticket review showed multiple cases of unintended workspace joins.
- **Lesson**: Some lift sources are not worth pursuing without a verification step. Recorded so the same idea doesn't resurface unmotivated.
