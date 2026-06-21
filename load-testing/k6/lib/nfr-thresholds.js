/**
 * k6 pass/fail thresholds aligned with FiTrack NFR catalogue v5.0 (June 2026).
 *
 * NFR-01 — p95 < 5,000 ms and failure rate < 10% on all five workout-management endpoints
 *          at 10 simultaneous users for 1 minute sustained load.
 * NFR-03 — 0% application errors (HTTP 5xx) while ramping 0 → 50 VUs over 8 minutes.
 * NFR-05 — 0% HTTP 5xx at 10 simultaneous users over 1 minute.
 */

export const NFR01_P95_MS = 5000;
export const NFR01_MAX_FAIL_RATE = 0.1;

/** Endpoints covered by NFR-01 (view profile + workout CRUD). */
export const NFR01_ENDPOINTS = [
  "auth_me",
  "workouts_list",
  "workouts_create",
  "workouts_get",
  "workouts_update",
];

export function nfr01LoadThresholds() {
  const thresholds = {
    http_req_failed: [`rate<${NFR01_MAX_FAIL_RATE}`],
    http_req_duration: [`p(95)<${NFR01_P95_MS}`],
    fitrack_http_5xx: ["rate==0"],
    fitrack_application_errors: ["rate==0"],
  };

  for (const name of NFR01_ENDPOINTS) {
    thresholds[`http_req_duration{name:${name}}`] = [`p(95)<${NFR01_P95_MS}`];
    thresholds[`http_req_failed{name:${name}}`] = [`rate<${NFR01_MAX_FAIL_RATE}`];
  }

  return thresholds;
}

export function nfr03StressThresholds() {
  return {
    fitrack_http_5xx: ["rate==0"],
    fitrack_application_errors: ["rate==0"],
  };
}
