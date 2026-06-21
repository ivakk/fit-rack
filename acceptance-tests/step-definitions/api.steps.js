import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "node:assert/strict";

Before(function () {
  this.email = `cucumber-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@fitrack.test`;
});

async function request(world, method, path, { token, headers = {}, body } = {}) {
  const url = `${world.gateway}${path}`;
  const init = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (token) {
    init.headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  world.lastStatus = res.status;
  const text = await res.text();
  world.lastBody = text ? tryJson(text) : null;
  return res;
}

function tryJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function assertOk(world, context) {
  assert.ok(
    world.lastStatus >= 200 && world.lastStatus < 300,
    `${context}: expected 2xx, got ${world.lastStatus} ${JSON.stringify(world.lastBody)}`
  );
}

Given("the FiTrack stack is running behind Traefik", async function () {
  const res = await fetch(`${this.gateway}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "probe@fitrack.test", password: "x" }),
  });
  assert.ok(
    res.status === 401 || res.status === 400 || res.status === 429,
    `Gateway unreachable at ${this.gateway} (got ${res.status})`
  );
});

When('I POST valid registration data to {string}', async function (path) {
  await request(this, "POST", path, {
    body: {
      email: this.email,
      password: this.password,
      fullName: "Cucumber User",
      phoneNumber: "+1",
      gender: "other",
    },
  });
});

Then("I receive an access token", function () {
  assertOk(this, "register");
  assert.ok(this.lastBody?.accessToken, "missing accessToken");
  this.accessToken = this.lastBody.accessToken;
});

Then("I can call GET {string} with Bearer authorization", async function (path) {
  await request(this, "GET", path, { token: this.accessToken });
  assertOk(this, "auth/me");
  assert.equal(this.lastBody?.email, this.email);
});

Given("I am authenticated with a valid Bearer token", async function () {
  await request(this, "POST", "/auth/register", {
    body: {
      email: this.email,
      password: this.password,
      fullName: "Cucumber User",
      phoneNumber: "+1",
      gender: "other",
    },
  });
  assertOk(this, "register for auth");
  this.accessToken = this.lastBody.accessToken;
});

When('I POST a workout with exercises to {string}', async function (path) {
  await request(this, "POST", path, {
    token: this.accessToken,
    body: {
      title: "Cucumber workout",
      exercises: [{ name: "Squat", sets: 3, reps: 10, weightKg: 60 }],
    },
  });
  assertOk(this, "create workout");
  this.workoutId = this.lastBody?.id;
  assert.ok(this.workoutId, "workout id missing");
});

Then("the workout appears in GET {string}", async function (path) {
  await request(this, "GET", path, { token: this.accessToken });
  assertOk(this, "list workouts");
  const items = Array.isArray(this.lastBody) ? this.lastBody : this.lastBody?.content;
  const list = items ?? [];
  assert.ok(
    list.some((w) => w.id === this.workoutId),
    `workout ${this.workoutId} not in list`
  );
});

Then("GET {string} returns the same workout", async function (pathTemplate) {
  const path = pathTemplate.replace("{id}", this.workoutId);
  await request(this, "GET", path, { token: this.accessToken });
  assertOk(this, "get workout by id");
  assert.equal(this.lastBody?.id, this.workoutId);
});

When(
  'I POST {string} with header {string} set by the client',
  async function (path, headerName) {
    await request(this, "POST", path, {
      token: this.accessToken,
      headers: { [headerName]: "attacker-id" },
      body: { title: "Bad", exercises: [] },
    });
  }
);

Then("the response status is {int}", function (expected) {
  assert.equal(this.lastStatus, expected);
});

Given("I have created a workout", async function () {
  await request(this, "POST", "/auth/register", {
    body: {
      email: this.email,
      password: this.password,
      fullName: "Cucumber User",
      phoneNumber: "+1",
      gender: "other",
    },
  });
  this.accessToken = this.lastBody.accessToken;
  await request(this, "POST", "/workouts", {
    token: this.accessToken,
    body: {
      title: "To delete",
      exercises: [],
    },
  });
  this.workoutId = this.lastBody.id;
});

When('I DELETE {string}', async function (pathTemplate) {
  const path = pathTemplate.includes("{id}")
    ? pathTemplate.replace("{id}", this.workoutId)
    : pathTemplate;
  await request(this, "DELETE", path, { token: this.accessToken });
  if (pathTemplate.includes("/workouts/")) {
    assertOk(this, "delete workout");
  } else {
    assert.ok(
      this.lastStatus >= 200 && this.lastStatus < 300,
      `delete ${pathTemplate}: ${this.lastStatus}`
    );
  }
});

Then("subsequent GET {string} does not include that workout", async function (path) {
  await request(this, "GET", path, { token: this.accessToken });
  assertOk(this, "list after delete");
  const items = Array.isArray(this.lastBody) ? this.lastBody : this.lastBody?.content ?? [];
  assert.ok(!items.some((w) => w.id === this.workoutId));
});

Given("I am authenticated and have at least one workout", async function () {
  await request(this, "POST", "/auth/register", {
    body: {
      email: this.email,
      password: this.password,
      fullName: "Cucumber User",
      phoneNumber: "+1",
      gender: "other",
    },
  });
  this.accessToken = this.lastBody.accessToken;
  await request(this, "POST", "/workouts", {
    token: this.accessToken,
    body: { title: "Before account delete", exercises: [] },
  });
  assertOk(this, "workout before account delete");
});

Then("login with the same credentials fails", async function () {
  await request(this, "POST", "/auth/login", {
    body: { email: this.email, password: this.password },
  });
  assert.equal(this.lastStatus, 401);
});

Then("listing workouts with the old token is rejected", async function () {
  await new Promise((r) => setTimeout(r, 2000));
  await request(this, "GET", "/workouts", { token: this.accessToken });
  assert.equal(this.lastStatus, 401);
});
