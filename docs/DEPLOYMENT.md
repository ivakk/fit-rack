# FiTrack deployment & scalability

This document describes how FiTrack is deployed for **local development**, **horizontal scaling**, and **Kubernetes**.

## Architecture

```text
                    [ Traefik — API gateway ]
                              |
              +---------------+---------------+
              |                               |
        [ IAM × N ]                     [ Workout × N ]
        stateless                       stateless
              |                               |
       [ mongo-iam ]                   [ mongo-workout ]
       dedicated instance              dedicated instance
              \_____________________________/
                              |
                        [ RabbitMQ ]
                     (async events only)
```

**Scalable:** IAM, Workout (add replicas; Traefik/K8s Service load-balances).  
**Not horizontally scaled in dev:** MongoDB, RabbitMQ (use managed services in production).

## Docker Compose

### Single replica (default)

```bash
make up
```

### Horizontal scaling

```bash
make up-scaled
# or
IAM_REPLICAS=2 WORKOUT_REPLICAS=5 make up-scaled
```

IAM and Workout no longer bind host ports — use the gateway at `http://localhost`.

Traefik `loadBalancer` services in `gateway/traefik/dynamic/routes.yml` distribute traffic across all Compose tasks for `iam` and `workout`.

### Scale comparison load test

```bash
make load-test-scale-compare
```

Runs NFR-01 load test at **1×1** then **2×3** replicas; saves JSON under `load-testing/results/`.

## Kubernetes (Helm)

### Prerequisites

- Docker (build images)
- [k3d](https://k3d.io/) for local clusters
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

### Local k3d

```bash
make k8s-cluster    # port 80 → API, 8090 → Traefik dashboard
make k8s-deploy      # sync config, build, helm upgrade --install
```

Verify:

```bash
kubectl get pods,svc,hpa -n fitrack
GATEWAY_URL=http://localhost make test-gateway
make load-test-nfr-01   # stack must reach k6 via host port 80
```

### Helm values

| File | Use |
|------|-----|
| `values.yaml` | Chart defaults |
| `values-dev.yaml` | k3d + locally built `fitrack-iam:latest` |
| `values-prod.yaml` | GHCR images, higher HPA ceiling |

Override secrets from `.env` (never commit real prod secrets):

```bash
helm upgrade --install fitrack deploy/helm/fitrack \
  -f deploy/helm/fitrack/values-prod.yaml \
  --set secrets.jwtSecret="$IAM_JWT_SECRET" \
  --set images.iam.repository=ghcr.io/YOU/fitrack-iam
```

### Horizontal Pod Autoscaler

Workout HPA is **enabled by default** (`minReplicas: 2`, `maxReplicas: 5`, CPU 70%).  
Requires **metrics-server** (installed by `make k8s-cluster`).

```bash
kubectl get hpa -n fitrack -w
```

### Probes

Spring Boot actuator probes (docker/k8s profile):

- Startup/readiness: `/actuator/health/readiness`
- Liveness: `/actuator/health/liveness`

Rolling updates use `maxUnavailable: 0` for zero-downtime deploys.

## CI/CD

| Workflow | Purpose |
|----------|---------|
| `cd.yml` | Build & push multi-arch images to GHCR |
| `deploy-k8s.yml` | Manual Helm deploy (requires `KUBE_CONFIG` secret) |

## Production recommendations

| Component | Dev (this repo) | Production |
|-----------|-----------------|------------|
| IAM / Workout | Compose scale or K8s Deployment | K8s Deployment + HPA |
| MongoDB | In-cluster StatefulSet or Compose | **MongoDB Atlas** (separate clusters per service) |
| RabbitMQ | In-cluster StatefulSet or Compose | **CloudAMQP** or managed broker |
| TLS | HTTP | cert-manager + Let's Encrypt |
| Secrets | `.env` / K8s Secret | External Secrets Operator / vault |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Compose scale fails | Remove old `container_name` containers; `docker compose down --remove-orphans` |
| HPA shows `<unknown>` | Install metrics-server; wait 1–2 min |
| k3d port 80 in use | Stop Compose Traefik or change k3d port mapping |
| RabbitMQ not ready in K8s | `kubectl logs statefulset/rabbitmq -n fitrack`; first boot ~60s |
| Helm missing RabbitMQ exchanges | Re-run deploy — `k8s-deploy.sh` copies `definitions.json` into the chart |

See also: [`deploy/README.md`](../deploy/README.md), [`load-testing/README.md`](../load-testing/README.md).
