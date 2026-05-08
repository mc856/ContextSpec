# Anti-patterns

Patterns we have hit that should not be repeated. Each has a name, a description, and a concrete preventative.

## A1 — One-way feature flag

**Pattern**: A feature flag was used to gate a change, but the off path was never exercised after the on path went to 100%. When we tried to roll back during a small outage, the off path had bit-rotted.

**Prevention**: For any flag that gates a user-visible surface, both paths must be covered by an integration test that runs in CI. Flag removal is required within 30 days of acceptance, or a follow-up issue must be filed.

## A2 — Telemetry without a downstream consumer

**Pattern**: Events were emitted from the client but never queried by the dashboard. We discovered this during a launch when the funnel widget showed nothing.

**Prevention**: Adding an event requires updating either `domains/<domain>/metrics.md` or naming a consumer dashboard query in the PR description.

## A3 — Per-render permission filtering

**Pattern**: A list query returned all rows; the renderer filtered out items the user could not see. This worked until the renderer was bypassed (e.g. an embeddable view) and private data leaked.

**Prevention**: Permission filtering is a query concern, not a render concern. Tests must enforce that a low-privilege caller sees the same row count the query returns.

## A4 — Migration-coupled growth experiments

**Pattern**: A growth experiment shipped together with a non-reversible schema migration. Rolling back the experiment required an additional migration, slowing the kill decision.

**Prevention**: Growth experiments must be reversible behind a flag in under an hour. Schema changes, if needed, must precede the experiment in a separate, already-shipped change.
