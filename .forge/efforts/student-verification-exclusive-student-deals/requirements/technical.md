# Technical Requirements — Student Verification - Exclusive Student Deals

*Effort: student-verification-exclusive-student-deals*
*Elaborated from: [requirements/business.md](business.md)*
*Created: 2026-06-01*

---

## TR-1: OTP expiry, attempt limits, and resend rate limit

*Traces to: BR-1*

The one-time verification code must expire after 15 minutes. A maximum of 3 incorrect attempts are allowed before the code is invalidated and the member must request a new one. Resend requests must be rate-limited to no more than once every 60 seconds.

---

## TR-2: Email delivery — Mailtrap for dev/test; Rakuten email infrastructure for production

*Traces to: BR-1*

OTP emails must be sent via Mailtrap (SMTP sandbox) during development and testing. Production integration with Rakuten's existing transactional email infrastructure is required before launch but is out of scope for this effort. The email sending layer must be abstracted so the provider can be swapped without changes to the verification flow logic.

---

## TR-3: Tech stack

*Traces to: BR-1, BR-2, BR-5, BR-6*

This is a standalone Next.js 14 (App Router) application. The following stack is mandated:

- **Frontend + API layer**: Next.js 14 with App Router and API routes (full-stack, single repo)
- **Database**: PostgreSQL with Prisma ORM
- **Auth/session**: NextAuth.js — handles sign-up/login and post-auth redirect continuation into the verification flow
- **Email**: Nodemailer configured against Mailtrap SMTP for dev/test; abstracted behind a service interface for future provider swap
- **Language**: TypeScript throughout
- **Deployment**: Local development only (prototype). No cloud hosting or CI/CD pipeline required for this effort.

---

## TR-4: Performance targets

*Traces to: BR-1, BR-2*

- Student Exclusive page must load in ≤ 2s at p95
- OTP verification email must be delivered within 30 seconds of request
- Verification API endpoints must handle 50 concurrent requests without degradation
