# GSoC Atlas

GSoC Atlas is a static-first explorer for researching Google Summer of Code organizations. It provides local full-text search, inclusion and exclusion filters, sorting, browser-local shortlists and notes, CSV export, participation history, historical projects, and transparent repository-link states.

This is an independent community project. It is not affiliated with or endorsed by Google. Google Summer of Code is a Google program.

## Stack

- Astro static site generation
- React islands for the interactive directory, shortlist, bookmarks, and notes
- TypeScript
- Version-controlled JSON data
- Vitest unit tests and Playwright end-to-end tests

There is no browsing database, account system, advertising, analytics, or runtime GitHub API dependency.

## Local development

Requires Node.js 20.11 or newer.

```sh
npm install
npm run prepare:data
npm run dev
```

The development server is available at `http://localhost:4321` by default.

## Build and preview

```sh
npm run build
npm run preview
```

The production output is written to `dist/`. Astro emits one static page for every organization.

## Validation and tests

```sh
npm run validate
npm test
npm run test:e2e
npm run format:check
```

Repository validation is offline by default. Add network checks to detect redirects and broken links:

```sh
node scripts/validate-repository-links.mjs --network
```

## Data refresh

Annual source snapshots live in `data/raw/YYYY.json`. They are factual exports of the public Google Summer of Code archive data model. To refresh:

1. Replace or add the relevant annual snapshot.
2. Run `npm run prepare:data`.
3. Review changes to `src/data/organizations.json` and `api/repository-links.json`.
4. Run `npm run validate`, `npm test`, and `npm run build`.
5. Manually review new or changed repository links using [`docs/repository-curation.md`](docs/repository-curation.md).

The preparation script normalizes only clear equivalents such as capitalization, surrounding whitespace, `nodejs`/`Node.js`, and `golang`/`Go`. It intentionally keeps meaningful distinctions such as C and C++.

## Repository curation

`api/repository-links.json` is generated for full coverage and then reviewed through the workflow in [`docs/repository-curation.md`](docs/repository-curation.md). Link states are explicit:

- `manual`: verified against an organization-controlled source.
- `derived`: inferred from the ideas page, contribution guide, or organization site and never shown as verified.
- `search`: a clearly labeled repository-search fallback.

For umbrella organizations, add multiple repository records rather than choosing one representative project.

## Architecture

- `src/pages/index.astro`: static directory shell.
- `src/components/Explorer.tsx`: local search, filters, sorting, URL state, shortlist, and CSV export.
- `src/pages/org/[slug].astro`: statically generated organization pages.
- `src/data/organizations.json`: normalized, version-controlled browsing data.
- `api/repository-links.json`: repository link records and provenance.
- `scripts/prepare-data.mjs`: repeatable data compiler.
- `scripts/validate-data.mjs`: schema, duplicate, tag, and URL checks.
- `scripts/validate-repository-links.mjs`: repository format, provenance, duplicate, redirect, and reachability checks.

Bookmarks and notes use versioned local-storage keys. Malformed local data or URL parameters are ignored rather than crashing the interface.

## Known data limitations

- Organization name changes across years can appear as separate historical records until manually reconciled.
- Most repository links are inferred and require the manual review workflow before they can be marked verified.
- Project-level technology tags are text matches against organization-declared technologies. They are displayed as inferred, not authoritative.
- Public archive records occasionally contain stale external links. Validation identifies malformed URLs; network validation and manual review are still needed for freshness.

The product deliberately does not invent competition, acceptance, difficulty, mentor-response, activity, or beginner-friendliness scores.
