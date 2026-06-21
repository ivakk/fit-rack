#!/usr/bin/env bash
# Local security scans: Trivy (container images) + OWASP ZAP baseline (DAST).
# DAST requires the stack: make up && ./scripts/wait-for-stack.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-all}"
REPORTS_DIR="$ROOT/security-reports"
mkdir -p "$REPORTS_DIR"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  source .env
  set +a
fi

scan_images() {
  if [ "${TRIVY_SKIP_BUILD:-0}" != 1 ]; then
    echo "==> Building IAM and Workout images"
    docker compose build iam workout
  fi

  compose_project() {
    grep -E '^name:' "$ROOT/docker-compose.yml" | head -1 | awk '{print $2}'
  }

  service_image() {
    local svc=$1
    local project
    project=$(compose_project)
    project="${project:-fitrack}"
    echo "${project}-${svc}:latest"
  }

  IAM_IMAGE=$(service_image iam)
  WORKOUT_IMAGE=$(service_image workout)

  for img in "$IAM_IMAGE" "$WORKOUT_IMAGE"; do
    if ! docker image inspect "$img" >/dev/null 2>&1; then
      echo "Image not found after build: $img"
      echo "Available fitrack images:"
      docker images 'fitrack-*' --format '  {{.Repository}}:{{.Tag}}'
      exit 1
    fi
  done

  echo "==> Trivy container image scan"
  TRIVY_EXIT="${TRIVY_FAIL_ON_FINDINGS:-1}"
  if ! command -v trivy >/dev/null 2>&1; then
    echo "trivy not installed — using Docker"
    TRIVY=(docker run --rm \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v "$REPORTS_DIR:/reports:rw" \
      aquasec/trivy:latest)
    trivy_out() { echo "/reports/$1"; }
  else
    TRIVY=(trivy)
    trivy_out() { echo "$REPORTS_DIR/$1"; }
  fi

  trivy_scan_image() {
    local image=$1
    local slug=$2
    local json_out shell_json
    json_out=$(trivy_out "trivy-${slug}.json")
    shell_json="$REPORTS_DIR/trivy-${slug}.json"

    echo "--- Scanning $image (reports + table)"

    echo "    → JSON report..."
    "${TRIVY[@]}" image \
      --severity CRITICAL,HIGH \
      --ignore-unfixed \
      --format json \
      --exit-code 0 \
      -o "$json_out" \
      "$image"

    echo "    → SARIF report..."
    "${TRIVY[@]}" image \
      --severity CRITICAL,HIGH \
      --ignore-unfixed \
      --format sarif \
      --exit-code 0 \
      -o "$(trivy_out "trivy-${slug}.sarif")" \
      "$image"

    echo "    → HTML report (open in browser)..."
    "${TRIVY[@]}" image \
      --severity CRITICAL,HIGH \
      --ignore-unfixed \
      --format template \
      --template "@contrib/html.tpl" \
      --exit-code 0 \
      -o "$(trivy_out "trivy-${slug}.html")" \
      "$image"

    echo "    → Console summary (pass/fail gate)..."
    if ! "${TRIVY[@]}" image \
      --severity CRITICAL,HIGH \
      --ignore-unfixed \
      --format table \
      --exit-code "$TRIVY_EXIT" \
      "$image"; then
      return 1
    fi

    if [ -f "$shell_json" ] && command -v jq >/dev/null 2>&1; then
      local crit high
      crit=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' "$shell_json")
      high=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH")] | length' "$shell_json")
      echo "    Report summary: CRITICAL=$crit HIGH=$high → trivy-${slug}.{json,sarif,html}"
    else
      echo "    Reports → trivy-${slug}.{json,sarif,html}"
    fi
    return 0
  }

  write_trivy_summary() {
    local summary="$REPORTS_DIR/trivy-summary.md"
    local ts
    ts=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    {
      echo "# FiTrack Trivy container scan summary"
      echo ""
      echo "| | |"
      echo "|---|---|"
      echo "| **Generated** | $ts |"
      echo "| **Policy** | CRITICAL/HIGH, ignore-unfixed |"
      echo "| **Images** | \`fitrack-iam:latest\`, \`fitrack-workout:latest\` |"
      echo ""
      echo "## Reports"
      echo ""
      echo "| Image | JSON | SARIF | HTML |"
      echo "|-------|------|-------|------|"
      echo "| IAM | [trivy-iam.json](./trivy-iam.json) | [trivy-iam.sarif](./trivy-iam.sarif) | [trivy-iam.html](./trivy-iam.html) |"
      echo "| Workout | [trivy-workout.json](./trivy-workout.json) | [trivy-workout.sarif](./trivy-workout.sarif) | [trivy-workout.html](./trivy-workout.html) |"
      echo ""
      if command -v jq >/dev/null 2>&1; then
        echo "## Findings (CRITICAL / HIGH)"
        echo ""
        for slug in iam workout; do
          local f="$REPORTS_DIR/trivy-${slug}.json"
          if [ ! -f "$f" ]; then
            continue
          fi
          echo "### fitrack-${slug}:latest"
          echo ""
          local count
          count=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL" or .Severity == "HIGH")] | length' "$f")
          if [ "$count" -eq 0 ]; then
            echo "No CRITICAL or HIGH findings."
          else
            echo "| Severity | CVE | Package | Installed | Fixed |"
            echo "|----------|-----|---------|-----------|-------|"
            jq -r '.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL" or .Severity == "HIGH") | "| \(.Severity) | \(.VulnerabilityID) | \(.PkgName) | \(.InstalledVersion // "-") | \(.FixedVersion // "-") |"' "$f"
          fi
          echo ""
        done
      else
        echo "_Install \`jq\` for a findings table in this summary, or open the HTML reports._"
        echo ""
      fi
      echo "## Open in browser"
      echo ""
      echo "- \`open security-reports/trivy-iam.html\`"
      echo "- \`open security-reports/trivy-workout.html\`"
    } >"$summary"
    echo "Trivy summary: $summary"
  }

  scan_failed=0
  trivy_scan_image "$IAM_IMAGE" iam || scan_failed=1
  trivy_scan_image "$WORKOUT_IMAGE" workout || scan_failed=1
  write_trivy_summary

  echo ""
  echo "Trivy reports: $REPORTS_DIR/trivy-{iam,workout}.{json,sarif,html}"
  echo "              $REPORTS_DIR/trivy-summary.md"
  echo ""
  echo "Open traditional HTML reports:"
  echo "  open $REPORTS_DIR/trivy-iam.html"
  echo "  open $REPORTS_DIR/trivy-workout.html"

  if [ "$scan_failed" -eq 1 ]; then
    echo ""
    echo "Trivy reported CRITICAL/HIGH vulnerabilities (often in base OS/JRE layers)."
    echo "Review HTML/JSON reports above. For report-only (no exit 1): TRIVY_FAIL_ON_FINDINGS=0 make security-scan-images"
    exit 1
  fi

  echo "Trivy scan passed (no fixable CRITICAL/HIGH in IAM or Workout images)."
}

scan_dast() {
  echo "==> OWASP ZAP baseline (DAST via Traefik)"
  if ! docker compose ps --status running 2>/dev/null | grep -qE 'traefik|fitrack-traefik'; then
    echo "Stack is not running. Start with: make up && ./scripts/wait-for-stack.sh"
    exit 1
  fi

  local gateway="${ZAP_GATEWAY:-http://traefik:80}"
  local seed="${ZAP_SEED_URL:-${gateway}/health}"
  local auth_urls="${gateway}/auth/login|${gateway}/auth/register|${gateway}/auth/refresh"
  local zap_config="$ROOT/security/zap/baseline-rules.conf"

  echo "  Seed URL (expect 200):  $seed"
  echo "  Also spider:            ${gateway}/auth/login, /auth/register, /auth/refresh"

  set +e
  docker run --rm --network fitrack-net \
    -v "$REPORTS_DIR:/zap/wrk/:rw" \
    -v "$zap_config:/zap/config/baseline-rules.conf:ro" \
    -t ghcr.io/zaproxy/zaproxy:stable \
    zap-baseline.py -t "$seed" \
      -c /zap/config/baseline-rules.conf \
      -z "-config spider.additionalUrls=${auth_urls}" \
      -r zap-baseline.html \
      -J zap-baseline.json \
      -w zap-baseline.md \
      -I
  code=$?
  set -e

  echo "ZAP reports: $REPORTS_DIR/zap-baseline.{html,json,md}"
  if [ "$code" -eq 1 ]; then
    echo "ZAP scan failed (tool error)."
    exit 1
  fi
  if [ "$code" -eq 2 ]; then
    echo "ZAP found alerts — review reports (exit 2 is expected for baseline on live APIs)."
  fi
}

case "$MODE" in
  images) scan_images ;;
  dast) scan_dast ;;
  all)
    scan_images
    scan_dast
    ;;
  *)
    echo "Usage: $0 [images|dast|all]"
    exit 1
    ;;
esac
