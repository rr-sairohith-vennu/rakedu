# Business Requirements — Student Verification - Exclusive Student Deals

*Effort: student-verification-exclusive-student-deals*
*Created: 2026-06-01*

---

## BR-1: Student identity verification via .edu email

Rakuten Rewards members who are students can verify their student status by submitting a .edu email address. The system sends a one-time verification code to that address; upon successful confirmation the member is granted access to the Student Exclusive deals tier with boosted cashback rates.

**Acceptance criteria:**
- Member can enter a .edu email address on the verification flow
- System sends a one-time code to the submitted .edu address
- Member confirms the code to complete verification
- Verified members gain access to the Student Exclusive deals page
- Verified members see boosted cashback rates on the Student Exclusive deals page

---

## BR-2: Dedicated Student Exclusive deals page

A dedicated page/section exists that is only accessible to verified students. It displays a curated set of merchants with elevated cashback rates that are distinct from the standard deals page.

**Acceptance criteria:**
- Non-verified users cannot access or see the Student Exclusive deals page
- The page lists only merchants/offers curated for the student tier
- Each merchant displays an elevated cashback rate specific to the student tier
- The page is visually distinct from the standard deals/cashback page

---

## BR-3: Student verification expires after 12 months

Verified student status is valid for 12 months from the date of verification. Members are prompted to re-verify when their status expires or is about to expire.

**Acceptance criteria:**
- Student access is automatically revoked 12 months after verification
- Member receives a re-verification prompt before or at expiry
- Re-verification follows the same .edu email + OTP flow as initial verification
- Member receives an email reminder 7 days before expiry
- An in-app banner prompts re-verification starting 7 days before expiry and persists until re-verified

---

## BR-4: One .edu address per Rakuten account

A .edu email address may only be used to verify a single Rakuten account. The same .edu address cannot be used to grant student access to multiple accounts.

**Acceptance criteria:**
- If a .edu address is already associated with an existing verified account, a second account cannot use it for verification
- The member is shown a clear error if their .edu is already in use on another account

---

## BR-5: Student verification banner on homepage

The homepage displays a student verification banner for all three visitor states:

- **Anonymous visitor** — banner with a CTA to sign up / verify as a student
- **Logged-in, not verified** — banner with a CTA to begin verification
- **Logged-in, verified** — banner replaced with a "You're verified" confirmation badge (no CTA)

**Acceptance criteria:**
- Anonymous visitors see the student deal promotion with a sign-up/verify CTA
- Logged-in non-verified members see the verification CTA on the homepage banner
- Logged-in verified members see a confirmation badge instead of the CTA
- The banner is present on the homepage for all three states

---

## BR-6: Anonymous visitor CTA continues into verification after auth

When an anonymous visitor clicks the student verification CTA, they are redirected to sign-up/login. After successful authentication, they are automatically returned to the student verification flow — not the homepage.

**Acceptance criteria:**
- Clicking the banner CTA as an anonymous user redirects to sign-up/login
- After completing sign-up or login, the member is returned directly to the verification flow
- No separate marketing landing page is shown in this path

---

## BR-7: Student deals content is database-driven

The curated merchant list and cashback rates on the Student Exclusive page are managed directly in the database. No CMS integration is required for v1.

**Acceptance criteria:**
- Student deals are stored in a database table with merchant name, logo URL, cashback rate, and an active/inactive flag
- Only active deals are shown on the Student Exclusive page
- Deals can be added, updated, or deactivated without a code deploy

---

## BR-8: Student access revoked immediately on expiry

When a member's student verification expires, access to the Student Exclusive deals page is revoked immediately. There is no grace period.

**Acceptance criteria:**
- Member cannot access the Student Exclusive page once their verification has expired
- The homepage banner reverts to the non-verified CTA state upon expiry
- Member must complete re-verification to regain access
