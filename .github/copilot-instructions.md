# Copilot review instructions

Review pull requests as a careful first-pass maintainer for GSoC Organizations.
Prioritize correctness, source integrity, security, accessibility, responsive
behavior, and maintainability over stylistic preferences.

## Repository expectations

- Treat `api/repository-links.json` as curated data. Repository destinations
  must be supported by an organization-controlled or official GSoC source.
- Flag Google Search URLs, contributor forks, guessed destinations, duplicate
  organization keys, unsupported hosts, invalid dates, and claims of
  verification without evidence.
- Keep pull requests scoped to the linked issue. Flag unrelated formatting,
  dependency, generated-data, or design changes.
- Do not suggest committing secrets, tokens, private data, build output, or
  dependency directories.
- Preserve the current Astro, React, and TypeScript architecture unless the
  change explicitly requires an architectural decision.
- For interface changes, check keyboard access, semantic elements, focus
  visibility, reduced-motion behavior, narrow mobile layouts, and layout shift.
- For stateful browser behavior, check that saved organizations remain local to
  the browser and do not unexpectedly reset or leak between contexts.
- Require tests for changed behavior and documentation for contributor-facing
  workflow changes.

## Expected verification

Repository-link changes should pass `npm run validate`. General code changes
should pass formatting, validation, unit tests, and a production build. Browser
interaction changes should also include or update Playwright coverage where
practical.

Leave concise, actionable comments. Identify blockers clearly, but do not
approve or merge pull requests on behalf of the maintainer.
