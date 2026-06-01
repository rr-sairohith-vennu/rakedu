# User Stories — Student Verification - Exclusive Student Deals

*Effort: student-verification-exclusive-student-deals*
*Derived from: [requirements/business.md](business.md)*
*Written: 2026-06-01*

---

## Student verification

- As a logged-in member, I want to verify my student status using my .edu email so that I can access exclusive student deals and boosted cashback rates.
- As a logged-in member, I want to receive a one-time code at my .edu address so that I can confirm my email is valid before gaining access.
- As a logged-in member, I want to be told clearly if my .edu address is already associated with another account so that I understand why verification failed.
- As an anonymous visitor, I want to be taken directly to the verification flow after I sign up or log in so that I don't have to find the entry point again.

## Student Exclusive deals page

- As a verified student, I want to see a dedicated page of student-exclusive merchants and their boosted cashback rates so that I can find and act on the best deals available to me.
- As a non-verified member, I want to be prevented from accessing the Student Exclusive page so that the benefit remains exclusive to verified students.

## Homepage banner

- As an anonymous visitor, I want to see a banner promoting student deals with a CTA so that I know the program exists and can sign up to access it.
- As a logged-in non-verified member, I want to see a verification CTA on the homepage so that I can easily start the verification process.
- As a verified student, I want to see a confirmation badge on the homepage banner so that I know my verification is active.

## Verification expiry and renewal

- As a verified student approaching expiry, I want to receive an email 7 days before my status expires so that I have time to re-verify before losing access.
- As a verified student approaching expiry, I want to see an in-app banner prompting re-verification so that I am reminded even if I miss the email.
- As a verified student whose status has expired, I want to re-verify using the same .edu OTP flow so that I can regain access to student deals.

## Deals content

- As a product manager, I want student deals to be managed in the database with an active/inactive flag so that I can update the merchant list without a code deploy.
