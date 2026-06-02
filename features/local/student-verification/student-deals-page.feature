Feature: Student Deals Page — Student Exclusive deals listing for verified members

  Background:
    Given the app is running at http://localhost:3000

  @SC-16 @logged-in-verified @local
  Scenario: Deals page shows loading skeleton while fetching
    Given a verified member navigates to /student-deals
    When the page is loading before the API response resolves
    Then skeleton placeholder cards are visible in the grid layout
    And no error message is shown
    # Verifies: BR-2 — Loading state on the Student Exclusive deals page

  @SC-17 @logged-in-verified @local
  Scenario: Deals page shows empty state when no active deals
    Given a verified member navigates to /student-deals
    And the database contains no active student deals
    When the page finishes loading
    Then the empty state message "No student deals are available right now. Check back soon." is visible
    And no merchant cards are displayed
    # Verifies: BR-7 — "Only active deals are shown on the Student Exclusive page"

  @SC-18 @logged-in-verified @local
  Scenario: Deals page shows cashback rate correctly for each card
    Given a verified member navigates to /student-deals
    And the database contains active deals with various cashback rates
    When the page loads
    Then each merchant card displays the cashback rate as readable text (e.g. "12.50% cash back")
    And the rate is not rendered as an image or icon-only element
    # Verifies: BR-2 — "Each merchant displays an elevated cashback rate specific to the student tier"
