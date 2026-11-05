# Product research

Research date: 2026-11-05

This document separates directly observed problems and public requests from ideas that would require new data. The implementation uses the reference project only for information architecture, behavior, and public factual data; it does not inherit the reference repository’s history or metadata.

## Sources reviewed

- [Reference repository](https://github.com/nishantwrp/gsoc-organizations) and its [issue tracker](https://github.com/nishantwrp/gsoc-organizations/issues)
- [Official GSoC guide: Choosing an Organization](https://google.github.io/gsocguides/student/choosing-an-organization)
- [Official GSoC program projects](https://summerofcode.withgoogle.com/programs/2026/projects)
- [GSoC 2026 Explorer](https://gsoc-explorer.vercel.app/) and its [source repository](https://github.com/VincenzoImp/GSoC-2026-explorer)
- [GSoC Organizations Guide](https://www.gsocorganizationsguide.com/organizations)
- [helpmehack programs directory](https://www.helpmehack.tech/programs)
- [OpenOrganizations public API](https://www.openorganizations.site/api/)
- Reddit discussions about [getting lost while scrolling past projects](https://www.reddit.com/r/gsoc2026Community/comments/1qmawk9/compiled_a_queryable_database_of_8826_past_gsoc/), [the official explorer feeling overwhelming](https://www.reddit.com/r/gsoc2026Community/comments/1rdoue8/made_a_tool_for_beginners_to_select_and_match_org/), and [filtering by technology and participation history](https://www.reddit.com/r/gsoc2026Community/comments/1pjlpjs/how_to_find_the_right_org_and_how_can_i_genuinely/)

## Confirmed problems

These are supported by reproducible reference-project issues or explicit public comments.

1. Malformed shared filter URLs can blank the entire page. Reference issue [#210](https://github.com/nishantwrp/gsoc-organizations/issues/210) documents a `JSON.parse` failure for invalid `filters` input; issue [#213](https://github.com/nishantwrp/gsoc-organizations/issues/213) asks for the handling to be documented. The new parser treats URL state as untrusted input, constrains values, and ignores malformed legacy JSON.
2. Equivalent technology labels fragment filtering. Issue [#209](https://github.com/nishantwrp/gsoc-organizations/issues/209) identifies case, whitespace, and punctuation variants such as Node.js/nodejs/NodeJS. Closed issue [#197](https://github.com/nishantwrp/gsoc-organizations/issues/197) describes the same normalization class. The build normalizes a small documented equivalence map and validates case-insensitive duplicates.
3. Clearing many filters one by one is laborious. Issue [#193](https://github.com/nishantwrp/gsoc-organizations/issues/193) explicitly requests a reset-all control. The directory includes global reset and per-section resets.
4. Direct organization source links are hard to reach. Issue [#184](https://github.com/nishantwrp/gsoc-organizations/issues/184) asks for a GitHub link on every card. Issue [#136](https://github.com/nishantwrp/gsoc-organizations/issues/136) reports a “View Code” action pointing to an internship report instead of source. The new model supports multiple hosts, link provenance, multiple repositories, and a search fallback.
5. Users need negative filtering. Issue [#149](https://github.com/nishantwrp/gsoc-organizations/issues/149) gives the example of excluding machine-learning organizations. Technology and topic exclusions are first-class and shareable.
6. Users want project-count sorting. Issue [#173](https://github.com/nishantwrp/gsoc-organizations/issues/173) requests sorting organizations by completed projects. The new sort options also include recency, participation count, and name.
7. Historical visualizations can enter resize loops. Issue [#134](https://github.com/nishantwrp/gsoc-organizations/issues/134) documents a continuously resizing project-count chart at certain viewport sizes. The new chart is a static SVG with a fixed `viewBox`, so no resize observer or canvas reflow loop is involved.
8. Contribution links become stale. Issue [#120](https://github.com/nishantwrp/gsoc-organizations/issues/120) reports an outdated AsyncAPI contribution guide. Link provenance, `lastChecked`, offline URL validation, optional network checks, and a manual review queue make freshness visible and maintainable.
9. Browsing many organizations and projects is cognitively heavy. One Reddit author describes getting “lost scrolling” through old organization/project pages; another calls the official experience overwhelming. This supports compact cards, global full-text search, persistent shortlisting, and a single profile that groups history and resources. These reports do not support subjective organization ratings.

## Requested features

The following are explicit requests or recurring feature patterns, not claims that every user wants them.

- Browser-local bookmarks and notes: reference issue [#123](https://github.com/nishantwrp/gsoc-organizations/issues/123).
- Export of a filtered result set: reference pull request list includes [export filtered data](https://github.com/nishantwrp/gsoc-organizations/pull/158).
- Better Lighthouse performance: reference issue [#124](https://github.com/nishantwrp/gsoc-organizations/issues/124).
- Project-technology exploration: reference issue [#155](https://github.com/nishantwrp/gsoc-organizations/issues/155).
- Full-text idea browsing: the competing [GSoC 2026 Explorer](https://github.com/VincenzoImp/GSoC-2026-explorer) normalizes ideas from heterogeneous sources, while the official program site searches published projects.
- Participation consistency and historical capacity views: [GSoC Organizations Guide](https://www.gsocorganizationsguide.com/organizations) and [helpmehack](https://www.helpmehack.tech/programs) expose year, project, and stack history; a Reddit commenter explicitly asks to isolate organizations with consistent participation.

## Competitive observations

- The official GSoC site is the authoritative program source and exposes organizations and projects, but cross-year comparison and private research workflows are outside its primary scope.
- GSoC 2026 Explorer provides a strong current-year ideas search and a scraper that handles GitHub, wikis, Google Docs, issue trackers, plain HTML, and JavaScript-rendered pages. Its normalized idea corpus is a useful future data-ingestion reference.
- GSoC Organizations Guide emphasizes large-scale historical counts, stack filters, participation patterns, and saved organizations.
- helpmehack groups multiple open-source programs and shows project/repository links where available.
- OpenOrganizations provides a cross-program public JSON model. It demonstrates demand for reusable, queryable organization data beyond one program year.

## Data-dependent future ideas

These are intentionally not implemented as scores or claims because the current public archive does not provide a transparent, refreshable basis.

- Repository activity, responsiveness, or newcomer-support indicators would need a documented sampling window, host-specific collection, bot filtering, and a refresh policy.
- Acceptance probability or “competition” would require applicant denominators, which the public archive does not provide. Project counts alone are not a valid proxy.
- Difficulty or beginner-friendliness needs organization-authored labels or a transparent rubric with human review.
- Mentor responsiveness requires consent, privacy safeguards, and reliable communication-channel data.
- AI matching is requested in issue [#160](https://github.com/nishantwrp/gsoc-organizations/issues/160), but recommendations should not be presented as community consensus or objective fit without an auditable method.
- Cross-program organization identity reconciliation is useful but needs persistent organization identifiers rather than name-only matching.

## Product decisions from the research

- Keep the recognizable sidebar, search, grid, detail, chart, and year-section structure.
- Treat all URL and browser-local state as untrusted and recoverable.
- Make repository provenance visible at the moment of use.
- Prefer deterministic filters and transparent historical facts over opaque rankings.
- Keep all discovery interactions local and ship no analytics or advertising by default.
