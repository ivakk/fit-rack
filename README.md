# FitTrack

Polyglot monorepo for the FitTrack fitness platform.

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
3. Build and start MongoDB, RabbitMQ, IAM, Workout, Traefik
4. Run an end-to-end smoke test (`scripts/test-gateway.sh`)

## API (after setup)

| What | URL |
|------|-----|
| **Frontend** | http://localhost:3000 |
| **API gateway** | http://localhost |
| Traefik dashboard | http://localhost:8090 |
| IAM (debug only) | http://localhost:8080 |
| RabbitMQ UI | http://localhost:15672 — `fitrack` / `fitrack` |
| **Grafana** | http://localhost:3001 — `admin` / `admin` (change in `.env`) |
| **Prometheus** | http://localhost:9090 |

### Client rules

- `POST /auth/register`, `/auth/login` — no auth header
- `/workouts/*` — **`Authorization: Bearer <accessToken>` only**
- **Never** send `X-User-Id` (returns 400)

Open **http://localhost:3000** after `make setup` — register, sign in, and log workouts in the UI.

All API traffic (browser, curl, tests) goes through **Traefik** at `NEXT_PUBLIC_API_URL` / `GATEWAY_URL` (default `http://localhost`). Do not call IAM `:8080` or workout containers directly from the client.

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
| `make up` | Start stack (renders Traefik config from `.env`) |
| `make down` | Stop stack |
| `make test` | Unit + integration tests (IAM, Workout, frontend) |
| `make test-gateway` | End-to-end gateway smoke test (stack must be up) |
| `make logs` | Follow logs |
| `make clean` | Stop and remove volumes |
| `make logs-grafana` | Follow Grafana + Prometheus logs |
| `make monitoring` | Start/rebuild IAM, Workout, Prometheus, Grafana |
| `make frontend` | Run Next.js dev server locally (backend must be up) |

## Repository layout

```
fitrack/
├── .env                    # Local config (gitignored; created by setup)
├── docker-compose.yml
├── gateway/traefik/        # API gateway
├── event-management/rabbitmq/
├── contracts/asyncapi/
├── backend-services/
│   ├── iam-service/
│   └── workout-service/
├── frontends/main-frontend/   # Next.js (atomic design)
├── monitoring/              # Prometheus + Grafana (see monitoring/README.md)
├── scripts/setup.sh
├── scripts/test-all.sh
└── Makefile
```

## Architecture

- **Traefik** — routes `/auth` → IAM, `/workouts` → Workout
- **IAM** — JWT auth + `user.registered` events
- **Workout** — workouts DB; trusts `X-Internal-User-Id` from gateway only
- **MongoDB 8.0** — separate databases per service (`fitrack_iam`, `fitrack_workout`)
- **RabbitMQ** — async events between services (`user.registered`, `user.deleted` for workout purge; no HTTP coupling)
- **Prometheus + Grafana** — metrics from IAM, Workout, and RabbitMQ (`monitoring/`)

## Troubleshooting

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

### RabbitMQ auth

If **workout** or **iam** exit with `AuthenticationFailureException` / `ACCESS_REFUSED` for RabbitMQ, the broker volume may have been created with different credentials than your `.env`. Reset volumes and restart:

```bash
docker compose down -v
docker compose up --build
```

### Verify the stack is healthy (ignore stop-time noise)

```bash
docker compose ps
curl -fsS http://localhost/actuator/health   # may 404 without route — use:
./scripts/test-gateway.sh
```

If all services are `healthy` / `running` and the smoke test passes, Mongo and Traefik messages in `docker compose logs -f` are informational only.

## Testing

```bash
make test              # Gradle (Testcontainers) + frontend Vitest
make test-gateway      # Live stack smoke test via Traefik
```

Backend tests use **Testcontainers** with `mongo:8.0` and RabbitMQ where needed. Frontend tests use **Vitest** and React Testing Library under `src/**/*.test.ts(x)`.

See service READMEs under `backend-services/` and `gateway/traefik/README.md`.

**Security:** OWASP Top 10 controls and production checklist — [`docs/SECURITY.md`](docs/SECURITY.md).
