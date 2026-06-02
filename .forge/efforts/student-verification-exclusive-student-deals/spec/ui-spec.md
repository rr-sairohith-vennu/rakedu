# UI Spec — Student Verification - Exclusive Student Deals

## Goal

Build the three user-facing UI surfaces for the student verification prototype: the .edu OTP verification flow (3 pages), the homepage student verification banner (6 states), and the Student Exclusive deals page — all driven by the API contract in `spec/api/student-verification.yaml`.

## Mode

mode: production

## Scope

scope: feature-area

Target location in the codebase:
- `app/verify-student/page.tsx` — email entry form
- `app/verify-student/confirm/page.tsx` — OTP confirmation form
- `app/verify-student/success/page.tsx` — verification success
- `components/StudentVerificationBanner.tsx` — homepage banner (integrated into homepage layout)
- `app/student-deals/page.tsx` — Student Exclusive deals page

## Data

All data comes from the API contract at `spec/api/student-verification.yaml`.

**Verification flow** — driven by three POST endpoints:
- `POST /student-verification/v1/regions/{region_id}/members/me/student_verifications`
  Request: `{ edu_email: string }` — initiates OTP, returns `StudentVerification`
- `POST .../student_verifications/verify`
  Request: `{ otp_code: string (6 chars) }` — verifies code, returns `StudentVerification`
- `POST .../student_verifications/resend`
  Returns: `{ otp_expires_at: string }` — new OTP expiry

**Homepage banner** — driven by:
- `GET /student-verification/v1/regions/{region_id}/members/me/student_status`
  Returns: `StudentStatus { is_verified, status, expires_at, days_until_expiry }`
- NextAuth session (determines anonymous vs. logged-in)

**Student Exclusive deals page** — driven by:
- `GET /student-verification/v1/student_deals?cursor=&limit=20`
  Returns: `StudentDealsListResponse { data: StudentDeal[], pagination: { next? } }`
  `StudentDeal { id, merchant_name, logo_url, cashback_rate: { value, scale }, display_order }`
  Note: `cashback_rate` is a value/scale tuple — display as `(value / 10^scale).toFixed(scale)%`

## Variants

<!-- not applicable: production mode -->

## Design Reference

No Figma or external design file. Generate implementation directly from requirements and API contract.

Screens:
1. `app/verify-student/page.tsx` — .edu email entry form
2. `app/verify-student/confirm/page.tsx` — 6-digit OTP entry form
3. `app/verify-student/success/page.tsx` — verification success confirmation
4. `components/StudentVerificationBanner.tsx` — homepage banner (all 6 states)
5. `app/student-deals/page.tsx` — Student Exclusive deals page

## States Required

### Verification flow — email entry page (`app/verify-student/page.tsx`)
- [ ] Idle — email input + submit CTA
- [ ] Submitting — button disabled, loading indicator
- [ ] Error: invalid format — inline error "Please enter a valid .edu email address"
- [ ] Error: 422 duplicate .edu — inline error "This .edu address is already linked to another account"
- [ ] Error: 429 rate limited — inline error with retry countdown

### Verification flow — OTP confirm page (`app/verify-student/confirm/page.tsx`)
- [ ] Idle — 6-digit OTP input + verify CTA, resend link (shows remaining time until resend is available)
- [ ] Submitting — button disabled, loading indicator
- [ ] Error: invalid code — inline error "Incorrect code. X attempts remaining."
- [ ] Error: max attempts exceeded (422) — error "Too many incorrect attempts. Please request a new code." + resend CTA
- [ ] Error: OTP expired (422) — error "Your code has expired. Please request a new one." + resend CTA
- [ ] Resending — resend link shows loading state, disabled
- [ ] Resend success — success toast/message, OTP expiry timer resets

### Verification flow — success page (`app/verify-student/success/page.tsx`)
- [ ] Success — confirmation message, CTA to visit Student Exclusive deals page

### Homepage banner (`components/StudentVerificationBanner.tsx`)
- [ ] Loading/skeleton — placeholder while `GET /student_status` resolves
- [ ] Anonymous — promotional banner with "Verify student status" CTA → sign-up/login with `callbackUrl=/verify-student`
- [ ] Logged-in, not verified — banner with "Get student deals" CTA → `/verify-student`
- [ ] Verified — confirmation badge "You're verified ✓" with link to `/student-deals`
- [ ] Expiring soon (days_until_expiry 1–7) — warning banner "Your student access expires in X days" + re-verify CTA
- [ ] Expired (days_until_expiry ≤ 0 or status=expired) — warning banner "Your student access has expired" + re-verify CTA

### Student Exclusive deals page (`app/student-deals/page.tsx`)
- [ ] Loading/skeleton — card grid skeleton placeholders
- [ ] Loaded — merchant card grid ordered by display_order
- [ ] Empty — "No student deals are available right now. Check back soon."
- [ ] Error — "Something went wrong loading student deals. Please try again."

## Accessibility Notes

None beyond organizational baseline (WCAG 2.1 AA).

Additional implementation notes:
- OTP input: use `inputmode="numeric"` and `pattern="[0-9]*"` for mobile numeric keyboard
- OTP input: `aria-label="Verification code"` and `aria-describedby` pointing to the error message when in error state
- Error messages: use `role="alert"` so screen readers announce them without focus change
- Banner CTAs: descriptive link text (not "click here") — e.g. "Verify your student status"
- Deals cards: each card's cashback rate must be readable as text, not image-only

## Out of Scope

- Mobile app (web prototype only)
- Analytics instrumentation
- Dark mode
- Internationalization / localization
- Admin interface for managing student deals content
- Email template UI (handled server-side by Nodemailer)
- Sign-up / login pages (handled by NextAuth — TASK-003)
