# UI E2E Test Suite — Student Verification - Exclusive Student Deals

*Effort:* `student-verification-exclusive-student-deals`
*Authored:* 2026-06-02

## Why Test This

The UI surfaces three distinct user-facing areas: the verification flow (3 pages), the homepage banner (6 states), and the Student Exclusive deals page (4 states). Each state must render the correct content and controls, and transitions between states must be driven by the right user actions and API responses. These scenarios verify what the user sees and can interact with — not API internals — and are implemented using Playwright against the running Next.js app.

## Test Coverage Map

| Scenario | Verifies |
|----------|----------|
| SC-9: Email entry page renders idle state | BR-1: Member can enter a .edu email and submit |
| SC-10: Email entry shows inline error for non-.edu format | BR-1: Clear error for invalid format |
| SC-11: OTP confirm page resend link rate-limited for 60s | TR-1: Resend rate-limited to once per 60 seconds |
| SC-12: Correct OTP code navigates to success page | BR-1: Confirmed code completes verification flow |
| SC-13: Anonymous visitor sees promotional banner CTA | BR-5: Anonymous visitor sees sign-up/verify CTA |
| SC-14: Verified member sees confirmation badge on banner | BR-5: Verified members see confirmation badge |
| SC-15: Expiring-soon member sees re-verify warning banner | BR-3: In-app banner for members nearing expiry |
| SC-16: Deals page shows loading skeleton while fetching | BR-2: Loading state visible during data fetch |
| SC-17: Deals page shows empty state when no active deals | BR-7: Empty state when no active deals in DB |
| SC-18: Deals page shows cashback rate correctly for each card | BR-2: Cashback rate readable as text on each merchant card |

## Scenarios

### SC-9: Email entry page renders idle state

**Type:** e2e (UI)
**Given** a logged-in non-verified member navigates to `/verify-student`
**When** the page loads
**Then** a text input for the .edu email is visible and focusable
**And** a "Send verification code" submit button is visible
**And** the submit button is disabled when the input is empty
**Verifies:** BR-1 — "Member can enter a .edu email address on the verification flow"

---

### SC-10: Email entry shows inline error for non-.edu format

**Type:** e2e (UI)
**Given** a logged-in member is on the `/verify-student` page
**When** the member enters "user@gmail.com" and submits the form
**Then** an inline error message "Please enter a valid .edu email address" is visible
**And** the error message has `role="alert"` (announced by screen readers)
**And** the form does not navigate away from the page
**Verifies:** BR-1 — "Member can enter a .edu email address on the verification flow"

---

### SC-11: OTP confirm page resend link rate-limited for 60s

**Type:** e2e (UI)
**Given** a member is on the `/verify-student/confirm` page
**When** the member clicks "Resend code"
**Then** the resend link updates to show "Resend code in 60s"
**And** the resend link is disabled for 60 seconds
**And** after 60 seconds the link re-enables and shows "Resend code"
**Verifies:** TR-1 — "Resend requests must be rate-limited to no more than once every 60 seconds"

---

### SC-12: Correct OTP code navigates to success page

**Type:** e2e (UI)
**Given** a member is on `/verify-student/confirm` with a valid pending OTP
**When** the member enters the correct 6-digit code and submits
**Then** the member is navigated to `/verify-student/success`
**And** the success page displays a confirmation message
**And** a "Explore student deals" link pointing to `/student-deals` is visible
**Verifies:** BR-1 — "Member confirms the code to complete verification"

---

### SC-13: Anonymous visitor sees promotional banner CTA

**Type:** e2e (UI)
**Given** an anonymous (not logged in) visitor is on the homepage
**When** the page loads
**Then** the student verification banner is visible
**And** the banner contains a CTA with descriptive text (not "click here")
**And** the CTA links to the sign-in/sign-up flow with `callbackUrl=/verify-student`
**Verifies:** BR-5 — "Anonymous visitors see the student deal promotion with a sign-up/verify CTA"

---

### SC-14: Verified member sees confirmation badge on banner

**Type:** e2e (UI)
**Given** a logged-in member with `status = verified` and `expires_at` in the future
**When** the member loads the homepage
**Then** the student verification banner displays the "You're verified ✓" confirmation badge
**And** no verification CTA is shown
**And** a link to `/student-deals` is present in the banner
**Verifies:** BR-5 — "Logged-in verified members see a confirmation badge instead of the CTA"

---

### SC-15: Expiring-soon member sees re-verify warning banner

**Type:** e2e (UI)
**Given** a logged-in member with `status = verified` and `days_until_expiry = 3`
**When** the member loads the homepage
**Then** the banner displays a warning that student access expires in 3 days
**And** a "Re-verify student status" CTA is visible
**Verifies:** BR-3 — "An in-app banner prompts re-verification starting 7 days before expiry"

---

### SC-16: Deals page shows loading skeleton while fetching

**Type:** e2e (UI)
**Given** a verified member navigates to `/student-deals`
**When** the page is loading (before the API response resolves)
**Then** skeleton placeholder cards are visible in the grid layout
**And** no error message is shown
**Verifies:** BR-2 — Loading state on the Student Exclusive deals page

---

### SC-17: Deals page shows empty state when no active deals

**Type:** e2e (UI)
**Given** a verified member navigates to `/student-deals`
**And** the database contains no active student deals
**When** the page finishes loading
**Then** the empty state message "No student deals are available right now. Check back soon." is visible
**And** no merchant cards are displayed
**Verifies:** BR-7 — "Only active deals are shown on the Student Exclusive page"

---

### SC-18: Deals page shows cashback rate correctly for each card

**Type:** e2e (UI)
**Given** a verified member navigates to `/student-deals`
**And** the database contains active deals with various cashback rates
**When** the page loads
**Then** each merchant card displays the cashback rate as readable text (e.g. "12.50% cash back")
**And** the rate is not rendered as an image or icon-only element
**Verifies:** BR-2 — "Each merchant displays an elevated cashback rate specific to the student tier"

---

## Load Test Scenarios (v2)

*Load test design is deferred. When ready, run `forge:spec-tests --load-tests` to extend this suite with load scenarios.*
