# FitTrack load testing

[k6](https://k6.io/) exercises the **full stack through Traefik**: register → JWT → workouts CRUD → `/auth/me`.

## Prerequisites

- Stack running: `make up` (Traefik, IAM, Workout, MongoDB, RabbitMQ)
- Optional: Grafana/Prometheus for observing load (`make monitoring`)

## Quick smoke (30s, 3 VUs)

```bash
make load-test-smoke
```

## Full load test (default: 10 VUs, 1m at peak)

```bash
make load-test
```

Runs k6 in Docker on `fitrack-net` targeting `http://traefik:80` (same as production routing).

## Custom intensity

```bash
K6_VUS=25 K6_DURATION=3m K6_SETUP_USERS=15 make load-test
```

| Variable | Default | Description |
|----------|---------|-------------|
| `K6_GATEWAY_URL` | `http://traefik:80` (Docker) | API base URL |
| `K6_VUS` | `10` | Peak virtual users |
| `K6_DURATION` | `1m` | Time at peak load after ramp-up |
| `K6_SETUP_USERS` | `10` | Users created before the test |
| `K6_SETUP_DELAY` | `7` | Seconds between registrations (Traefik auth rate limit ~10/min) |

## Run k6 on the host (no Docker)

```bash
brew install k6   # or see k6.io/docs
K6_GATEWAY_URL=http://localhost k6 run load-testing/k6/full-flow.js
```

## What each VU does

1. `GET /auth/me`
2. `GET /workouts`
3. `POST /workouts` (with exercises)
4. `GET /workouts/{id}`
5. `PUT /workouts/{id}` (update exercises)

## Results

- k6 prints a summary to the terminal
- JSON export: `load-testing/results/summary.json` (when using `scripts/load-test.sh`)

## Rate limiting

Traefik limits `/auth/login`, `/auth/register`, and `/auth/refresh` to about **10 requests/minute** per client IP. Setup registers users slowly (`K6_SETUP_DELAY`). The main test uses tokens from setup, not repeated registration.

For heavy registration tests, temporarily raise limits in `gateway/traefik/dynamic/middlewares.yml` (`rate-limit-auth`).

## Watch during a run

1. Open http://localhost:3001 → **FitTrack overview** (refresh **5s**, time range **Last 15 minutes**).
2. Run `make load-test` in another terminal.
3. Watch **HTTP request rate**, **HTTP rate by outcome**, and **HTTP 2xx rate** rise.
4. **HTTP 5xx rate** should sit at **0** if the run is healthy (zero server errors is good).

If a panel still says “No data”, click **⟳** on the dashboard or `docker compose restart grafana` after pulling dashboard updates.

## Scripts

| File | Purpose |
|------|---------|
| `k6/full-flow.js` | Ramping VUs, full API path |
| `k6/smoke.js` | Short sanity check |
