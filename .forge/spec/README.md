# Repo-Level Technical Spec

Technical specification artifacts that apply equally to **every deployable in this
repository**. This is a narrow scope — if a decision affects only one deployable, it
belongs in that deployable's `spec/arch-decisions/` directory.

> **Vocabulary:** In this organization, `design/` means UI/UX work. All Forge technical
> specification artifacts use `spec/`. Forge does not create or govern a `design/`
> directory — that is reserved for UI/UX artifacts.

Examples of what belongs here:
- Shared distribution mechanism that all plugins must follow
- CI platform choice that governs all deployables in this repo
- Repo-wide tooling decisions (language, package manager, test runner)

## Contents

| Directory | Purpose |
|-----------|---------|
| [`arch-decisions/`](arch-decisions/README.md) | ADRs for decisions spanning all deployables in this repo |
