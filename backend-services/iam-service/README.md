# IAM service

Identity and access management (registration, login, JWT, refresh tokens).

- **Stack:** Java 21, Spring Boot 3.5, Spring Data MongoDB
- **Database:** dedicated MongoDB instance (`mongo-iam` in Docker, port **27017** on host) — database `fitrack_iam`, collections `users` and `refresh_tokens`
- **Events:** Publishes `user.registered` to RabbitMQ (`fitrack.events`) after registration

## Run locally

**Option A — Docker (full stack)**

From the repo root:

```bash
docker compose up --build
```

IAM connects to **`mongo-iam:27017`** (not shared with the workout service).

**Option B — native Gradle**

Start the IAM MongoDB instance only (workout uses a separate server on port 27018):

```bash
docker run -d --name fitrack-mongo-iam -p 27017:27017 mongo:8.0
```

Then:

```bash
./gradlew bootRun
```

Default URI: `mongodb://localhost:27017/fitrack_iam` (`application-dev.properties`).

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Issue tokens |
| POST | `/auth/refresh` | Rotate refresh token |
| GET | `/auth/me` | Current user (`Authorization: Bearer …`) |
| DELETE | `/auth/me` | Permanently delete account and all refresh tokens (publishes `user.deleted` for workout purge) |
| GET | `/auth/forward-auth` | Traefik ForwardAuth — returns `X-User-Id` headers (not for clients) |

**Gateway:** http://localhost/auth/… (Traefik). **Direct debug:** http://localhost:8080

User IDs in JWT and responses are MongoDB ObjectId strings.

## Tests

```bash
./gradlew test
```

Uses Testcontainers with a temporary MongoDB 8 instance.
