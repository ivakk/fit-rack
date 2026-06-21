# FiTrack load & stress testing

[k6](https://k6.io/) verifies **NFR-01**, **NFR-03**, and **NFR-05** on the **full stack through Traefik**.

**Portfolio doc:** [`docs/PERFORMANCE_TESTING.md`](../../docs/PERFORMANCE_TESTING.md)

## NFR commands

| NFR | Command | What it checks |
|-----|---------|----------------|
| NFR-01 + NFR-05 | `make load-test-nfr-01` | 10 VUs, 1 min sustain; p95 &lt; 5 s and failures &lt; 10% on all 5 endpoints; 0% HTTP 5xx |
| NFR-03 | `make load-test-nfr-03` | Ramp 0→50 VUs over 8 min; 0% application errors (HTTP 5xx) |

Aliases: `make load-test` (NFR-01), `make load-test-stress` (NFR-03).

## Prerequisites

- Stack running: `make up` (Traefik, IAM, Workout, MongoDB, RabbitMQ)
- Optional: Grafana/Prometheus for observing load (`make monitoring`)

## Quick smoke (30s, 3 VUs)

```bash
make load-test-smoke
```

Not an NFR gate — use before a full run to confirm the stack responds.

## Load test — NFR-01 + NFR-05

```bash
make load-test-nfr-01
```

**Profile:** 10 simultaneous users, 1 minute sustained load.

**Endpoints per iteration:** `GET /auth/me`, `GET /workouts`, `POST /workouts`, `GET /workouts/{id}`, `PUT /workouts/{id}`.

**Pass criteria:**

- Overall and per-endpoint: failure rate &lt; 10%, p95 &lt; 5,000 ms  
- `fitrack_http_5xx` == 0% (NFR-05)

## Stress test — NFR-03

```bash
make load-test-nfr-03
```

**Profile:** linear ramp from 0 to 50 VUs over 8 minutes (5× expected peak).

**Pass criteria:** `fitrack_application_errors` == 0% (HTTP 5xx only).

```bash
K6_PEAK_VUS=75 make load-test-nfr-03   # optional higher ceiling (not an NFR target)
```

Runs k6 in Docker on `fitrack-net` targeting `http://traefik:80`.

## Custom intensity

```bash
K6_VUS=10 K6_DURATION=1m make load-test-nfr-01
K6_PEAK_VUS=50 K6_RAMP_DURATION=8m make load-test-nfr-03
```

| Variable | Default | Description |
|----------|---------|-------------|
| `K6_GATEWAY_URL` | `http://traefik:80` (Docker) | API base URL |
| `K6_VUS` | `10` | Peak VUs (NFR-01) |
| `K6_DURATION` | `1m` | Sustain at peak (NFR-01) |
| `K6_PEAK_VUS` | `50` | End-of-ramp VUs (NFR-03) |
| `K6_RAMP_DURATION` | `8m` | Ramp duration (NFR-03) |
| `K6_SETUP_USERS` | `10` / `15` | Users created before the test |
| `K6_SETUP_DELAY` | `7` / `5` | Seconds between registrations (Traefik auth rate limit ~10/min) |

## Run k6 on the host (no Docker)

```bash
brew install k6
K6_GATEWAY_URL=http://localhost k6 run load-testing/k6/nfr-01-load.js
K6_GATEWAY_URL=http://localhost k6 run load-testing/k6/nfr-03-stress.js
```

## Results

- k6 prints threshold pass/fail in the terminal  
- JSON export: `load-testing/results/summary-<runId>.json` (via `scripts/load-test.sh`)

## Rate limiting

Traefik limits `/auth/login`, `/auth/register`, and `/auth/refresh` to about **10 requests/minute** per client IP (NFR-02). Setup registers users slowly; load/stress use pre-issued JWTs.

## Watch during a run

1. Open http://localhost:3001 → **FiTrack overview** (refresh **5s**, time range **Last 15 minutes**).  
2. Run `make load-test-nfr-03` in another terminal.  
3. Watch **HTTP request rate**, **HTTP rate by outcome**, and **HTTP 2xx rate**.  
4. **HTTP 5xx rate** must stay at **0** for NFR-03 / NFR-05.

## Scripts

| File | Purpose |
|------|---------|
| `k6/lib/workflow.js` | Shared authenticated workout flow |
| `k6/lib/nfr-thresholds.js` | NFR pass/fail thresholds |
| `k6/nfr-01-load.js` | NFR-01 + NFR-05 entry |
| `k6/nfr-03-stress.js` | NFR-03 entry |
| `k6/full-flow.js` | NFR-01 implementation |
| `k6/stress.js` | NFR-03 implementation |
| `k6/smoke.js` | Short sanity check |
| `scripts/load-test.sh` | Docker k6 runner |
