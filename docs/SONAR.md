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

### 2. GitHub **secrets**

Repo → **Settings → Secrets and variables → Actions → Secrets → New repository secret**

| Secret | Value |
|--------|--------|
| `SONAR_TOKEN` | SonarCloud token (My Account → Security → Generate Token) |
| `SONAR_HOST_URL` | `https://sonarcloud.io` |

### 3. GitHub **variable**

Same page → **Variables** tab → **New repository variable**

| Variable | Value |
|----------|--------|
| `SONAR_ORGANIZATION` | Your SonarCloud **organization key** (shown when you import the project, often your GitHub username) |

Optional:

| Variable | Value |
|----------|--------|
| `SONAR_PROJECT_KEY` | `fitrack` (default if unset) |
| `SONAR_ENABLED` | `false` only if you want to disable the workflow |

### 4. Push to `main`

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

[`.github/workflows/sonar.yml`](../.github/workflows/sonar.yml):

1. Gradle tests + JaCoCo (IAM + Workout)
2. `npm ci` (frontend TypeScript analysis)
3. SonarCloud scan
4. Quality gate (informational; `continue-on-error: true`)

Coverage: `backend-services/*/build/reports/jacoco/test/jacocoTestReport.xml`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Workflow invalid / skipped | Set `SONAR_ORGANIZATION` variable |
| Scan fails: authentication | Regenerate `SONAR_TOKEN` on SonarCloud |
| “Cannot reach localhost” | Use `https://sonarcloud.io` in CI, not localhost |
| Want to disable CI Sonar | Set variable `SONAR_ENABLED=false` |
| Still want local SonarQube | `make sonar-local` — separate from CI |

---

## Self-hosted SonarQube in CI (advanced)

Only if SonarQube is on a **public URL** (VPS) or you install a **[self-hosted GitHub Actions runner](https://docs.github.com/en/actions/hosting-your-own-runners)** on your Mac. Not supported with default GitHub runners + localhost.
