#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> IAM service (unit + integration)"
(cd "$ROOT/backend-services/iam-service" && ./gradlew test --no-daemon)

echo "==> Workout service (unit + integration)"
(cd "$ROOT/backend-services/workout-service" && ./gradlew test --no-daemon)

echo "==> Main frontend (unit)"
(cd "$ROOT/frontends/main-frontend" && npm test -- --run)

echo "All tests passed."
