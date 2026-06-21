# FiTrack performance testing (load & stress)

FiTrack uses [k6](https://k6.io/) to verify **NFR-01**, **NFR-03**, and **NFR-05** from the NFR catalogue v5.0 (June 2026). All scenarios hit the **full stack through Traefik** (same routing as the browser).

## NFR traceability

| NFR | Requirement | Script | Command | Pass criteria (k6 thresholds) |
|-----|-------------|--------|---------|-------------------------------|
| **NFR-01** | 10 simultaneous users, 1 min sustained; workout-management API responsive | `full-flow.js` / `nfr-01-load.js` | `make load-test-nfr-01` | Overall and per-endpoint: `http_req_failed` &lt; 10%, `http_req_duration` p95 &lt; 5,000 ms |
| **NFR-05** | 0% HTTP 5xx at normal load (10 VUs, 1 min) | same as NFR-01 | `make load-test-nfr-01` | `fitrack_http_5xx` rate == 0 |
| **NFR-03** | 0% application errors while ramping 0 → 50 VUs over 8 min | `stress.js` / `nfr-03-stress.js` | `make load-test-nfr-03` | `fitrack_application_errors` rate == 0 (HTTP 5xx only; 4xx excluded) |

### Endpoints covered by NFR-01

Each virtual user iteration exercises all five workout-management endpoints:

1. `GET /auth/me` — view profile  
2. `GET /workouts` — list workouts  
3. `POST /workouts` — create workout  
4. `GET /workouts/{id}` — retrieve workout  
5. `PUT /workouts/{id}` — update workout  

Per-endpoint p95 and failure thresholds are enforced via k6 request tags (`auth_me`, `workouts_list`, etc.).

## Test types

| Type | Script | Command | Duration (approx.) |
|------|--------|---------|---------------------|
| **Smoke** | `smoke.js` | `make load-test-smoke` | ~30 s |
| **NFR-01 load** | `nfr-01-load.js` | `make load-test-nfr-01` | ~2 min (incl. setup) |
| **NFR-03 stress** | `nfr-03-stress.js` | `make load-test-nfr-03` | ~9 min |

`make load-test` and `make load-test-stress` are aliases for the NFR targets.

## Prerequisites

```bash
make up              # Traefik, IAM, Workout, MongoDB, RabbitMQ
make monitoring      # optional — Grafana evidence during stress runs
```

## Commands

```bash
make load-test-smoke       # quick sanity before a full NFR run
make load-test-nfr-01      # NFR-01 + NFR-05 (10 VUs, 1 min sustain)
make load-test-nfr-03      # NFR-03 (ramp 0→50 VUs over 8 min)
```

### Custom intensity

```bash
K6_VUS=10 K6_DURATION=1m make load-test-nfr-01
K6_PEAK_VUS=50 K6_RAMP_DURATION=8m make load-test-nfr-03
```

| Variable | NFR-01 default | NFR-03 default | Description |
|----------|----------------|----------------|-------------|
| `K6_GATEWAY_URL` | `http://traefik:80` | same | API base (Docker network) |
| `K6_VUS` | `10` | — | Peak VUs (NFR-01) |
| `K6_DURATION` | `1m` | — | Sustained load at peak (NFR-01) |
| `K6_PEAK_VUS` | — | `50` | End-of-ramp VUs (NFR-03) |
| `K6_RAMP_DURATION` | — | `8m` | Ramp duration (NFR-03) |
| `K6_SETUP_USERS` | `10` / `15` | | Pre-registered users (tokens avoid auth rate limit) |
| `K6_SETUP_DELAY` | `7` / `5` | | Seconds between registrations in setup |

## Scenario design

### NFR-01 load (`full-flow.js`)

- **Ramp:** 10 s → 10 VUs  
- **Sustain:** 1 min at 10 VUs (configurable via `K6_DURATION`)  
- **Ramp down:** 10 s  

Setup registers one user per VU (slowly, to respect Traefik auth rate limits). The main scenario reuses pre-issued JWTs — no repeated login/register during load.

### NFR-03 stress (`stress.js`)

- **Ramp:** 0 → 50 VUs over **8 minutes** (single linear stage, matches NFR)  
- **Ramp down:** 30 s  

Same authenticated workout flow as NFR-01; thresholds only gate on **HTTP 5xx** (application errors), not client 4xx.

## Portfolio evidence checklist

1. Terminal output from `make load-test-nfr-01` showing all thresholds ✓  
2. Terminal output from `make load-test-nfr-03` showing `fitrack_application_errors` == 0  
3. JSON summary: `load-testing/results/summary-<timestamp>.json`  
4. Grafana screenshots during NFR-03: HTTP rate, latency, **5xx rate**, JVM heap  
5. Reference NFR-01, NFR-03, NFR-05 in your requirements / verification matrix  

## Rate limiting

Traefik limits `/auth/register`, `/auth/login`, and `/auth/refresh` to ~**10 requests/minute** per IP (NFR-02). Setup registers users slowly; load/stress scenarios use pre-issued tokens.

## Files

| File | Role |
|------|------|
| `k6/lib/workflow.js` | Shared authenticated workout flow + 5xx metrics |
| `k6/lib/nfr-thresholds.js` | NFR-aligned k6 threshold definitions |
| `k6/nfr-01-load.js` | NFR-01 / NFR-05 entry point |
| `k6/nfr-03-stress.js` | NFR-03 entry point |
| `k6/full-flow.js` | NFR-01 implementation |
| `k6/stress.js` | NFR-03 implementation |
| `k6/smoke.js` | Minimal pre-check |
| `scripts/load-test.sh` | Docker k6 runner |

See also: [`load-testing/README.md`](../load-testing/README.md), [`monitoring/README.md`](../monitoring/README.md).
