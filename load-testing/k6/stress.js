/**
 * NFR-03 stress test — ramp beyond expected peak load via Traefik.
 *
 * NFR-03: Application error rate 0% (HTTP 5xx) while ramping from 0 to 50
 *         simultaneous users over 8 minutes (5× expected peak load).
 *
 * Env:
 *   K6_PEAK_VUS      — max VUs at end of ramp (default 50)
 *   K6_RAMP_DURATION — ramp duration (default 8m)
 *   K6_SETUP_USERS   — tokens for setup (default 15)
 *   K6_SETUP_DELAY   — seconds between registrations (default 5)
 */
import { registerUsers, runAuthenticatedWorkoutFlow } from "./lib/workflow.js";
import { nfr03StressThresholds } from "./lib/nfr-thresholds.js";

const gateway = __ENV.K6_GATEWAY_URL || "http://localhost";
const password = "Secret123";
const peak = Number(__ENV.K6_PEAK_VUS || 50);
const rampDuration = __ENV.K6_RAMP_DURATION || "8m";

export const options = {
  setupTimeout: "3m",
  scenarios: {
    nfr03_stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: rampDuration, target: peak },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: nfr03StressThresholds(),
};

export function setup() {
  const count = Number(__ENV.K6_SETUP_USERS || Math.min(peak, 15));
  const delaySec = Number(__ENV.K6_SETUP_DELAY || 5);
  const runId = __ENV.K6_RUN_ID || `${Date.now()}`;

  const users = registerUsers(gateway, password, count, delaySec, `stress-${runId}`);

  if (users.length === 0) {
    throw new Error(
      "Stress setup failed: no users registered. Is the stack up? Check Traefik rate limits."
    );
  }

  return { users };
}

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  runAuthenticatedWorkoutFlow(gateway, user.accessToken, __VU, __ITER);
}
