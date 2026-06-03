# FitTrack acceptance scenarios (BDD / Gherkin)
# Executable today via: make test-gateway  (scripts/test-gateway.sh)
# Optional future: Cucumber + REST-assured or Playwright

Feature: User registration and authentication
  As a fitness enthusiast
  I want to register and receive a JWT
  So that I can access my workouts securely

  Scenario: Register through the API gateway
    Given the FitTrack stack is running behind Traefik
    When I POST valid registration data to "/auth/register"
    Then I receive an access token
    And I can call GET "/auth/me" with Bearer authorization

Feature: Workout management
  As a logged-in user
  I want to create and delete workouts
  So that I track my training history

  Scenario: Create and list workouts
    Given I am authenticated with a valid Bearer token
    When I POST a workout with exercises to "/workouts"
    Then the workout appears in GET "/workouts"
    And GET "/workouts/{id}" returns the same workout

  Scenario: Reject identity spoofing
    Given I am authenticated with a valid Bearer token
    When I POST "/workouts" with header "X-User-Id" set by the client
    Then the response status is 400

  Scenario: Hard-delete a workout
    Given I have created a workout
    When I DELETE "/workouts/{id}"
    Then subsequent GET "/workouts" does not include that workout

Feature: Account deletion and data purge
  As a user who leaves the platform
  I want my account and workouts permanently removed
  So that my data is not retained

  Scenario: Delete account purges workouts
    Given I am authenticated and have at least one workout
    When I DELETE "/auth/me"
    Then login with the same credentials fails
    And listing workouts with the old token is rejected
