# SonarQube / SonarCloud setup

FiTrack uses [SonarCloud](https://sonarcloud.io) (free for public repos) or a self-hosted SonarQube server for static analysis, code smells, and coverage from JaCoCo.

## One-time setup (SonarCloud)

1. Sign in at https://sonarcloud.io with GitHub.
2. **+** → **Analyze new project** → import this repository.
3. Note your **organization key** and set the project key to `fitrack` (or match `sonar-project.properties`).
4. Copy the **analysis token**.

## GitHub secrets

| Secret | Example | Required |
|--------|---------|----------|
| `SONAR_TOKEN` | SonarCloud token | Yes |
| `SONAR_ORGANIZATION` | `your-github-username` | Yes (SonarCloud) |
| `SONAR_HOST_URL` | `https://sonarcloud.io` | Yes |

Optional repository variable:

| Variable | Default |
|----------|---------|
| `SONAR_PROJECT_KEY` | `fitrack` |

## Local run (optional)

```bash
# Generate coverage first
(cd backend-services/iam-service && ./gradlew test jacocoTestReport)
(cd backend-services/workout-service && ./gradlew test jacocoTestReport)

# Docker scanner against SonarCloud
docker run --rm \
  -e SONAR_HOST_URL="https://sonarcloud.io" \
  -e SONAR_TOKEN="your-token" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.organization=your-org
```

## CI workflow

[`.github/workflows/sonar.yml`](../.github/workflows/sonar.yml) runs on push/PR when secrets are configured. Without `SONAR_TOKEN`, the scan step fails — add secrets before enabling for coursework evidence.

Coverage reports: `backend-services/*/build/reports/jacoco/test/jacocoTestReport.xml`
