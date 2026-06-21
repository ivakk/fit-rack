# FiTrack deployment

Production-shaped deployment for FiTrack: **horizontal scaling** of stateless services and **Kubernetes** orchestration.

## Layout

```
deploy/
└── helm/fitrack/          Helm chart (IAM, Workout, Traefik, MongoDB×2, RabbitMQ)
    ├── values.yaml        defaults
    ├── values-dev.yaml    local k3d (built images)
    └── values-prod.yaml   GHCR images + higher replica bounds
```

## Quick start — Docker Compose (scaled)

```bash
make up-scaled          # iam=2, workout=3 replicas (override via .env)
make test-gateway
make load-test-nfr-01
```

## Quick start — Kubernetes (k3d)

Requires [k3d](https://k3d.io/), [kubectl](https://kubernetes.io/docs/tasks/tools/), [Helm 3](https://helm.sh/).

```bash
make k8s-cluster        # create k3d cluster + metrics-server (HPA)
make k8s-deploy         # build images, helm install
make test-gateway       # http://localhost
kubectl get hpa -n fitrack
```

Teardown:

```bash
make k8s-teardown
K3D_DELETE_CLUSTER=1 make k8s-teardown   # also delete k3d cluster
```

## Scalability evidence

```bash
make load-test-scale-compare   # k6 at 1×1 vs 2×3 replicas (Compose)
```

Compare JSON summaries under `load-testing/results/`.

## Production (VPS / cloud)

1. Push images via CD (`cd.yml` → GHCR).
2. Create kubeconfig secret in GitHub (`KUBE_CONFIG`).
3. Deploy with `values-prod.yaml` and `--set images.iam.repository=ghcr.io/OWNER/fitrack-iam`.
4. Use managed MongoDB Atlas + CloudAMQP instead of in-cluster StatefulSets when operating for real.

See [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) for the full runbook.
