#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
# shellcheck disable=SC1091
[ -f .env ] && set -a && source .env && set +a
export GATEWAY_TRUSTED_SECRET="${GATEWAY_TRUSTED_SECRET:-fitrack-dev-gateway}"
if command -v envsubst >/dev/null 2>&1; then
  envsubst '${GATEWAY_TRUSTED_SECRET}' < gateway/traefik/dynamic/middlewares.yml.template \
    > gateway/traefik/dynamic/middlewares.yml
else
  sed "s/\${GATEWAY_TRUSTED_SECRET}/${GATEWAY_TRUSTED_SECRET}/g" \
    gateway/traefik/dynamic/middlewares.yml.template > gateway/traefik/dynamic/middlewares.yml
fi
