# GSoC Organizations

GSoC Organizations is a static-first explorer for researching Google Summer of Code organizations. It provides local full-text search, filters, sorting, browser-local shortlists, participation history, historical projects, and transparent repository-link states.

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
npm run cache:logos
npm run dev
```

The development server is available at `http://localhost:4321` by default.

## Build and preview

```sh
npm run build
npm run preview
```

The production output is written to `dist/`. Astro emits one static page for every organization.

## Cloudflare Pages

The production site is available at [gsocorganizations.xyz](https://gsocorganizations.xyz), with [www.gsocorganizations.xyz](https://www.gsocorganizations.xyz) attached to the same Cloudflare Pages project.

The tracked `wrangler.toml` configures the Pages project and its `dist/` output directory. After authenticating Wrangler, build and publish the production branch with:

```sh
npm run deploy:pages
```

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
2. Run `npm run cache:logos` to rebuild the normalized data and download any new organization logos into the local static asset cache.
3. Review changes to `src/data/organizations.json`, `data/logo-assets.json`, `public/organization-logos/`, and `api/repository-links.json`.
4. Run `npm run validate`, `npm test`, and `npm run build`.
5. Manually review new or changed repository links using [`docs/repository-curation.md`](docs/repository-curation.md).

This follows the same data lifecycle as `gsocorganizations.dev`: annual JSON snapshots are committed to the repository and compiled during the static build. The reference site does not query GSoC or GitHub at page-request time and does not contain an automatic annual scraper.

During compilation, `scripts/prepare-data.mjs`:

1. Applies a reviewable organization-name alias table.
2. Merges annual records when their canonical names or normalized official website URLs match.
3. Uses only the three most recent participation records for current technology/topic tags while retaining every historical project year.
4. Normalizes clear tag equivalents such as capitalization, surrounding whitespace, `nodejs`/`Node.js`, and `golang`/`Go` without collapsing meaningful distinctions such as C and C++.
5. Derives participation totals and repository candidates.
6. Emits the normalized static dataset consumed by Astro.

The version-controlled logo cache keeps organization artwork on the same Cloudflare CDN as the website, so rendering does not depend on third-party image hosts. The first visible row is requested eagerly; remaining logos retain native lazy loading.

This produces 519 historical organization identities from the 2016–2026 snapshots, including all 183 organizations in the 2026 snapshot.

## Repository curation

`api/repository-links.json` is generated for full coverage and then reviewed through the workflow in [`docs/repository-curation.md`](docs/repository-curation.md). Link states are explicit:

- `manual`: verified against an organization-controlled source.
- `derived`: extracted from an official record only when it points directly to a recognized source-code host.
- `unresolved`: no direct source destination has been established, so no repository button is shown.

The build never creates web-search links. Manual records in `api/repository-links.json` are preserved across data rebuilds. `api/unresolved-repositories.json` lists missing links, while `api/derived-repositories-to-review.json` lists direct code-host links that still need manual confirmation.

For umbrella organizations, add multiple repository records rather than choosing one representative project.

## Architecture

- `src/pages/index.astro`: static directory shell.
- `src/components/Explorer.tsx`: local search, filters, sorting, URL state, and shortlist.
- `src/pages/org/[slug].astro`: statically generated organization pages.
- `src/data/organizations.json`: normalized, version-controlled browsing data.
- `api/repository-links.json`: repository link records and provenance.
- `api/unresolved-repositories.json`: organizations still awaiting a direct repository or source-host profile.
- `api/derived-repositories-to-review.json`: direct code-host links awaiting manual confirmation.
- `scripts/prepare-data.mjs`: repeatable build-time compiler using canonical-name and official-website identity matching.
- `scripts/validate-data.mjs`: schema, duplicate, tag, and URL checks.
- `scripts/validate-repository-links.mjs`: repository format, provenance, duplicate, redirect, and reachability checks.

Bookmarks and notes use versioned local-storage keys. Malformed local data or URL parameters are ignored rather than crashing the interface.

## Known data limitations

- Organization name changes without a known alias and simultaneous official-website changes can appear as separate historical records until manually reconciled.
- Derived repository links require the manual review workflow before they can be marked verified.
- Public archive records occasionally contain stale external links. Validation identifies malformed URLs; network validation and manual review are still needed for freshness.

The product deliberately does not invent competition, acceptance, difficulty, mentor-response, activity, or beginner-friendliness scores.
