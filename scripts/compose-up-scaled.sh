#!/usr/bin/env bash
# Start FiTrack with horizontally scaled stateless services (IAM + Workout).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

IAM_REPLICAS="${IAM_REPLICAS:-2}"
WORKOUT_REPLICAS="${WORKOUT_REPLICAS:-3}"

./scripts/render-traefik.sh

echo "Starting FiTrack (iam=${IAM_REPLICAS}, workout=${WORKOUT_REPLICAS} replicas)..."
docker compose up --build -d \
  --scale "iam=${IAM_REPLICAS}" \
  --scale "workout=${WORKOUT_REPLICAS}"

echo ""
echo "Scaled stack up. API: ${GATEWAY_URL:-http://localhost}"
docker compose ps iam workout
