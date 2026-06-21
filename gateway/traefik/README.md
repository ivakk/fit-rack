# Traefik API gateway

Single HTTP entry point: **http://localhost** (port 80).

## Client rules

- Send **`Authorization: Bearer <accessToken>`** for `/workouts/*`.
- **Do not** send `X-User-Id` or `X-Internal-User-Id` — Traefik strips them and IAM injects identity after ForwardAuth.

## Request flow (`/workouts`)

1. `strip-client-identity` — clears spoofed identity headers from the client
2. `iam-forwardauth` — IAM `GET /auth/forward-auth` validates JWT
3. `gateway-trusted` — adds `X-Gateway-Trusted` (shared secret with workout-service)
4. Workout reads `X-Internal-User-Id` + verifies `X-Gateway-Trusted`

## Routes

| Path | Service | Auth |
|------|---------|------|
| `/health` | IAM (`/actuator/health`) | Public — liveness for probes and DAST seed |
| `/auth/*` | IAM | Public |
| `/workouts/*` | Workout | ForwardAuth + gateway trust |

`OPTIONS` for `/auth` and `/workouts` use dedicated routers (CORS only, no ForwardAuth) so browser preflight succeeds.

Routes are defined in `dynamic/routes.yml` (file provider), not Docker labels — avoids Traefik failing to discover containers when the Docker socket is unavailable.

## Verify

```bash
docker compose up --build -d
./scripts/test-gateway.sh
```

Dashboard (dev): http://localhost:8090
