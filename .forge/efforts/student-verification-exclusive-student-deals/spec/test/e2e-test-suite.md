# E2E Test Suite — Student Verification - Exclusive Student Deals

*Effort:* `student-verification-exclusive-student-deals`
*Authored:* 2026-06-02

## Why Test This

Student verification is the access gate for the entire student deals tier. A broken verification flow means students cannot access their benefits; a broken access-control check means non-students can. The critical paths are: OTP delivery and confirmation succeed end-to-end, verified students can see the deals page, non-verified or expired members cannot, and the 12-month expiry and re-verification cycle work correctly. These scenarios verify the system from the outside — real DB, real OTP flow, real access guards — with no mocking.

## Test Coverage Map

| Scenario | Verifies |
|----------|----------|
| SC-1: Complete student verification journey | BR-1: Member submits .edu, confirms OTP, gains access |
| SC-2: Anonymous visitor CTA continues into verification after auth | BR-6: Post-auth redirect to verification flow |
| SC-3: Verified student accesses Student Exclusive deals page | BR-2: Dedicated page accessible to verified members |
| SC-4: Non-verified member blocked from Student Exclusive deals page | BR-2, BR-8: Non-verified access denied immediately |
| SC-5: Duplicate .edu address blocked on second account | BR-4: One .edu per Rakuten account |
| SC-6: Student status expires — access revoked immediately | BR-3, BR-8: Expiry revokes access with no grace period |
| SC-7: Expired student re-verifies and regains access | BR-3: Re-verification restores access |
| SC-8: OTP invalidated after 3 incorrect attempts | TR-1: Max 3 attempts before code is invalidated |

## Scenarios

### SC-1: Complete student verification journey

**Type:** e2e
**Given** a logged-in member with no existing student verification
**When** the member submits a valid .edu email address
**And** receives the OTP email and enters the correct 6-digit code
**Then** the member's verification status is set to `verified`
**And** the member can navigate to and view the Student Exclusive deals page
**And** the homepage banner displays the verified confirmation badge
**Verifies:** BR-1 — "Member confirms the code to complete verification; verified members gain access to the Student Exclusive deals page"

---

### SC-2: Anonymous visitor CTA continues into verification after auth

**Type:** e2e
**Given** an anonymous visitor on the homepage
**When** the visitor clicks the "Verify your student status" CTA
**And** completes sign-up with a new account
**Then** the visitor is redirected to the verification flow at `/verify-student`
**And** the email entry form is displayed (not the homepage)
**Verifies:** BR-6 — "After completing sign-up or login, the member is returned directly to the verification flow"

---

### SC-3: Verified student accesses Student Exclusive deals page

**Type:** e2e
**Given** a member with `status = verified` and `expires_at` in the future
**When** the member navigates to `/student-deals`
**Then** the page loads and displays the curated merchant card grid
**And** each card shows a merchant name, logo, and cashback rate
**Verifies:** BR-2 — "Verified members gain access to the Student Exclusive deals page"

---

### SC-4: Non-verified member blocked from Student Exclusive deals page

**Type:** e2e
**Given** a logged-in member with no student verification record
**When** the member navigates to `/student-deals`
**Then** the member is redirected away from the deals page
**And** the verification flow or an access-denied message is displayed
**Verifies:** BR-2 — "Non-verified users cannot access or see the Student Exclusive deals page"

---

### SC-5: Duplicate .edu address blocked on second account

**Type:** e2e
**Given** member-A has successfully verified with `student@university.edu`
**And** member-B is a different logged-in account
**When** member-B submits `student@university.edu` in the verification flow
**Then** the verification is rejected with a clear error message
**And** member-B's verification status remains unverified
**Verifies:** BR-4 — "If a .edu address is already associated with an existing verified account, a second account cannot use it"

---

### SC-6: Student status expires — access revoked immediately

**Type:** e2e
**Given** a member with `status = verified` and `expires_at` set to the current time
**When** the expiry time is reached
**Then** the member can no longer access the Student Exclusive deals page
**And** the homepage banner displays the unverified CTA (not the verified badge)
**Verifies:** BR-3, BR-8 — "Student access is automatically revoked 12 months after verification; no grace period"

---

### SC-7: Expired student re-verifies and regains access

**Type:** e2e
**Given** a member with `status = expired`
**When** the member completes the .edu OTP verification flow with the same or a new .edu address
**Then** the member's status is set to `verified` with a new `expires_at` 12 months from now
**And** the member can access the Student Exclusive deals page
**Verifies:** BR-3 — "Re-verification follows the same .edu email + OTP flow as initial verification"

---

### SC-8: OTP invalidated after 3 incorrect attempts

**Type:** e2e
**Given** a member in `pending` status with an active OTP
**When** the member submits an incorrect code 3 times
**Then** the verification record registers 3 failed attempts
**And** subsequent attempts with any code are rejected (OTP invalidated)
**And** the member must request a new OTP via the resend flow to continue
**Verifies:** TR-1 — "A maximum of 3 incorrect attempts are allowed before the code is invalidated"

---

## Load Test Scenarios (v2)

*Load test design is deferred. When ready, run `forge:spec-tests --load-tests` to extend this suite with load scenarios.*
