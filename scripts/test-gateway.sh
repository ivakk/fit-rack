#!/usr/bin/env bash
# End-to-end: Traefik + IAM ForwardAuth + workout (Bearer only, no X-User-Id).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

GATEWAY="${GATEWAY_URL:-http://localhost}"
EMAIL="gateway-test-$(date +%s)@fitrack.test"

extract_json_field() {
  local json=$1
  local field=$2
  if command -v jq >/dev/null 2>&1; then
    echo "$json" | jq -r ".$field"
  else
    echo "$json" | sed -n "s/.*\"$field\":\"\\([^\"]*\\)\".*/\\1/p" | head -1
  fi
}

echo "== Register via gateway ($GATEWAY) =="
REGISTER=$(curl -sf -X POST "$GATEWAY/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"fullName\":\"Gateway Test\",\"phoneNumber\":\"+1\",\"gender\":\"other\"}")

TOKEN=$(extract_json_field "$REGISTER" "accessToken")
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to extract accessToken from: $REGISTER"
  exit 1
fi
echo "Got access token."

echo "== Create workout via gateway (Bearer only) =="
CREATE=$(curl -sf -X POST "$GATEWAY/workouts" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Gateway workout","exercises":[{"name":"Squat","sets":3,"reps":10,"weightKg":60}]}')
echo "$CREATE"

echo "== Reject spoofed X-User-Id (expect HTTP 400) =="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$GATEWAY/workouts" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'X-User-Id: attacker-id' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Bad","exercises":[]}')
if [ "$STATUS" != "400" ]; then
  echo "Expected 400 when sending X-User-Id, got $STATUS"
  exit 1
fi
echo "Correctly rejected client X-User-Id (400)."

echo "== List workouts via gateway =="
curl -sf "$GATEWAY/workouts" -H "Authorization: Bearer $TOKEN"
echo ""
echo "All gateway checks passed."
