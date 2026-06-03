# IAM service

Identity and access management (registration, login, JWT, refresh tokens).

- **Stack:** Java 21, Spring Boot 3.5, Spring Data MongoDB
- **Database:** MongoDB (`fitrack_iam` database, `users` and `refresh_tokens` collections)
- **Events:** Publishes `user.registered` to RabbitMQ (`fitrack.events`) after registration

## Run locally

**Option A — Docker (Mongo + API)**

From the repo root:

```bash
docker compose up --build
```

**Option B — native Gradle**

Start MongoDB (e.g. `docker run -d -p 27017:27017 mongo:8.0`), then:

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
| GET | `/auth/forward-auth` | Traefik ForwardAuth — returns `X-User-Id` headers (not for clients) |

**Gateway:** http://localhost/auth/… (Traefik). **Direct debug:** http://localhost:8080

User IDs in JWT and responses are MongoDB ObjectId strings.

## Tests

```bash
./gradlew test
```

Uses Testcontainers with a temporary MongoDB 7 instance.
