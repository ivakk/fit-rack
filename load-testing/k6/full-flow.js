/**
 * End-to-end load test via Traefik (same path as the browser).
 *
 * Env:
 *   K6_GATEWAY_URL   — default http://traefik:80 in Docker, http://localhost on host
 *   K6_VUS           — peak virtual users (default 10)
 *   K6_DURATION      — sustain duration at peak, e.g. 2m (default 1m)
 *   K6_SETUP_USERS   — users to register in setup (default 10)
 *   K6_SETUP_DELAY   — seconds between registrations (default 7, respects Traefik auth rate limit)
 */
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

const gateway = __ENV.K6_GATEWAY_URL || "http://localhost";
const password = "Secret123";

const registerErrors = new Rate("fitrack_register_errors");
const workoutErrors = new Rate("fitrack_workout_errors");
const authErrors = new Rate("fitrack_auth_errors");
const registrations = new Counter("fitrack_registrations");

export const options = {
  scenarios: {
    full_stack: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: Number(__ENV.K6_VUS || 10) },
        { duration: __ENV.K6_DURATION || "1m", target: Number(__ENV.K6_VUS || 10) },
        { duration: "15s", target: 0 },
      ],
      gracefulRampDown: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<5000"],
    fitrack_workout_errors: ["rate<0.10"],
    fitrack_auth_errors: ["rate<0.10"],
  },
};

export function setup() {
  const users = [];
  const count = Number(__ENV.K6_SETUP_USERS || 10);
  const delaySec = Number(__ENV.K6_SETUP_DELAY || 7);
  const runId = __ENV.K6_RUN_ID || `${Date.now()}`;

  for (let i = 0; i < count; i++) {
    const email = `load-${runId}-${i}@fitrack.test`;
    const body = JSON.stringify({
      email,
      password,
      fullName: `Load User ${i}`,
      phoneNumber: "+1000000000",
      gender: "other",
    });

    const res = http.post(`${gateway}/auth/register`, body, {
      headers: { "Content-Type": "application/json" },
      tags: { name: "setup_register" },
    });

    const ok =
      res.status === 200 &&
      res.json("accessToken") !== undefined &&
      res.json("accessToken") !== null;

    registerErrors.add(!ok);
    if (ok) {
      users.push({
        email,
        accessToken: res.json("accessToken"),
      });
      registrations.add(1);
    }

    if (i < count - 1) {
      sleep(delaySec);
    }
  }

  if (users.length === 0) {
    throw new Error(
      "Setup failed: no users registered. Is the stack up? Check Traefik auth rate limits."
    );
  }

  return { users };
}

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  const auth = authHeaders(user.accessToken);

  group("auth_me", () => {
    const res = http.get(`${gateway}/auth/me`, {
      ...auth,
      tags: { name: "auth_me" },
    });
    const ok = check(res, { "me status 200": (r) => r.status === 200 });
    authErrors.add(!ok);
  });

  group("workouts", () => {
    const listRes = http.get(`${gateway}/workouts`, {
      ...auth,
      tags: { name: "workouts_list" },
    });
    let ok = check(listRes, { "list status 200": (r) => r.status === 200 });
    workoutErrors.add(!ok);

    const createBody = JSON.stringify({
      title: `Load workout VU${__VU} iter${__ITER}`,
      durationMinutes: 45,
      exercises: [
        { name: "Squat", sets: 4, reps: 8, weightKg: 80 },
        { name: "Bench press", sets: 3, reps: 10, weightKg: 60 },
      ],
    });

    const createRes = http.post(`${gateway}/workouts`, createBody, {
      ...auth,
      tags: { name: "workouts_create" },
    });
    ok = check(createRes, {
      "create status 201": (r) => r.status === 201,
    });
    workoutErrors.add(!ok);

    if (createRes.status === 201) {
      const id = createRes.json("id");
      const getRes = http.get(`${gateway}/workouts/${id}`, {
        ...auth,
        tags: { name: "workouts_get" },
      });
      ok = check(getRes, { "get status 200": (r) => r.status === 200 });
      workoutErrors.add(!ok);

      const updateBody = JSON.stringify({
        exercises: [{ name: "Squat", sets: 5, reps: 5, weightKg: 85 }],
      });
      const updateRes = http.put(`${gateway}/workouts/${id}`, updateBody, {
        ...auth,
        tags: { name: "workouts_update" },
      });
      ok = check(updateRes, { "update status 200": (r) => r.status === 200 });
      workoutErrors.add(!ok);
    }
  });

  sleep(0.5 + Math.random() * 0.5);
}
