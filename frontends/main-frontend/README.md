# FiTrack main frontend

Next.js 14 dashboard for auth and workout logging.

## Configuration

- `NEXT_PUBLIC_API_URL` — Traefik gateway (default `http://localhost`)
- Sends **`Authorization: Bearer`** only; never `X-User-Id`

## Component structure (atomic design)

```
src/components/
├── atoms/       # Button, Input, Text, Card, …
├── molecules/   # FormField, StatCard, …
├── organisms/   # LoginForm, WorkoutList, Header, …
└── templates/   # AppTemplate, AuthTemplate (page shells)
```

Pages under `src/app/` stay thin and compose templates + organisms.

## Run with Docker (recommended)

From repo root:

```bash
docker compose up --build
```

Open http://localhost:3000

## Run locally

Backend must be up on the gateway (`make up`). Then:

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Tests

```bash
npm install
npm test          # watch mode
npm run test:run  # CI / one-shot
```

From repo root, `make test` runs backend Gradle tests and frontend Vitest together.
