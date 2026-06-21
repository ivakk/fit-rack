#!/usr/bin/env bash
# Wait until core FiTrack services are healthy and Traefik routes to IAM.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MAX_WAIT="${1:-300}"
INTERVAL=5
elapsed=0

echo "Waiting for FiTrack stack (timeout ${MAX_WAIT}s)..."

while [ "$elapsed" -lt "$MAX_WAIT" ]; do
  healthy=$(docker compose ps 2>/dev/null | grep -c "(healthy)" || true)
  if [ "${healthy:-0}" -ge 5 ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST "http://localhost/auth/login" \
      -H "Content-Type: application/json" \
      -d '{}' || true)
    if [ "$status" = "400" ] || [ "$status" = "401" ] || [ "$status" = "422" ]; then
      echo "Stack ready (${healthy} healthy services; gateway → IAM OK)."
      docker compose ps
      exit 0
    fi
  fi
  sleep "$INTERVAL"
  elapsed=$((elapsed + INTERVAL))
done

echo "Timeout waiting for stack."
docker compose ps
exit 1
