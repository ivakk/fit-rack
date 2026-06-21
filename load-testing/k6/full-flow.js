/**
 * NFR-01 + NFR-05 load test via Traefik (same path as the browser).
 *
 * NFR-01: 10 simultaneous users, 1 minute sustained load; p95 < 5,000 ms and
 *         failure rate < 10% on all five workout-management endpoints.
 * NFR-05: HTTP 5xx rate 0% during the same run.
 *
 * Endpoints exercised per iteration:
 *   GET /auth/me, GET /workouts, POST /workouts, GET /workouts/{id}, PUT /workouts/{id}
 *
 * Env:
 *   K6_GATEWAY_URL   — default http://traefik:80 in Docker, http://localhost on host
 *   K6_VUS           — peak virtual users (default 10)
 *   K6_DURATION      — sustain duration at peak (default 1m)
 *   K6_SETUP_USERS   — users to register in setup (default 10)
 *   K6_SETUP_DELAY   — seconds between registrations (default 7, respects Traefik auth rate limit)
 */
import { registerUsers, runAuthenticatedWorkoutFlow } from "./lib/workflow.js";
import { nfr01LoadThresholds } from "./lib/nfr-thresholds.js";

const gateway = __ENV.K6_GATEWAY_URL || "http://localhost";
const password = "Secret123";
const peakVus = Number(__ENV.K6_VUS || 10);
const sustain = __ENV.K6_DURATION || "1m";

export const options = {
  setupTimeout: "2m",
  scenarios: {
    nfr01_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: peakVus },
        { duration: sustain, target: peakVus },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "10s",
    },
  },
  thresholds: nfr01LoadThresholds(),
};

export function setup() {
  const count = Number(__ENV.K6_SETUP_USERS || peakVus);
  const delaySec = Number(__ENV.K6_SETUP_DELAY || 7);
  const runId = __ENV.K6_RUN_ID || `${Date.now()}`;

  const users = registerUsers(gateway, password, count, delaySec, runId);

  if (users.length === 0) {
    throw new Error(
      "Setup failed: no users registered. Is the stack up? Check Traefik auth rate limits."
    );
  }

  return { users };
}

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  runAuthenticatedWorkoutFlow(gateway, user.accessToken, __VU, __ITER);
}
