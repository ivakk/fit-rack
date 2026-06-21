# FiTrack

Polyglot monorepo for the FiTrack fitness platform.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Optional: JDK 21 for native service development

## One-command setup

```bash
make setup
```

This will:

1. Create `.env` if missing
2. Sync Traefik gateway secret with workout-service
3. Build and start **mongo-iam**, **mongo-workout**, RabbitMQ, IAM, Workout, Traefik
4. Run an end-to-end smoke test (`scripts/test-gateway.sh`)

## API (after setup)

| What | URL |
|------|-----|
| **Frontend** | http://localhost:3000 |
| **API gateway** | http://localhost |
| **Health (via gateway)** | http://localhost/health |
| Traefik dashboard | http://localhost:8090 |
| RabbitMQ UI | http://localhost:15672 — `fitrack` / `fitrack` |
| **Grafana** | http://localhost:3001 — `admin` / `admin` (change in `.env`) |
| **Prometheus** | http://localhost:9090 |

### Client rules

- `POST /auth/register`, `/auth/login` — no auth header
- `/workouts/*` — **`Authorization: Bearer <accessToken>` only**
- **Never** send `X-User-Id` (returns 400)

Open **http://localhost:3000** after `make setup` — register, sign in, and log workouts in the UI.

All API traffic (browser, curl, tests) goes through **Traefik** at `NEXT_PUBLIC_API_URL` / `GATEWAY_URL` (default `http://localhost`). Do not call backend containers directly from the client.

API clients use `Authorization: Bearer` only (never `X-User-Id`). CORS is handled by Traefik (`gateway/traefik/dynamic/middlewares.yml`). See `scripts/test-gateway.sh`.

### Permanent deletion (no soft-delete)

| Action | Endpoint | Effect |
|--------|----------|--------|
| Delete one workout | `DELETE /workouts/{id}` | Document removed from `fitrack_workout` |
| Delete account | `DELETE /auth/me` | User + refresh tokens removed from `fitrack_iam`; IAM publishes `user.deleted` so the workout service **hard-deletes** all workouts for that user |

There are no tombstone or “deleted” flags in MongoDB. After account deletion, ForwardAuth rejects the old access token even before it expires.

## Make targets

| Command | Description |
|---------|-------------|
| `make setup` | Full first-time setup + smoke test |
| `make up` | Start stack (1 replica per stateless service) |
| `make up-scaled` | Start with **2 IAM + 3 Workout** replicas (horizontal scaling) |
| `make k8s-cluster` | Create local **k3d** cluster + metrics-server |
| `make k8s-deploy` | Deploy full stack to Kubernetes via **Helm** |
| `make load-test-scale-compare` | k6 at 1×1 vs 2×3 replicas (evidence) |
| `make down` | Stop stack |
| `make test` | Unit + integration tests (IAM, Workout, frontend) |
| `make test-gateway` | End-to-end gateway smoke test (stack must be up) |
| `make test-acceptance` | Cucumber BDD tests (`docs/acceptance-scenarios.feature`) |
| `make logs` | Follow logs |
| `make clean` | Stop and remove volumes |
| `make logs-grafana` | Follow Grafana + Prometheus logs |
| `make monitoring` | Start/rebuild IAM, Workout, Prometheus, Grafana |
| `make load-test-smoke` | Quick k6 smoke test via Traefik (30s; pre-check only) |
| `make load-test-nfr-01` | k6 **NFR-01 + NFR-05** — 10 VUs, 1 min, p95 &lt; 5s, 0% 5xx |
| `make load-test` | Alias for `load-test-nfr-01` |
| `make load-test-nfr-03` | k6 **NFR-03** — ramp 0→50 VUs over 8 min, 0% application errors |
| `make load-test-stress` | Alias for `load-test-nfr-03` |
| `make frontend` | Run Next.js dev server locally (backend must be up) |

## Repository layout

```
fitrack/
├── .env                    # Local config (gitignored; created by setup)
├── docker-compose.yml
├── deploy/helm/fitrack/     # Kubernetes Helm chart (HPA, probes, Traefik)
├── gateway/traefik/        # API gateway
├── event-management/rabbitmq/
├── contracts/asyncapi/
├── backend-services/
│   ├── iam-service/
│   └── workout-service/
├── frontends/main-frontend/   # Next.js (atomic design)
├── monitoring/              # Prometheus + Grafana (see monitoring/README.md)
├── load-testing/            # k6 load tests via Traefik (see load-testing/README.md)
├── scripts/setup.sh
├── scripts/test-all.sh
└── Makefile
```

## Architecture

- **Traefik** — routes `/auth` → IAM, `/workouts` → Workout
- **IAM** — JWT auth + `user.registered` events
- **Workout** — workouts DB; trusts `X-Internal-User-Id` from gateway only
- **MongoDB 8.0** — **separate MongoDB server per service** (`mongo-iam`, `mongo-workout`)
- **Scalability** — IAM and Workout scale horizontally (Compose `--scale` or Kubernetes HPA); Traefik load-balances
- **Kubernetes** — Helm chart in `deploy/helm/fitrack/` (k3d locally, GHCR + VPS in prod)
- **RabbitMQ** — async events between services (`user.registered`, `user.deleted` for workout purge; no HTTP coupling)
- **Prometheus + Grafana** — metrics from IAM, Workout, and RabbitMQ (`monitoring/`)

## Troubleshooting

### Migrating from the old shared `mongo` container

If you previously ran FiTrack with a single `mongo` service, recreate volumes so each service gets its own data directory:

```bash
docker compose down -v
make up
```

IAM and workout data from the old shared volume are not migrated automatically.

### Log noise vs real failures

| What you see | Severity | Meaning |
|--------------|----------|---------|
| Mongo `mongosh`, `Connection not authenticating`, `Connection ended` from `127.0.0.1` | OK | Docker health check (`mongosh … ping`) every few seconds |
| `Gracefully Stopping`, `exit code 137`, Traefik `use of closed network connection` | OK | You pressed Ctrl+C; containers receive SIGTERM/SIGKILL |
| Rabbit/Mongo `client unexpectedly closed` / `Connection ended` on stop | OK | Apps disconnect when the stack shuts down |
| Traefik `Failed to retrieve information of the docker client` **while stopping** | OK | Docker API goes away before Traefik exits; harmless |
| Workout `fitrack.encryption.workout-key must be at least 32 characters` on **start** | Fix | Set `WORKOUT_ENCRYPTION_KEY` in `.env` (32+ chars) and restart: `docker compose up -d workout` — compose now passes this variable into the container |
| Workout `ACCESS_REFUSED` / exit code **1** on **start** | Fix | RabbitMQ credentials — see below |
| `403` on `/workouts` from the browser (auth works) | Fix | Rebuild workout (no Spring CORS in Docker) and ensure `NEXT_PUBLIC_API_URL=http://localhost` (not `/api`). Run `docker compose up -d --build workout` and hard-refresh |
| `404` on `http://localhost/auth/*` from the browser | Fix | Restart Traefik after route changes: `docker compose up -d traefik` — routes live in `gateway/traefik/dynamic/routes.yml` |
| `401` on `/auth/register` with IAM logs `email dup key: { email: null }` | Fix | Rebuild IAM and reset Mongo: `docker compose build iam && docker compose down -v && docker compose up -d` |
| `WebSocket … webpack-hmr failed` in the browser console | OK | Next.js dev HMR blip when the frontend container restarts; refresh the page |

### RabbitMQ auth / never healthy

If **rabbitmq** stays `starting` then `unhealthy`, IAM and Workout will not start (`depends_on: service_healthy`).

| Symptom | Fix |
|---------|-----|
| `Health check exceeded timeout (5s)` in `docker inspect … Health` | Pull latest `docker-compose.yml` (`rabbitmqctl await_startup`, 60s timeout) then `docker compose up -d --force-recreate rabbitmq` |
| `ACCESS_REFUSED` in IAM/Workout logs | Broker volume has old credentials — `docker compose down -v` and `docker compose up --build` |
| Healthy but apps fail auth | Ensure `.env` `RABBITMQ_PASSWORD=fitrack` matches `definitions.json` user (default password is `fitrack`) |

First boot often needs **60–90 seconds** before RabbitMQ is healthy. Check:

```bash
docker compose ps rabbitmq
curl -s -o /dev/null -w "%{http_code}" -u fitrack:fitrack http://localhost:15672/api/overview
```

`200` means management API is up.

### Verify the stack is healthy (ignore stop-time noise)

```bash
docker compose ps
curl -fsS http://localhost/actuator/health   # may 404 without route — use:
./scripts/test-gateway.sh
```

If all services are `healthy` / `running` and the smoke test passes, Mongo and Traefik messages in `docker compose logs -f` are informational only.

## Testing & quality assurance

```bash
make test              # Gradle (Testcontainers) + frontend Vitest
make test-acceptance   # Cucumber acceptance (stack up)
make test-gateway      # bash E2E via Traefik (stack up)
make load-test-smoke    # k6 pre-check (not an NFR gate)
make load-test-nfr-01   # NFR-01 + NFR-05 load test
make load-test-nfr-03   # NFR-03 stress test
make load-test          # alias for load-test-nfr-01
make load-test-stress   # alias for load-test-nfr-03
make security-scan-images  # Trivy on IAM/Workout images
make security-scan-dast    # OWASP ZAP baseline (stack must be up)
```

Backend tests use **Testcontainers** with `mongo:8.0` and RabbitMQ where needed. Frontend tests use **Vitest** and React Testing Library under `src/**/*.test.ts(x)`.

| Topic | Document |
|-------|----------|
| **SQA (ISO 25010, test pyramid, CI/CD, measurable criteria)** | [`docs/SQA.md`](docs/SQA.md) |
| Acceptance (Cucumber + Gherkin) | [`acceptance-tests/README.md`](acceptance-tests/README.md) |
| SonarQube / SonarCloud | [`docs/SONAR.md`](docs/SONAR.md) |
| Security (OWASP) | [`docs/SECURITY.md`](docs/SECURITY.md) |
| Load testing | [`load-testing/README.md`](load-testing/README.md) |
| **Deployment & scalability** | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| **Performance (load & stress)** | [`docs/PERFORMANCE_TESTING.md`](docs/PERFORMANCE_TESTING.md) |
| Monitoring | [`monitoring/README.md`](monitoring/README.md) |

**CI:** GitHub Actions runs fast checks on every push (`.github/workflows/ci.yml`); full gateway validation on `main` (`.github/workflows/validation.yml`); **Trivy + OWASP ZAP** on `main` (`.github/workflows/security-scan.yml`).

**CD:** On `main` and `v*` tags, `.github/workflows/cd.yml` builds multi-arch (amd64/arm64) IAM, Workout, and Frontend images and pushes them to GHCR (`ghcr.io/<owner>/fitrack-*`). No extra secrets — uses the built-in `GITHUB_TOKEN`.

See service READMEs under `backend-services/` and `gateway/traefik/README.md`.
