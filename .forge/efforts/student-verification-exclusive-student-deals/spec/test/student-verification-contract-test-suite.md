# Contract Test Suite — student-verification

*Effort:* `student-verification-exclusive-student-deals`
*Authored:* 2026-06-02

## Why Test This

The student verification API contract defines the interface between the Next.js frontend and the API route handlers. Contract tests verify that each endpoint returns the exact response shape, status code, and headers documented in `spec/api/student-verification.yaml` — catching regressions before they reach the UI. Every documented response code gets a scenario; shape assertions are derived from the OpenAPI schema, not hardcoded.

## Test Coverage Map

| Scenario | Verifies |
|----------|----------|
| SC-19: POST /student_verifications — 201 Created | BR-1: OTP sent, verification record created |
| SC-20: POST /student_verifications — 400 Bad Request | BR-1: Malformed request rejected |
| SC-21: POST /student_verifications — 401 Unauthorized | BR-1: Unauthenticated request rejected |
| SC-22: POST /student_verifications — 422 Unprocessable Entity | BR-4: Duplicate .edu rejected |
| SC-23: POST /student_verifications — 429 Too Many Requests | TR-1: Rate limit with Retry-After header |
| SC-24: POST /student_verifications/verify — 200 OK | BR-1: Correct OTP verification succeeds |
| SC-25: POST /student_verifications/verify — 422 Unprocessable Entity | TR-1: Invalid/expired/max-attempts rejected |
| SC-26: POST /student_verifications/resend — 200 OK | TR-1: Resend returns new OTP expiry |
| SC-27: POST /student_verifications/resend — 429 Too Many Requests | TR-1: Resend rate-limited with Retry-After |
| SC-28: GET /student_status — 200 OK | BR-5: StudentStatus shape returned |
| SC-29: GET /student_deals — 200 OK | BR-2: Paginated StudentDeal[] shape |
| SC-30: GET /student_deals — 403 Forbidden | BR-2: Non-verified member blocked |

## Scenarios

### SC-19: POST /student_verifications — 201 Created

**Type:** contract
**Given** a logged-in member sends a POST request with a valid .edu email in the body
**And** the Client-Agent header is present
**When** the request is received
**Then** the response status is 201
**And** the response body matches the `VerificationResponse` schema from `student-verification.yaml`
**And** a `Location` header is present pointing to the created verification record
**Verifies:** BR-1 — "System sends a one-time code to the submitted .edu address"

---

### SC-20: POST /student_verifications — 400 Bad Request

**Type:** contract
**Given** a logged-in member sends a POST request with a body that cannot be parsed (e.g. missing `edu_email` field)
**When** the request is received
**Then** the response status is 400
**And** the response body matches the `ErrorResponse` schema
**And** the `errors` array is non-empty with a `code` and `message` field
**Verifies:** BR-1 — Malformed requests handled with correct status code

---

### SC-21: POST /student_verifications — 401 Unauthorized

**Type:** contract
**Given** an unauthenticated request (no bearer token, no euid cookie) is sent to the endpoint
**When** the request is received
**Then** the response status is 401
**And** the response body matches the `ErrorResponse` schema
**Verifies:** BR-1 — Unauthenticated requests rejected at the API layer

---

### SC-22: POST /student_verifications — 422 Unprocessable Entity

**Type:** contract
**Given** a logged-in member sends a POST request with a .edu address already linked to another account
**When** the request is received
**Then** the response status is 422
**And** the response body matches the `ErrorResponse` schema
**And** the `errors[0].code` indicates a duplicate .edu violation
**Verifies:** BR-4 — "The member is shown a clear error if their .edu is already in use on another account"

---

### SC-23: POST /student_verifications — 429 Too Many Requests

**Type:** contract
**Given** a logged-in member has exceeded the submission rate limit
**When** a further POST request is received
**Then** the response status is 429
**And** a `Retry-After` header is present with the seconds until the next allowed request
**And** the response body matches the `ErrorResponse` schema
**Verifies:** TR-1 — "Resend requests must be rate-limited to no more than once every 60 seconds"

---

### SC-24: POST /student_verifications/verify — 200 OK

**Type:** contract
**Given** a logged-in member with a pending OTP sends a POST request with the correct 6-digit code
**When** the request is received
**Then** the response status is 200
**And** the response body matches the `VerificationResponse` schema
**And** `data.status` is `"verified"`
**And** `data.expires_at` is an ISO 8601 UTC timestamp approximately 12 months from now
**Verifies:** BR-1 — "Member confirms the code to complete verification"

---

### SC-25: POST /student_verifications/verify — 422 Unprocessable Entity

**Type:** contract
**Given** a logged-in member sends a POST request with an incorrect, expired, or invalidated OTP
**When** the request is received
**Then** the response status is 422
**And** the response body matches the `ErrorResponse` schema
**And** `errors[0].code` distinguishes the failure reason (invalid code, expired, or max attempts)
**Verifies:** TR-1 — "A maximum of 3 incorrect attempts are allowed; code expires in 15 minutes"

---

### SC-26: POST /student_verifications/resend — 200 OK

**Type:** contract
**Given** a logged-in member with a pending verification sends a resend request
**And** at least 60 seconds have elapsed since the last OTP was sent
**When** the request is received
**Then** the response status is 200
**And** the response body matches the `ResendOtpResponse` schema
**And** `data.otp_expires_at` is an ISO 8601 UTC timestamp 15 minutes from now
**Verifies:** TR-1 — "OTP expires in 15 minutes from send"

---

### SC-27: POST /student_verifications/resend — 429 Too Many Requests

**Type:** contract
**Given** a logged-in member sends a resend request within 60 seconds of the previous one
**When** the request is received
**Then** the response status is 429
**And** a `Retry-After` header is present
**And** the response body matches the `ErrorResponse` schema
**Verifies:** TR-1 — "Resend requests must be rate-limited to no more than once every 60 seconds"

---

### SC-28: GET /student_status — 200 OK

**Type:** contract
**Given** a logged-in member (any verification state) sends a GET request
**When** the request is received
**Then** the response status is 200
**And** the response body matches the `StudentStatusResponse` schema
**And** `data.is_verified` is a boolean
**And** `data.status` is one of: `none`, `pending`, `verified`, `expired`, `revoked`
**And** `meta.status.code` and `meta.operation.request_id` are present
**Verifies:** BR-5 — Banner state data returned for all three visitor states

---

### SC-29: GET /student_deals — 200 OK

**Type:** contract
**Given** a logged-in verified member sends a GET request to `/student_deals`
**When** the request is received
**Then** the response status is 200
**And** the response body matches the `StudentDealsListResponse` schema
**And** `data` is an array of `StudentDeal` objects
**And** each deal contains `id`, `merchant_name`, `logo_url`, `cashback_rate` (with `value` and `scale`), and `display_order`
**And** `pagination` is present (with optional `next` cursor)
**Verifies:** BR-2 — "The page lists only merchants/offers curated for the student tier"

---

### SC-30: GET /student_deals — 403 Forbidden

**Type:** contract
**Given** a logged-in member with no verified student status sends a GET request to `/student_deals`
**When** the request is received
**Then** the response status is 403
**And** the response body matches the `ErrorResponse` schema
**Verifies:** BR-2 — "Non-verified users cannot access or see the Student Exclusive deals page"

---

## Load Test Scenarios (v2)

*Load test design is deferred. When ready, run `forge:spec-tests --load-tests` to extend this suite with load scenarios.*
