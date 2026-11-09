# Changelog

All notable project changes are documented in this file.

## [Unreleased]

### Changed

- Replaced the custom community-source license with the standard GNU Affero
  General Public License v3.0 for the project's original source code, with a
  separate notice for branding and third-party materials.
- Defined a staged collaborator program: limited moderation comes first, while
  write access requires a separate request and explicit Project Owner approval.

### Added

- Added maintainer-gated squash auto-merge after protected-branch requirements
  pass.
- Added validated weekly production deployments from `main`, with a manual
  release option for urgent changes.
- Added a pull-request assignment guard that closes contributions without an
  assigned, linked issue and explains how to correct and reopen them.
- Added a structured pull-request template inspired by Oppia's review workflow,
  with required issue linkage, evidence, responsive proof, verification, and a
  contributor checklist tailored to GSoC Organizations.
- Added a one-time welcome and clear CLA signing instructions for first-time
  contributors when they open a pull request.
- Expanded self-service issue claiming to two simultaneous assignments per
  contributor, with live conflict checks and `/unclaim` support.
- Added daily claim-inactivity maintenance with a seven-day reminder and
  automatic release after fourteen days without contributor progress.

## [1.0.0] — 2026-11-09

The first public release of GSoC Organizations.

### Highlights

- Searchable directory covering 519 organizations across archived GSoC years.
- Filters for participation years, categories, technologies, and topics.
- Detailed organization profiles with participation charts and historical
  project records.
- Browser-local saved organizations and responsive desktop and mobile layouts.
- Static SEO hub pages for years, technologies, topics, and categories.
- Curated repository-link workflow with validation and contributor guidance.
- Automated quality checks, CLA verification, issue claiming, contributor
  milestones, and collaborator applications.

[1.0.0]: https://github.com/rohanmalhotracodes/GSoC-Organizations/releases/tag/v1.0.0
