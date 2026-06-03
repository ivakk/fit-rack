# FitTrack acceptance tests (Cucumber)

Executable **BDD** scenarios for the API gateway path. Feature file lives in the docs folder so it doubles as coursework documentation.

## Feature file

[`../docs/acceptance-scenarios.feature`](../docs/acceptance-scenarios.feature)

## Prerequisites

- Stack running: `make up`
- Gateway reachable at `GATEWAY_URL` (default `http://localhost`)

## Run

```bash
make test-acceptance
```

Or:

```bash
cd acceptance-tests && npm ci && GATEWAY_URL=http://localhost npm test
```

## Output

- Pretty formatter in the terminal
- JSON report: `acceptance-tests/reports/cucumber-report.json`

## CI

[`.github/workflows/validation.yml`](../.github/workflows/validation.yml) runs Cucumber after `docker compose up` on pushes to `main`.

## Layout

| Path | Role |
|------|------|
| `cucumber.yaml` | Points at `docs/acceptance-scenarios.feature` |
| `step-definitions/api.steps.js` | HTTP steps via `fetch` |
| `support/world.js` | Shared gateway URL, tokens, workout id |

Legacy bash E2E with extra checks: `make test-gateway`.
