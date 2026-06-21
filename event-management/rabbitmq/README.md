# RabbitMQ (FiTrack)

Broker config for local and Docker Compose.

## Topology

| Resource | Name |
|----------|------|
| Topic exchange | `fitrack.events` |
| Routing key | `user.registered` |
| Queue (workout consumer) | `workout-service.user-registered` |

Publishers (IAM) send to the exchange with a routing key. Consumers bind their own queues — services do not call each other over HTTP for these flows.

## Management UI

- URL: http://localhost:15672
- User / password: `fitrack` / `fitrack` (from `definitions.json`; must match `RABBITMQ_USER` / `RABBITMQ_PASSWORD` in `.env`)

## Health check

Docker marks RabbitMQ healthy when `rabbitmqctl await_startup` succeeds (broker ready for AMQP). First boot may take **~10–60s**. If IAM/Workout never start, run:

```bash
docker compose ps rabbitmq
docker compose logs rabbitmq --tail 30
```

If the broker was **unhealthy** after an old config (`rabbitmq-diagnostics ping` with a 5s timeout), recreate:

```bash
docker compose up -d --force-recreate rabbitmq
```

Credential mismatch after changing `.env` passwords: `docker compose down -v` then `docker compose up --build`.

## Add a new consumer

1. Add a queue + binding in `definitions.json` (routing key must match `contracts/asyncapi/`).
2. Subscribe in the service with `@RabbitListener(queues = "...")`.
3. Use a message DTO that matches the AsyncAPI payload (duplicate per service until `packages/` shared lib exists).
