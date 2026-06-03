# AsyncAPI contracts

Event contracts for RabbitMQ (`fitrack.events` topic exchange).

| Spec | Routing key | Publisher | Consumers |
|------|-------------|-----------|-----------|
| [user-events.asyncapi.yaml](./user-events.asyncapi.yaml) | `user.registered` | IAM | Workout (and future services) |
| [workout-events.asyncapi.yaml](./workout-events.asyncapi.yaml) | `workout.created` | Workout (planned) | — |

Payload DTOs are duplicated per service until a shared `packages/` library exists. Field names must match these specs.
