#!/usr/bin/env bash
# One-command local setup: .env, Traefik config, Docker stack, smoke test.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop and start the daemon."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Start Docker Desktop and retry."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
elif ! grep -q '^WORKOUT_ENCRYPTION_KEY=' .env 2>/dev/null; then
  echo "Adding WORKOUT_ENCRYPTION_KEY to .env (required by workout-service)"
  printf '\n# --- Workout encryption at rest (min 32 chars) ---\nWORKOUT_ENCRYPTION_KEY=fitrack-dev-workout-encryption-key-32b\n' >> .env
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

./scripts/render-traefik.sh

echo "Building and starting stack..."
docker compose up --build -d

wait_for_url() {
  local name=$1
  local url=$2
  local max=${3:-90}
  echo -n "Waiting for $name"
  for ((i = 1; i <= max; i++)); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo " — ready"
      return 0
    fi
    echo -n "."
    sleep 2
  done
  echo " — timed out"
  return 1
}

wait_for_url "IAM" "http://127.0.0.1:${IAM_PORT:-8080}/actuator/health" 120
wait_for_url "API gateway" "${GATEWAY_URL:-http://localhost}/auth/login" 60 || true

echo ""
echo "Running gateway smoke test..."
./scripts/test-gateway.sh

echo ""
echo "FitTrack is up."
echo "  Frontend:   http://127.0.0.1:${FRONTEND_PORT:-3000}"
echo "  API:        ${GATEWAY_URL:-http://localhost}"
echo "  IAM debug:  http://127.0.0.1:${IAM_PORT:-8080}"
echo "  Traefik UI: http://127.0.0.1:${TRAEFIK_DASHBOARD_PORT:-8090}"
echo "  RabbitMQ:   http://127.0.0.1:${RABBITMQ_MANAGEMENT_PORT:-15672} (${RABBITMQ_USER:-fitrack} / ${RABBITMQ_PASSWORD:-fitrack})"
echo "  Grafana:    http://127.0.0.1:${GRAFANA_PORT:-3001} (${GRAFANA_ADMIN_USER:-admin} / see .env)"
echo "  Prometheus: http://127.0.0.1:${PROMETHEUS_PORT:-9090}"
