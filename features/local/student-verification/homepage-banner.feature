Feature: Homepage Banner — Student verification banner for all visitor states

  Background:
    Given the app is running at http://localhost:3000

  @SC-13 @anonymous @local
  Scenario: Anonymous visitor sees promotional banner CTA
    Given an anonymous visitor (not logged in) is on the homepage
    When the page loads
    Then the student verification banner is visible
    And the banner contains a CTA with descriptive text (not "click here")
    And the CTA links to the sign-in/sign-up flow with callbackUrl=/verify-student
    # Verifies: BR-5 — "Anonymous visitors see the student deal promotion with a sign-up/verify CTA"

  @SC-14 @logged-in-verified @local
  Scenario: Verified member sees confirmation badge on banner
    Given a logged-in member with status=verified and expires_at in the future
    When the member loads the homepage
    Then the student verification banner displays the "You're verified" confirmation badge
    And no verification CTA is shown
    And a link to /student-deals is present in the banner
    # Verifies: BR-5 — "Logged-in verified members see a confirmation badge instead of the CTA"

  @SC-15 @logged-in-verified @local
  Scenario: Expiring-soon member sees re-verify warning banner
    Given a logged-in member with status=verified and days_until_expiry=3
    When the member loads the homepage
    Then the banner displays a warning that student access expires in 3 days
    And a "Re-verify student status" CTA is visible
    # Verifies: BR-3 — "An in-app banner prompts re-verification starting 7 days before expiry"
