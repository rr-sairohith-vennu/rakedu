<!-- forge:managed:start -->
## Forge Framework

This repository uses the Forge AI-accelerated development framework.
Plugin version: v0.12.0

### Standards Navigation

When navigating standards or language guides, explicitly read the AGENTS.md
file in each relevant directory before loading individual files. Claude Code
does not load AGENTS.md automatically.

Standards and language guides are bundled with the Forge plugin. Locate the
current plugin root by running:

```bash
find ~/.claude/plugins/cache/forge-local -maxdepth 4 -name "plugin.json" -path "*/forge/*" 2>/dev/null \
  | head -1 | sed 's|/.claude-plugin/plugin.json||' \
  | grep . \
  || find ~/.claude/plugins/cache -maxdepth 5 -name "plugin.json" -path "*/forge/*" 2>/dev/null \
     | head -1 | sed 's|/.claude-plugin/plugin.json||'
```

Within the plugin root:
- `standards/` — language-agnostic architectural standards organized by domain
  (api, security, storage, testing, observability). Read `standards/AGENTS.md`
  first to understand what is available and which standards apply to your task.
- `languages/` — language-specific implementation guides (go, java, kotlin, swift,
  typescript). Read `languages/<lang>/AGENTS.md` before loading individual guides.

### Deployable Artifacts

A **deployable** is a named, independently shippable technical unit — a service,
application, or library. Its canonical artifacts describe the *current living state*
of that unit and are updated at every PR merge. Read these before writing or reviewing
code that belongs to a deployable: they tell you what the unit is required to do, how
it is architected, and what its constraints are.

Deployables are registered in `.forge/deployables/`. Read
`.forge/deployables/<deployable-name>/` for:
- `requirements/`  — business and technical requirements (current state)
- `spec/`          — architecture, ADRs, published interfaces (current state)
- `capabilities/`  — capability-scoped requirements, design, and test strategy
- `test-strategy.md` — deployable-level test strategy
- `security.md`    — threat model and security controls
- `deployment.md`  — deployment and rollback procedures
- `runbook/`       — operational procedures

Deployable directories are created by `forge:deployable` during discovery. Not every
repository will have deployables registered yet.

### PM Product Artifacts

PM products are registered in `.forge/products/` (product-role repos only). When a
product directory exists, read `.forge/products/<product-name>/` for:
- `requirements/`  — cross-deployable PM requirements
- `strategy.md`    — vision, goals, OKRs, success metrics
- `roadmap.md`     — PM roadmap
- `deployables.md`  — which deployables implement this product, with repo cross-refs

PM product directories are created by `forge:product-init` and are only present in
repositories with `repo_types` including `"product"`.

### Repository Architecture

Cross-cutting technical artifacts — not scoped to any single work item — live in
`.forge/spec/`. These represent the current agreed technical architecture across all
deployables and the whole repository. Work items contribute to these documents but
do not own them.

- `.forge/spec/arch-decisions/` — Architecture Decision Records (ADRs), numbered
  sequentially regardless of which work item prompted them. Written by `forge:adr`.
  Read these before modifying system-wide architectural concerns.

### Efforts

An **effort** is a scoped unit of work — an epic, story, task, or spike — with its own
requirements, design artifacts, and implementation plan. Its artifacts record the *goal
statement* and agreed design for that specific piece of work. Read effort artifacts
before implementing or reviewing a work item: they tell you what the work set out to
accomplish and what design decisions were made during discovery.

Active efforts are listed in `.forge/efforts/README.md` (start here to find an effort by ID
or title). Effort artifacts are in `.forge/efforts/<id>/`:
- `requirements/`    — what this work item must accomplish (goal statement)
- `spec/`            — design artifacts produced during discovery (API contracts,
                       storage schemas, messaging contracts)
- `plan/tasks.md`    — implementation task list with wave and type annotations
- `validation/`      — design validation report
- `meetings/`        — meeting records organized by month (e.g., `meetings/2026-03/`).
                       Each meeting has a transcript and a generated summary, named
                       `YYYY-MM-DD-HHMM-<description>-transcript.md` and
                       `YYYY-MM-DD-HHMM-<description>-summary.md`.
- `.state.json`      — machine-readable workflow state (current phase, approvals)
<!-- forge:managed:end -->
