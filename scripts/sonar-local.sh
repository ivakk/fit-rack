#!/usr/bin/env bash
# Local SonarCloud/SonarQube scan via Gradle SonarQube plugin.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export SONAR_HOST_URL="${SONAR_HOST_URL:-https://sonarcloud.io}"
export SONAR_TOKEN="${SONAR_TOKEN:-}"

if [ -z "$SONAR_TOKEN" ]; then
  echo "Set SONAR_TOKEN (SonarCloud → My Account → Security → Generate Token)"
  exit 1
fi

echo "==> LCOV coverage (frontend)"
(cd frontends/main-frontend && npm ci --silent && npm run test:coverage)

echo "==> Gradle build + sonar → $SONAR_HOST_URL"
./gradlew build sonar --no-daemon

echo "Done. Open SonarCloud for results."
