#!/usr/bin/env bash
# Compare k6 load-test results at different Workout replica counts (Docker Compose).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

mkdir -p load-testing/results

run_scenario() {
  local iam=$1
  local workout=$2
  local label=$3
  echo ""
  echo "========== Scale test: iam=${iam}, workout=${workout} (${label}) =========="
  docker compose down --remove-orphans 2>/dev/null || true
  IAM_REPLICAS="${iam}" WORKOUT_REPLICAS="${workout}" ./scripts/compose-up-scaled.sh
  chmod +x scripts/wait-for-stack.sh
  ./scripts/wait-for-stack.sh 300
  export K6_RUN_ID="scale-${label}-$(date +%s)"
  ./scripts/load-test.sh nfr-01-load
}

run_scenario 1 1 "baseline"
run_scenario 2 3 "scaled"

echo ""
echo "Compare summaries in load-testing/results/summary-scale-*.json"
