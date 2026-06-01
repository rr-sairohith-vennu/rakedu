-- Storage schema for: Student Verification - Exclusive Student Deals
-- Effort: student-verification-exclusive-student-deals
-- Authored: 2026-06-01
-- Database: PostgreSQL (Prisma ORM)

-- ============================================================
-- MEMBER (pre-existing table — shown for reference)
-- GDPR: Contains PII (email, name). Retention: per platform policy.
-- ============================================================
CREATE TABLE members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,  -- PII: member email
  name       TEXT,                          -- PII: display name
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ                    -- soft delete; null = active
);
-- Supports: "Find member by ID" (PK), "Find member by email"
CREATE UNIQUE INDEX idx_members_email ON members(email);


-- ============================================================
-- STUDENT_VERIFICATION
-- PII: edu_email is personal data. Retain for duration of
--      verification validity; anonymise on account deletion.
-- ============================================================
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'expired', 'revoked');

CREATE TABLE student_verifications (
  id               UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        UUID                NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  edu_email        TEXT                NOT NULL UNIQUE,   -- PII: .edu address
  status           verification_status NOT NULL DEFAULT 'pending',
  otp_code_hash    TEXT,                                  -- bcrypt hash of OTP; null after verification
  otp_expires_at   TIMESTAMPTZ,                           -- OTP window: 15 min from send
  otp_attempts     SMALLINT            NOT NULL DEFAULT 0, -- max 3 before invalidation
  otp_last_sent_at TIMESTAMPTZ,                           -- rate-limit resend to once per 60s
  verified_at      TIMESTAMPTZ,                           -- null until first successful verification
  expires_at       TIMESTAMPTZ,                           -- verified_at + interval '12 months'
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ         NOT NULL DEFAULT now()
);
-- Supports: "Find verification by member" (UNIQUE on member_id)
-- Supports: "Find verification by .edu email"
CREATE UNIQUE INDEX idx_student_verifications_edu_email ON student_verifications(edu_email);
-- Supports: "Find active + unexpired by member" and "Find verifications expiring in 7 days"
CREATE INDEX idx_student_verifications_status_expires ON student_verifications(status, expires_at);


-- ============================================================
-- STUDENT_DEAL
-- No PII. Managed directly in DB (BR-7).
-- ============================================================
CREATE TABLE student_deals (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name  TEXT         NOT NULL,
  logo_url       TEXT         NOT NULL,
  cashback_rate  NUMERIC(5,2) NOT NULL,    -- e.g. 12.50 = 12.50% cashback
  is_active      BOOLEAN      NOT NULL DEFAULT true,
  display_order  SMALLINT     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Supports: "List active student deals"
CREATE INDEX idx_student_deals_active_order ON student_deals(is_active, display_order);
-- Supports: "Find deal by ID" (PK)
