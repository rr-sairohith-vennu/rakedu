---
branch_regex: "^(feat|feature|release|hotfix|bugfix)/[a-zA-Z0-9][a-zA-Z0-9-]*$"
---

# Branch Naming Convention

This repository uses the Rakuten Rewards standard CI/CD pipeline
(`rewards-devops/gh-reusable-workflows/.github/workflows/helm-upgrade-nonprod.yaml`).

Branch names must use one of the supported prefixes followed by a short lowercase
hyphenated description of the work.

Pattern: `<type>/<description>`

Allowed prefixes:
- `feat/`    — new feature (short form)
- `feature/` — new feature (long form)
- `release/` — release preparation
- `hotfix/`  — urgent production fix
- `bugfix/`  — bug fix

The description should be a short kebab-case summary, optionally prefixed with a
Jira ticket ID.

Examples:
- `feat/add-user-preferences`
- `feature/REWD-1234-add-gift-card-endpoint`
- `bugfix/null-pointer-payment`
- `hotfix/auth-timeout`
- `release/2.1.0`

When creating a branch for a Forge effort, use the effort title to derive the
description slug (lowercase, spaces to hyphens, strip special characters) and
choose the prefix that best matches the nature of the work.
