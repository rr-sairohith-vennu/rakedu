# Integration Test Suite — Student Verification - Exclusive Student Deals

*Effort:* `student-verification-exclusive-student-deals`
*Authored:* 2026-06-02

## Why Test This

The repository layer is the boundary between application logic and PostgreSQL. Integration tests run against a real containerised PostgreSQL instance (Prisma migrations applied) to catch constraint violations, serialization errors, and query correctness that unit tests cannot detect. Critical scenarios include: the uniqueness constraints on `member_id` and `edu_email`, the OTP attempt counter increment, the expiry query used by the 7-day reminder job, and cursor-based pagination for the deals listing.

## Test Coverage Map

| Scenario | Verifies |
|----------|----------|
| SC-31: create persists StudentVerification with pending status | BR-1: Verification record created on email submission |
| SC-32: findByMemberId returns null for unknown member | BR-1: Repository handles missing records cleanly |
| SC-33: findByEduEmail enforces unique constraint | BR-4: One .edu per Rakuten account at DB layer |
| SC-34: updateStatus sets verified + expires_at = verified_at + 12 months | BR-1, BR-3: Verified status and 12-month expiry set |
| SC-35: findExpiringBefore returns only verified records within threshold | BR-3: Expiry reminder query correctness |
| SC-36: OTP attempt count increments; record locked after 3 attempts | TR-1: Max 3 attempts enforced |
| SC-37: listActive returns only active deals ordered by display_order | BR-2, BR-7: Only active deals returned in correct order |
| SC-38: listActive cursor-based pagination returns correct next cursor | BR-2: Pagination contract met |

## Scenarios

### SC-31: create persists StudentVerification with pending status

**Type:** integration
**Given** a PostgreSQL test database with Prisma migrations applied
**And** a member record exists with a known `member_id`
**When** `StudentVerificationRepository.create` is called with a valid .edu email and hashed OTP
**Then** a row is inserted into `student_verifications` with `status = 'pending'`
**And** `member_id` and `edu_email` match the inputs
**And** `otp_code_hash` stores the hashed value (not the raw code)
**And** `otp_attempts` is 0
**Verifies:** BR-1 — "System sends a one-time code to the submitted .edu address"

---

### SC-32: findByMemberId returns null for unknown member

**Type:** integration
**Given** a clean `student_verifications` table
**When** `StudentVerificationRepository.findByMemberId` is called with a UUID that has no record
**Then** the method returns `null` (not an error or exception)
**Verifies:** BR-1 — Repository handles missing records cleanly without error propagation

---

### SC-33: findByEduEmail enforces unique constraint

**Type:** integration
**Given** a verification record already exists with `edu_email = 'student@university.edu'`
**When** `StudentVerificationRepository.create` is called with the same `edu_email` for a different `member_id`
**Then** a constraint violation error is thrown (unique constraint on `edu_email`)
**And** no new row is inserted
**Verifies:** BR-4 — "A .edu email address may only be used to verify a single Rakuten account"

---

### SC-34: updateStatus sets verified + expires_at = verified_at + 12 months

**Type:** integration
**Given** a `student_verifications` row with `status = 'pending'`
**When** `StudentVerificationRepository.updateStatus` is called to set `status = 'verified'`
**Then** the row's `status` is updated to `'verified'`
**And** `verified_at` is set to approximately now (UTC)
**And** `expires_at` is set to exactly `verified_at + interval '12 months'`
**And** `otp_code_hash` is cleared (null)
**Verifies:** BR-1 — "Verified members gain access"; BR-3 — "Student access is valid for 12 months"

---

### SC-35: findExpiringBefore returns only verified records within threshold

**Type:** integration
**Given** multiple `student_verifications` rows: some with `expires_at` within 7 days, some beyond 7 days, and some with `status != 'verified'`
**When** `StudentVerificationRepository.findExpiringBefore(now + 7 days)` is called
**Then** only rows with `status = 'verified'` AND `expires_at <= threshold` are returned
**And** rows with `status = 'expired'` or `expires_at > threshold` are excluded
**Verifies:** BR-3 — "Member receives an email reminder 7 days before expiry"

---

### SC-36: OTP attempt count increments; record locked after 3 attempts

**Type:** integration
**Given** a `student_verifications` row in `pending` status with `otp_attempts = 0`
**When** `StudentVerificationRepository.incrementOtpAttempts` is called three times
**Then** `otp_attempts` is 3 after the third call
**And** a call to verify the OTP when `otp_attempts >= 3` returns an error (code invalidated)
**And** `otp_code_hash` is cleared once the maximum is reached
**Verifies:** TR-1 — "A maximum of 3 incorrect attempts are allowed before the code is invalidated"

---

### SC-37: listActive returns only active deals ordered by display_order

**Type:** integration
**Given** the `student_deals` table contains 3 active deals and 1 inactive deal (`is_active = false`)
**When** `StudentDealRepository.listActive()` is called
**Then** exactly 3 deals are returned
**And** the inactive deal is not present in the results
**And** results are ordered by `display_order` ascending
**Verifies:** BR-2 — "The page lists only merchants/offers curated for the student tier"; BR-7 — "Only active deals are shown"

---

### SC-38: listActive cursor-based pagination returns correct next cursor

**Type:** integration
**Given** the `student_deals` table contains 5 active deals
**When** `StudentDealRepository.listActive({ limit: 3 })` is called
**Then** 3 deals are returned
**And** a `next` cursor is returned for the remaining 2
**When** `StudentDealRepository.listActive({ limit: 3, cursor: <next> })` is called
**Then** the remaining 2 deals are returned
**And** no `next` cursor is returned (last page)
**Verifies:** BR-2 — Pagination contract met for the Student Exclusive deals listing

---

## Load Test Scenarios (v2)

*Load test design is deferred. When ready, run `forge:spec-tests --load-tests` to extend this suite with load scenarios.*
