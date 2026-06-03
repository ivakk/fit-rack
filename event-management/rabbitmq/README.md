# RabbitMQ (FitTrack)

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
- User / password: see root `.env.example` (`RABBITMQ_USER` / `RABBITMQ_PASSWORD`)

## Add a new consumer

1. Add a queue + binding in `definitions.json` (routing key must match `contracts/asyncapi/`).
2. Subscribe in the service with `@RabbitListener(queues = "...")`.
3. Use a message DTO that matches the AsyncAPI payload (duplicate per service until `packages/` shared lib exists).
