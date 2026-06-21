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

### 2. Bind GitHub to SonarCloud (required for commits / PR checks)

SonarCloud only links analyses to GitHub commits when the **SonarCloud GitHub App** is installed and the repo is bound.

1. **GitHub:** https://github.com/apps/sonarcloud → **Configure** → grant access to your **fitrack** repo (or all repos in org `ivakk`)
2. **SonarCloud:** Organization **Administration** → **Organization settings** → confirm GitHub is connected
3. **SonarCloud:** Project **fitrack** → **Administration** → **GitHub** → confirm repository binding shows **BOUND** (not `NONEXISTENT`)

Without this, scans may upload but **won’t appear on commits** or PRs in GitHub.

### 3. GitHub **secret**

Repo → **Settings → Secrets and variables → Actions → Secrets → New repository secret**

| Secret | Value |
|--------|--------|
| `SONAR_TOKEN` | SonarCloud token (My Account → Security → Generate Token) |

Do **not** set `SONAR_HOST_URL` to `localhost` — CI always uses `https://sonarcloud.io`.

Project key and organization are in root [`build.gradle`](../build.gradle):

```gradle
property 'sonar.projectKey', 'fitrack'
property 'sonar.organization', 'ivakk'
```

The workflow also passes **`GITHUB_TOKEN`** (built-in) so SonarCloud can decorate commits and PRs.

### 4. Disable Automatic Analysis (required for CI + coverage)

SonarCloud enables **Automatic Analysis** by default when you import a repo. Automatic Analysis **does not support code coverage** — the dashboard will keep showing:

> *A few extra steps are needed for SonarQube Cloud to analyze your code coverage.*

1. Open https://sonarcloud.io → your org → project **fitrack**
2. **Administration** → **Analysis Method**
3. Turn **off** “SonarCloud Automatic Analysis”
4. Keep only **CI-based analysis** (your GitHub Actions workflow)

If you don’t see **Administration**, restore project admin: Organization **Administration** → **Projects Management** → ⋮ → **Restore Access**.

### 5. Push to `main`, `master`, or `develop`

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
| **Commits not showing in SonarCloud / GitHub** | 1) Install [SonarCloud GitHub App](https://github.com/apps/sonarcloud) on the repo. 2) Bind repo in SonarCloud project settings. 3) Disable Automatic Analysis. 4) Ensure **SonarQube** workflow is **green** (if `./gradlew build` fails, `sonar` never runs). |
| Workflow skipped | Set variable `SONAR_ENABLED=false` only if you want to disable it |
| Workflow fails before sonar | Fix failing tests first — Sonar runs only after `build` succeeds |
| Scan log: `Detected project binding: NONEXISTENT` | Re-import/bind repo in SonarCloud or reinstall GitHub App |
| Scan fails: authentication | Regenerate `SONAR_TOKEN` on SonarCloud |
| **“A few extra steps are needed…”** | **Disable Automatic Analysis** (see step 4 above) |
| Coverage still empty | Ensure frontend `test:coverage` runs before `./gradlew build sonar` |
| Still want local scan | `make sonar-local` |

---

## Self-hosted SonarQube in CI (advanced)

Only if SonarQube is on a **public URL** (VPS) or you install a **[self-hosted GitHub Actions runner](https://docs.github.com/en/actions/hosting-your-own-runners)** on your Mac. Not supported with default GitHub runners + localhost.
