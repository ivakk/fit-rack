#!/usr/bin/env bash
# Optional local SonarQube scan (your Mac). CI uses SonarCloud — see docs/SONAR.md.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SONAR_HOST_URL="${SONAR_HOST_URL:-http://host.docker.internal:9000}"
SONAR_TOKEN="${SONAR_TOKEN:-}"

if [ -z "$SONAR_TOKEN" ]; then
  echo "Set SONAR_TOKEN (from SonarQube → My Account → Security → Generate Token)"
  exit 1
fi

echo "==> JaCoCo coverage (backends)"
(cd backend-services/iam-service && ./gradlew test jacocoTestReport --no-daemon -q)
(cd backend-services/workout-service && ./gradlew test jacocoTestReport --no-daemon -q)

echo "==> LCOV coverage (frontend)"
(cd frontends/main-frontend && npm ci --silent && npm run test:coverage)

echo "==> Sonar scanner → $SONAR_HOST_URL"
docker run --rm \
  -e SONAR_HOST_URL \
  -e SONAR_TOKEN \
  -v "$ROOT:/usr/src" \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey="${SONAR_PROJECT_KEY:-fitrack}"

echo "Done. Open SonarQube UI for results."
