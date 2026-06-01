# Query Patterns

*Effort: student-verification-exclusive-student-deals*  *Authored: 2026-06-01*

---

| Pattern | Entity | Filters | Sort | Source | Notes |
|---------|--------|---------|------|--------|-------|
| Find member by ID | MEMBER | id = ? | — | BR-1, BR-5 | Session auth lookup |
| Find member by email | MEMBER | email = ? | — | BR-1, BR-6 | Login / sign-up dedup |
| Find verification by member | STUDENT_VERIFICATION | member_id = ? | — | BR-1, BR-3, BR-5, BR-8 | Check student status per request |
| Find verification by .edu email | STUDENT_VERIFICATION | edu_email = ? | — | BR-4 | Enforce one .edu per account |
| Find active + unexpired verification by member | STUDENT_VERIFICATION | member_id = ?, status = 'verified', expires_at > now() | — | BR-2, BR-8 | Gate access to student deals page |
| Find verifications expiring in 7 days | STUDENT_VERIFICATION | status = 'verified', expires_at BETWEEN now() AND now()+7d | — | BR-3 | Scheduled expiry reminder job |
| List active student deals | STUDENT_DEAL | is_active = true | display_order ASC | BR-2, BR-7 | Student Exclusive page |
| Find deal by ID | STUDENT_DEAL | id = ? | — | BR-7 | Admin management |
