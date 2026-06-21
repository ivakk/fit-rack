#!/usr/bin/env bash
# Build images, sync Helm config, and deploy FiTrack to Kubernetes (k3d or any kube context).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

VALUES_FILE="${K8S_VALUES_FILE:-deploy/helm/fitrack/values-dev.yaml}"
RELEASE="${HELM_RELEASE:-fitrack}"
NAMESPACE="${K8S_NAMESPACE:-fitrack}"
CHART="${ROOT}/deploy/helm/fitrack"
CONFIG_DIR="${CHART}/config/rabbitmq"

echo "==> Sync RabbitMQ config into Helm chart"
mkdir -p "${CONFIG_DIR}"
cp "${ROOT}/event-management/rabbitmq/definitions.json" "${CONFIG_DIR}/"
cp "${ROOT}/event-management/rabbitmq/rabbitmq.conf" "${CONFIG_DIR}/"

BUILD_IMAGES="${K8S_BUILD_IMAGES:-1}"
if [ "${BUILD_IMAGES}" = "1" ]; then
  echo "==> Building IAM and Workout container images"
  docker compose build iam workout
fi

if command -v k3d >/dev/null 2>&1 && k3d cluster list 2>/dev/null | grep -q "k3d-${K3D_CLUSTER_NAME:-fitrack}"; then
  CLUSTER="${K3D_CLUSTER_NAME:-fitrack}"
  echo "==> Importing images into k3d cluster '${CLUSTER}'"
  k3d image import fitrack-iam:latest fitrack-workout:latest -c "${CLUSTER}"
fi

if ! command -v helm >/dev/null 2>&1; then
  echo "helm is not installed. See https://helm.sh/docs/intro/install/"
  exit 1
fi

HELM_SET=(
  --set "secrets.jwtSecret=${IAM_JWT_SECRET:-supersecretkeysupersecretkey123456}"
  --set "secrets.jwtIssuer=${IAM_JWT_ISSUER:-fitrack-iam}"
  --set "secrets.jwtAccessTtlMinutes=${IAM_JWT_ACCESS_TTL_MINUTES:-60}"
  --set "secrets.gatewayTrustedSecret=${GATEWAY_TRUSTED_SECRET:-fitrack-dev-gateway}"
  --set "secrets.workoutEncryptionKey=${WORKOUT_ENCRYPTION_KEY:-fitrack-dev-workout-encryption-key-32b}"
  --set "secrets.rabbitmqUser=${RABBITMQ_USER:-fitrack}"
  --set "secrets.rabbitmqPassword=${RABBITMQ_PASSWORD:-fitrack}"
  --set "replicas.iam=${IAM_REPLICAS:-2}"
  --set "replicas.workout=${WORKOUT_REPLICAS:-3}"
  --set "autoscaling.workout.minReplicas=${WORKOUT_REPLICAS:-3}"
  --set "autoscaling.workout.maxReplicas=${WORKOUT_HPA_MAX:-5}"
)

echo "==> Helm upgrade --install ${RELEASE} (namespace ${NAMESPACE})"
helm upgrade --install "${RELEASE}" "${CHART}" \
  -f "${VALUES_FILE}" \
  -n "${NAMESPACE}" \
  --create-namespace \
  "${HELM_SET[@]}" \
  --wait \
  --timeout 10m

echo "==> Waiting for rollouts"
kubectl rollout status deployment/iam -n "${NAMESPACE}" --timeout=300s
kubectl rollout status deployment/workout -n "${NAMESPACE}" --timeout=300s
kubectl rollout status deployment/traefik -n "${NAMESPACE}" --timeout=120s

echo ""
echo "FiTrack deployed to Kubernetes."
kubectl get pods,svc,hpa -n "${NAMESPACE}"
echo ""
echo "  API:      http://localhost (k3d LoadBalancer on port 80)"
echo "  Traefik:  http://localhost:8090"
echo ""
echo "Smoke test: GATEWAY_URL=http://localhost ./scripts/test-gateway.sh"
