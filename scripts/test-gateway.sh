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

WORKOUT_ID=$(extract_json_field "$CREATE" "id")
if [ -z "$WORKOUT_ID" ] || [ "$WORKOUT_ID" = "null" ]; then
  echo "Failed to extract workout id from: $CREATE"
  exit 1
fi

echo "== Delete workout (hard delete) =="
curl -sf -X DELETE "$GATEWAY/workouts/$WORKOUT_ID" -H "Authorization: Bearer $TOKEN"
echo "Deleted workout $WORKOUT_ID."

echo "== Create second workout before account delete =="
curl -sf -X POST "$GATEWAY/workouts" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Pre-delete workout","exercises":[]}' > /dev/null

echo "== Delete account (hard delete + async workout purge) =="
curl -sf -X DELETE "$GATEWAY/auth/me" -H "Authorization: Bearer $TOKEN"
echo "Account deleted."

echo "== Workouts denied after account delete (expect HTTP 401) =="
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY/workouts" -H "Authorization: Bearer $TOKEN")
if [ "$STATUS" != "401" ]; then
  echo "Expected 401 for workouts after account delete, got $STATUS"
  exit 1
fi
echo "Token no longer grants workout access (401)."

echo "== Re-register same email (IAM row fully removed) =="
curl -sf -X POST "$GATEWAY/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"secret123\",\"fullName\":\"Gateway Test\",\"phoneNumber\":\"+1\",\"gender\":\"other\"}" > /dev/null
echo "Re-registration succeeded."

echo "All gateway checks passed."
