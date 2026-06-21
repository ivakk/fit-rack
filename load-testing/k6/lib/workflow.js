/**
 * Shared k6 workflow: register users in setup, authenticated workout CRUD per VU.
 */
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

export const registerErrors = new Rate("fitrack_register_errors");
export const workoutErrors = new Rate("fitrack_workout_errors");
export const authErrors = new Rate("fitrack_auth_errors");
export const registrations = new Counter("fitrack_registrations");

/** HTTP 5xx — used for NFR-03 (stress) and NFR-05 (load). Client 4xx are not application errors. */
export const http5xxRate = new Rate("fitrack_http_5xx");
export const applicationErrorRate = new Rate("fitrack_application_errors");

export function recordApplicationOutcome(res) {
  const isServerError = res.status >= 500;
  http5xxRate.add(isServerError);
  applicationErrorRate.add(isServerError);
}

export function registerUsers(gateway, password, count, delaySec, runId) {
  const users = [];

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
    recordApplicationOutcome(res);
    if (ok) {
      users.push({ email, accessToken: res.json("accessToken") });
      registrations.add(1);
    }

    if (i < count - 1) {
      sleep(delaySec);
    }
  }

  return users;
}

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

export function runAuthenticatedWorkoutFlow(gateway, accessToken, vu, iter) {
  const auth = authHeaders(accessToken);

  group("auth_me", () => {
    const res = http.get(`${gateway}/auth/me`, {
      ...auth,
      tags: { name: "auth_me" },
    });
    const ok = check(res, { "me status 200": (r) => r.status === 200 });
    authErrors.add(!ok);
    recordApplicationOutcome(res);
  });

  group("workouts", () => {
    const listRes = http.get(`${gateway}/workouts`, {
      ...auth,
      tags: { name: "workouts_list" },
    });
    let ok = check(listRes, { "list status 200": (r) => r.status === 200 });
    workoutErrors.add(!ok);
    recordApplicationOutcome(listRes);

    const createBody = JSON.stringify({
      title: `Load workout VU${vu} iter${iter}`,
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
    ok = check(createRes, { "create status 201": (r) => r.status === 201 });
    workoutErrors.add(!ok);
    recordApplicationOutcome(createRes);

    if (createRes.status === 201) {
      const id = createRes.json("id");
      const getRes = http.get(`${gateway}/workouts/${id}`, {
        ...auth,
        tags: { name: "workouts_get" },
      });
      ok = check(getRes, { "get status 200": (r) => r.status === 200 });
      workoutErrors.add(!ok);
      recordApplicationOutcome(getRes);

      const updateBody = JSON.stringify({
        exercises: [{ name: "Squat", sets: 5, reps: 5, weightKg: 85 }],
      });
      const updateRes = http.put(`${gateway}/workouts/${id}`, updateBody, {
        ...auth,
        tags: { name: "workouts_update" },
      });
      ok = check(updateRes, { "update status 200": (r) => r.status === 200 });
      workoutErrors.add(!ok);
      recordApplicationOutcome(updateRes);
    }
  });

  sleep(0.5 + Math.random() * 0.5);
}
