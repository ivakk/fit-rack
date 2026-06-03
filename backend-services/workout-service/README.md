# Workout service

Stores user workouts in MongoDB. **Does not validate JWTs** and does not depend on IAM at runtime.

## Event consumption

Subscribes to **`user.registered`** on queue `workout-service.user-registered` (routing key from IAM). No HTTP call to IAM — payload shape is defined in `contracts/asyncapi/user-events.asyncapi.yaml`.

`user.deleted` triggers permanent removal of all workouts for that user from MongoDB.

## Authentication model

| Layer | Responsibility |
|-------|----------------|
| **IAM service** | Register, login, issue/validate JWT |
| **Traefik gateway** | ForwardAuth to IAM; injects `X-Internal-User-Id` and `X-Gateway-Trusted` |
| **Workout service** | Trust gateway headers only (docker profile); rejects client `X-User-Id` |

The workout service never imports IAM libraries or JWT secrets.

## API

Clients call through the gateway with **`Authorization: Bearer`** only. The gateway adds internal identity headers — never send `X-User-Id` from the browser.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/workouts` | Create workout |
| GET | `/workouts` | List current user's workouts |
| GET | `/workouts/{id}` | Get one workout |
| PUT | `/workouts/{id}` | Update workout |
| PUT | `/workouts/{id}` | Update workout (send full `exercises` list to add, remove, or replace entries) |
| DELETE | `/workouts/{id}` | Delete workout |

## Local development

**Docker (Traefik gateway):** from repo root:

```bash
docker compose up --build
```

**Via gateway (required in Docker):**

```bash
./scripts/test-gateway.sh
```

1. Register: `POST http://localhost/auth/register`
2. Call workouts with **Bearer token only** (never `X-User-Id`):

```bash
curl -X POST http://localhost/workouts \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -d '{"title":"Leg day","exercises":[{"name":"Squat","sets":4,"reps":8,"weightKg":80}]}'
```

Traefik strips client identity headers, IAM validates JWT, workout receives `X-Internal-User-Id` + `X-Gateway-Trusted`.

**Native Gradle (no Traefik):** `fitrack.gateway.require-trusted-header=false` in `application-dev` — manual `X-User-Id` only for local debugging.

**Native:** `./gradlew bootRun` (Mongo + RabbitMQ on localhost; no Traefik unless you run compose).

## Database

- URI (dev): `mongodb://localhost:27017/fitrack_workout`
- Collection: `workouts` (embedded exercises)

## Tests

```bash
./gradlew test
```
