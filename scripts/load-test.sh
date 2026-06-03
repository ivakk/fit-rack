#!/usr/bin/env bash
# Run k6 load tests against the Traefik gateway (Docker network).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SCRIPT="${1:-full-flow}"
shift || true

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

mkdir -p load-testing/results

export K6_GATEWAY_URL="${K6_GATEWAY_URL:-http://traefik:80}"
export K6_RUN_ID="${K6_RUN_ID:-$(date +%s)}"

if [ "$SCRIPT" = "smoke" ]; then
  export K6_VUS="${K6_VUS:-3}"
  export K6_DURATION="${K6_DURATION:-30s}"
  export K6_SETUP_USERS="${K6_SETUP_USERS:-1}"
  export K6_SETUP_DELAY="${K6_SETUP_DELAY:-0}"
else
  export K6_VUS="${K6_VUS:-10}"
  export K6_DURATION="${K6_DURATION:-1m}"
  export K6_SETUP_USERS="${K6_SETUP_USERS:-10}"
  export K6_SETUP_DELAY="${K6_SETUP_DELAY:-7}"
fi

K6_SCRIPT="load-testing/k6/${SCRIPT}.js"
if [ ! -f "$K6_SCRIPT" ]; then
  echo "Unknown script: $SCRIPT (expected $K6_SCRIPT)"
  exit 1
fi

if ! docker compose ps --status running 2>/dev/null | grep -qE 'traefik|fitrack-traefik'; then
  echo "Stack is not running. Start with: make up"
  exit 1
fi

echo "FitTrack load test: $SCRIPT"
echo "  Gateway:     $K6_GATEWAY_URL"
echo "  VUs:         $K6_VUS"
echo "  Duration:    $K6_DURATION"
echo "  Setup users: $K6_SETUP_USERS (delay ${K6_SETUP_DELAY}s)"
echo ""

docker compose --profile loadtest run --rm \
  -e K6_GATEWAY_URL \
  -e K6_VUS \
  -e K6_DURATION \
  -e K6_SETUP_USERS \
  -e K6_SETUP_DELAY \
  -e K6_RUN_ID \
  k6 run \
  --summary-export="/scripts/results/summary-${K6_RUN_ID}.json" \
  "/scripts/k6/${SCRIPT}.js"

# Copy result out of the ephemeral container mount
if [ -f "load-testing/results/summary-${K6_RUN_ID}.json" ]; then
  echo ""
  echo "Summary saved: load-testing/results/summary-${K6_RUN_ID}.json"
fi
