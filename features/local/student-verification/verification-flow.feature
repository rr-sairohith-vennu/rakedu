Feature: Verification Flow — .edu email OTP verification pages

  Background:
    Given the app is running at http://localhost:3000

  @SC-9 @logged-in-unverified @local
  Scenario: Email entry page renders idle state
    Given a logged-in non-verified member navigates to /verify-student
    When the page loads
    Then a text input for the .edu email is visible and focusable
    And a "Send verification code" submit button is visible
    And the submit button is disabled when the input is empty
    # Verifies: BR-1 — "Member can enter a .edu email address on the verification flow"

  @SC-10 @logged-in-unverified @local
  Scenario: Email entry shows inline error for non-.edu format
    Given a logged-in member is on the /verify-student page
    When the member enters "user@gmail.com" and submits the form
    Then an inline error message "Please enter a valid .edu email address" is visible
    And the error message has role="alert"
    And the form does not navigate away from the page
    # Verifies: BR-1 — "Member can enter a .edu email address on the verification flow"

  @SC-11 @logged-in-unverified @local
  Scenario: OTP confirm page resend link rate-limited for 60 seconds
    Given a member is on the /verify-student/confirm page
    When the member clicks "Resend code"
    Then the resend link updates to show "Resend code in 60s"
    And the resend link is disabled for 60 seconds
    And after 60 seconds the link re-enables and shows "Resend code"
    # Verifies: TR-1 — "Resend requests must be rate-limited to no more than once every 60 seconds"

  @SC-12 @logged-in-unverified @local
  Scenario: Correct OTP code navigates to success page
    Given a member is on /verify-student/confirm with a valid pending OTP
    When the member enters the correct 6-digit code and submits
    Then the member is navigated to /verify-student/success
    And the success page displays a confirmation message
    And a "Explore student deals" link pointing to /student-deals is visible
    # Verifies: BR-1 — "Member confirms the code to complete verification"
