#!/usr/bin/env bash
# Cucumber acceptance tests — docs/acceptance-scenarios.feature (stack must be up)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

export GATEWAY_URL="${GATEWAY_URL:-http://localhost}"

echo "== Cucumber acceptance (gateway: $GATEWAY_URL) =="
(cd "$ROOT/acceptance-tests" && npm ci && npm test)

echo "Report: acceptance-tests/reports/cucumber-report.json"
