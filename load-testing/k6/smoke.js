/**
 * Quick smoke load: 3 VUs for 30s — use before a full run.
 */
import http from "k6/http";
import { check, sleep } from "k6";

const gateway = __ENV.K6_GATEWAY_URL || "http://localhost";
const password = "Secret123";

export const options = {
  vus: Number(__ENV.K6_VUS || 3),
  duration: __ENV.K6_DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export function setup() {
  const email = `smoke-${Date.now()}@fitrack.test`;
  const res = http.post(
    `${gateway}/auth/register`,
    JSON.stringify({
      email,
      password,
      fullName: "Smoke",
      phoneNumber: "+1",
      gender: "other",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  if (res.status !== 200) {
    throw new Error(`register failed: ${res.status} ${res.body}`);
  }
  return { token: res.json("accessToken") };
}

export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    "Content-Type": "application/json",
  };
  check(http.get(`${gateway}/auth/me`, { headers }), {
    me: (r) => r.status === 200,
  });
  check(
    http.post(
      `${gateway}/workouts`,
      JSON.stringify({
        title: "Smoke",
        exercises: [{ name: "Run", sets: 1, reps: 1 }],
      }),
      { headers }
    ),
    { create: (r) => r.status === 201 }
  );
  check(http.get(`${gateway}/workouts`, { headers }), {
    list: (r) => r.status === 200,
  });
  sleep(1);
}
