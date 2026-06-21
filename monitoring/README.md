# FiTrack monitoring

Prometheus scrapes metrics from Spring Boot services and RabbitMQ. Grafana visualizes them on a pre-provisioned dashboard.

## URLs (default)

| Service | URL |
|---------|-----|
| **Grafana** | http://localhost:3001 |
| **Prometheus** | http://localhost:9090 |

Grafana login: `GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD` from `.env` (defaults `admin` / `admin`).

## What is scraped

| Target | Endpoint | Notes |
|--------|----------|--------|
| IAM | `http://iam:8080/actuator/prometheus` | Micrometer + JVM + HTTP metrics |
| Workout | `http://workout:8080/actuator/prometheus` | Same |
| RabbitMQ | `http://rabbitmq:15692/metrics` | Built-in Prometheus plugin |
| Prometheus | `localhost:9090` | Self-monitoring |

Metrics endpoints are on the **Docker network only** — not routed through Traefik.

## Dashboard

Open Grafana → **Dashboards** → **FiTrack** folder → **FiTrack overview**.

Panels include:

- Service **UP** (IAM, Workout, RabbitMQ, Prometheus)
- **HTTP** request rate, rate by outcome (2xx/4xx/5xx), avg/max latency, in-flight requests
- **5xx / 4xx** panels use `noValue: 0` — a flat line at **0** means healthy (no errors), not “no data”
- **MongoDB** command rate, **JVM** heap/GC/CPU, **RabbitMQ** publish/deliver, **log** errors/warnings

After editing the dashboard JSON, restart Grafana or wait ~10s for file provisioning to reload:

```bash
docker compose restart grafana
```

## Configuration

- `monitoring/prometheus/prometheus.yml` — scrape targets and intervals
- `monitoring/grafana/provisioning/` — datasource and dashboard provisioning

After editing Prometheus config:

```bash
docker compose restart prometheus
# or reload: curl -X POST http://localhost:9090/-/reload
```

## Start monitoring only

Monitoring starts with the main stack:

```bash
make up
```

Rebuild backend images after adding Micrometer (first time):

```bash
docker compose up -d --build iam workout prometheus grafana
```
