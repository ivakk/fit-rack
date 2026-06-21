# FiTrack security (OWASP Top 10:2021)

This document maps controls in the repo to the [OWASP Top 10](https://owasp.org/Top10/). Production deployments must rotate all secrets in `.env` and enable TLS termination in front of Traefik.

| Risk | Mitigation in FiTrack |
|------|-------------------------|
| **A01 Broken access control** | Workouts scoped by `userId`; Traefik ForwardAuth + `X-Gateway-Trusted`; client `X-User-Id` rejected; `/auth/forward-auth` restricted to private networks in Docker |
| **A02 Cryptographic failures** | BCrypt (strength 12) + optional pepper; HS256 JWT with issuer validation; workout AES-256-GCM at rest; secrets via env (never committed) |
| **A03 Injection** | Spring Data MongoDB (parameterized); Bean Validation on DTOs with size limits |
| **A04 Insecure design** | Refresh token rotation; account delete purges IAM + async workout purge; gateway-only workout access in Docker |
| **A05 Security misconfiguration** | Traefik security headers; auth rate limiting; actuator limited to `health` in Docker; generic API error bodies |
| **A06 Vulnerable components** | Pin versions in Gradle/npm; run `make test` and dependency scans before release; **Trivy** scans IAM/Workout Docker images in CI |
| **A07 Auth failures** | Password policy (length + letter + digit); uniform “Invalid credentials”; JWT expiry; optional refresh flow in frontend |
| **A08 Integrity failures** | Immutable infra config in git; rebuild images after changes; sign containers in CI for production |
| **A09 Logging failures** | `SECURITY` audit log line on auth failures (no passwords/tokens); Prometheus/Grafana for metrics (change default Grafana password in `.env`) |
| **A10 SSRF** | No user-controlled outbound URLs; ForwardAuth targets fixed IAM service only |

## Client rules

- Call **Traefik** (`GATEWAY_URL`) only — not IAM `:8080` or workout ports from the browser.
- Send **`Authorization: Bearer`** only; never `X-User-Id` or `X-Internal-*`.
- Store tokens in `localStorage` is convenient for dev; prefer httpOnly cookies behind a BFF for production.

## Hardening checklist (production)

- [ ] TLS (HTTPS) on Traefik entrypoint
- [ ] Strong unique `IAM_JWT_SECRET`, `GATEWAY_TRUSTED_SECRET`, `WORKOUT_ENCRYPTION_KEY` (32+ chars)
- [ ] Remove host port mappings for MongoDB, RabbitMQ management, IAM debug port
- [ ] Disable Traefik `api.insecure` or protect dashboard
- [ ] Central log aggregation and alerts on `SECURITY` events

## Container image scan (Trivy)

**Goal:** Detect known CVEs in **IAM** and **Workout** Docker images before release (supply-chain / A06).

| Item | Detail |
|------|--------|
| Tool | [Trivy](https://github.com/aquasecurity/trivy) |
| CI | [`.github/workflows/security-scan.yml`](../.github/workflows/security-scan.yml) job `container-image-scan` |
| Policy | Fail on **CRITICAL/HIGH** with a fix available (`ignore-unfixed: true`) |
| Local | `make security-scan-images` |
| Reports | `security-reports/trivy-{iam,workout}.{json,sarif,html}` and `trivy-summary.md` |
| Open HTML | `open security-reports/trivy-iam.html` (traditional Trivy report in browser) |
| CI | GitHub Actions artifact **trivy-reports** (same files) |

Base-image CVEs without upstream fixes are reported but do not fail the pipeline.

## DAST (OWASP ZAP baseline)

**Goal:** Dynamic scan of the **running API** through Traefik — probes for common web issues (headers, cookie flags, injection probes, etc.) without a full penetration test.

| Item | Detail |
|------|--------|
| Tool | [OWASP ZAP](https://www.zaproxy.org/) `zap-baseline.py` |
| Seed URL | `http://traefik:80/health` (200 via IAM actuator — avoids spider 404 on `/`) |
| Also spidered | `/auth/login`, `/auth/register`, `/auth/refresh` (`spider.additionalUrls`) |
| Rule overrides | [`security/zap/baseline-rules.conf`](../security/zap/baseline-rules.conf) |
| CI | [`.github/workflows/security-scan.yml`](../.github/workflows/security-scan.yml) job `dast-zap` |
| Local | `make up` then `make security-scan-dast` |
| Failure policy | Job fails only on **ZAP tool errors**; alerts are uploaded as artifacts (`-I` flag). Review `zap-baseline.html` manually. |
| Scope | API gateway surface (`/auth`, `/workouts`); not a substitute for auth logic tests or load testing |

DAST complements **unit/integration security tests** and **`npm audit`** — it does not replace ForwardAuth or access-control tests in Gradle/Cucumber.
