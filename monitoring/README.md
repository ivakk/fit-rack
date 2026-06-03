# FitTrack monitoring

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

Open Grafana → **Dashboards** → **FitTrack** folder → **FitTrack overview**.

Panels: service up/down, HTTP request rate, 5xx rate, JVM heap.

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
