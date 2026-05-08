# Growth Review — improve-team-invite-conversion

Performed against `roles/growth.md` output contract. Author: Growth role. Date: 2026-04-26.

## 1. Hypothesis assessment

| # | Hypothesis | Falsifiable | Measurable | Scoped | Notes |
|---|---|---|---|---|---|
| 1 | Inviter-aware copy lifts opened → clicked | Yes | Yes | Yes | Clean A/B candidate. |
| 2 | Bootstrap teammate signal lifts accepted → activated | Yes | Yes | Yes | Activation has 7-day window; experiment must be sized accordingly. |
| 3 | Expired-invite recovery recovers measurable share of lost cohort | Yes | Yes | Marginal | Not an A/B; observational only. Acceptable for v1. |

All three hypotheses survive review.

## 2. Funnel impact

- Phase 1 targets `opened → clicked` (currently ~46%). Plausible 3–6pp absolute lift based on industry comparison; modeled as 4pp lift in sample-size estimate.
- Phase 2 targets `accepted → activated` (currently ~62%). Plausible 2–4pp absolute lift; modeled at 2.5pp.
- Combined modeled headline impact: 18.3% → 22.1%. **Target of 25% likely requires phase 3 plus a follow-up.** PM should know this before approval.

## 3. Instrumentation requirements

| Event | Owner | ETA | Status |
|---|---|---|---|
| `invite.personal_note_used` | engineer | with P1-T4 | new |
| `bootstrap.signal_shown` | engineer | with P2-T3 | new |
| `bootstrap.signal_clicked` | engineer | with P2-T3 | new |
| `bootstrap.signal_skipped_slow` | engineer | with P2-T5 | new |
| `invite.expired_recovery_requested` | engineer | with P3-T3 | new |

`invite.opened` undercounting (image-blocking clients, ~15–20% per `metrics.md`) is unchanged. Acceptable; both variants are equally affected.

## 4. Experiment design

### Phase 1

- Allocation: 50/50 at invite-send time, randomized per workspace to avoid same-workspace inviters seeing inconsistent UI.
- Primary: `opened → clicked`.
- Guardrails: Postmark spam complaint rate (≤ 0.1%), `accepted` rate (≤ current rate -1pp).
- Sample size: 6,000 invites (~3,000 per arm) for 80% power on 4pp lift. Roughly 2 weeks at current send rate.
- Decision rule: ship to 100% if primary is positive at p<0.05 with no guardrail breach. Kill if primary is flat or negative. Hold for one more week if directionally positive but underpowered.

### Phase 2

- Allocation: 50/50 per accepted member.
- Primary: `accepted → activated within 7 days`.
- Guardrails: workspace abandonment within 24h post-accept (≤ +2pp), inviter-to-invitee message rate (≥ -10%).
- Sample size: 4,000 accepted members (~2,000 per arm) for 80% power on 2.5pp lift. Roughly 3 weeks.
- Decision rule: ship if primary positive at p<0.05 and both guardrails healthy. Kill if either guardrail breaches.

### Phase 3

- Not an A/B. Ship behind a flag to 100% in week 1, observe two cohorts. Report recovered cohort size.

## 5. Risks

- **R-1**: Phase 1 personal-note variant may produce wide variance because note quality depends on the inviter. Acceptable; this is the variant we want to evaluate as-shipped.
- **R-2**: Phase 2 may regress workspace abandonment if the signal feels surveillance-like. Mitigation: empty-state and slow-query fallback (P2-T4, P2-T5) keep the page consistent.
- **R-3**: Cohort segments below 5-member workspaces are underpowered for phase 2. Report headline first, segments second.
- **R-4**: Combined modeled impact (22.1%) is below the 25% target. The initiative may need phase 4 work; flag this to PM now.

## 6. Recommendation

**Run as designed**, with two conditions:

1. PM acknowledges that phases 1+2+3 modeled impact lands at ~22%, not 25%. The H1 target may require additional work.
2. OQ-3 in `decisions.md` (include or exclude inviter's own activity in phase 2 signal) is decided before P2-T1 ships.

Open question for the next review cycle: should we keep the 25% H1 target as written, or adjust it to a more defensible model output?
