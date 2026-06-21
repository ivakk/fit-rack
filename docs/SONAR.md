# SonarQube / SonarCloud

FiTrack runs **SonarCloud on every push** in GitHub Actions. You can optionally scan against **local SonarQube on your Mac** for development.

## CI on every push → use SonarCloud

GitHub’s runners are in the cloud. They **cannot** connect to `http://localhost:9000` on your laptop.

| | CI (every push) | Local (optional) |
|--|-----------------|------------------|
| **Where** | [SonarCloud](https://sonarcloud.io) | SonarQube on your Mac |
| **Workflow** | `.github/workflows/sonar.yml` | `make sonar-local` |
| **Host URL** | `https://sonarcloud.io` | `http://localhost:9000` |

---

## One-time SonarCloud setup (~5 min)

### 1. Create project on SonarCloud

1. Go to https://sonarcloud.io → **Log in with GitHub**
2. **+** → **Analyze new project** → select **fitrack**
3. Project key: **`fitrack`** (matches `sonar-project.properties`)

### 2. GitHub **secret**

Repo → **Settings → Secrets and variables → Actions → Secrets → New repository secret**

| Secret | Value |
|--------|--------|
| `SONAR_TOKEN` | SonarCloud token (My Account → Security → Generate Token) |

Optional:

| Secret | Value |
|--------|--------|
| `SONAR_HOST_URL` | `https://sonarcloud.io` (default in `build.gradle` if unset) |

Project key and organization are configured in root [`build.gradle`](../build.gradle):

```gradle
property 'sonar.projectKey', 'fitrack'
property 'sonar.organization', 'ivakk'
```

### 3. Disable Automatic Analysis (required for coverage)

SonarCloud enables **Automatic Analysis** by default when you import a repo. Automatic Analysis **does not support code coverage** — the dashboard will keep showing:

> *A few extra steps are needed for SonarQube Cloud to analyze your code coverage.*

1. Open https://sonarcloud.io → your org → project **fitrack**
2. **Administration** → **Analysis Method**
3. Turn **off** “SonarCloud Automatic Analysis”
4. Keep only **CI-based analysis** (your GitHub Actions workflow)

If you don’t see **Administration**, restore project admin: Organization **Administration** → **Projects Management** → ⋮ → **Restore Access**.

### 4. Push to `main` or `master`

The **SonarQube** workflow runs automatically on push/PR to `main`, `master`, or `develop`.

View results: https://sonarcloud.io → your organization → **fitrack**

---

## Local SonarQube on your Mac (optional)

Use this for experiments on your machine. **Does not replace CI** — GitHub Actions still uses SonarCloud.

```bash
# SonarQube running locally (e.g. Docker on port 9000)
export SONAR_TOKEN="token-from-local-sonarqube-ui"
make sonar-local
```

Default scanner URL: `http://host.docker.internal:9000` (Docker scanner → Mac host). Override:

```bash
SONAR_HOST_URL=http://localhost:9000 SONAR_TOKEN=... ./scripts/sonar-local.sh
```

---

## What CI runs

[`.github/workflows/sonar.yml`](../.github/workflows/sonar.yml) uses the **Gradle SonarQube plugin** (`org.sonarqube` in root `build.gradle`):

1. Vitest with LCOV (frontend)
2. `./gradlew build sonar --info` (backend tests + JaCoCo + SonarCloud upload)

Coverage reports:

| Module | Report |
|--------|--------|
| IAM | `backend-services/iam-service/build/reports/jacoco/test/jacocoTestReport.xml` |
| Workout | `backend-services/workout-service/build/reports/jacoco/test/jacocoTestReport.xml` |
| Frontend | `frontends/main-frontend/coverage/lcov.info` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Workflow skipped | Set variable `SONAR_ENABLED=false` only if you want to disable it |
| Scan fails: authentication | Regenerate `SONAR_TOKEN` on SonarCloud |
| **“A few extra steps are needed…”** | **Disable Automatic Analysis** (see step 3 above) |
| Coverage still empty | Ensure `./gradlew build sonar` runs after frontend `test:coverage`; check log for `JaCoCo XML Report Importer` |
| Still want local scan | `make sonar-local` |

---

## Self-hosted SonarQube in CI (advanced)

Only if SonarQube is on a **public URL** (VPS) or you install a **[self-hosted GitHub Actions runner](https://docs.github.com/en/actions/hosting-your-own-runners)** on your Mac. Not supported with default GitHub runners + localhost.
