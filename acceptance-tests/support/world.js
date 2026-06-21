import { setWorldConstructor } from "@cucumber/cucumber";

export class FiTrackWorld {
  constructor({ parameters }) {
    this.gateway =
      process.env.GATEWAY_URL ||
      parameters?.gatewayUrl ||
      "http://localhost";
    this.email = `cucumber-${Date.now()}@fitrack.test`;
    this.password = "Secret123";
    this.accessToken = null;
    this.workoutId = null;
    this.lastStatus = null;
    this.lastBody = null;
  }
}

setWorldConstructor(FiTrackWorld);
