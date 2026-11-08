# Contributing to GSoC Organizations

Thank you for helping improve GSoC Organizations. Contributions from first-time
and experienced open-source contributors are welcome.

## Start here

1. Read this guide before opening a pull request.
2. Choose an existing issue and check that nobody else is working on it.
3. Comment on the issue to say you would like to work on it.
4. Keep each pull request focused on one issue.
5. Link the issue in the pull-request description with `Closes #ISSUE_NUMBER`.

For a beginner-friendly contribution, start with the pinned
[repository-link initiative](https://github.com/rohanmalhotracodes/GSoC-Organizations/issues/382).
Each organization has a separate `good first issue` with exact instructions and
acceptance criteria.

## Local setup

GSoC Organizations requires Node.js 20.11 or newer.

```sh
git clone git@github.com:YOUR_USERNAME/GSoC-Organizations.git
cd GSoC-Organizations
npm ci
npm run dev
```

The local website is available at the address printed by Astro, usually
`http://localhost:4321`.

## Finding an organization repository

Repository-link issues are intentionally scoped to one organization so they
can be completed as focused contributions.

### 1. Claim an issue

Open the pinned initiative, expand one of its four batch trackers, and choose an
unassigned organization. Comment on that issue before starting so contributors
do not duplicate work.

### 2. Verify the destination

Start from an official GSoC page, ideas page, contribution guide, or organization
website. Follow organization-controlled navigation to the source-code host.

Do not submit:

- a Google-search result;
- an unrelated contributor fork;
- a repository selected only because its name looks similar; or
- an inferred link without evidence from an official source.

Read [the repository curation policy](./docs/repository-curation.md) for the
complete verification rules.

### 3. Update the existing JSON entry

Edit only the organization's existing entry in
[`api/repository-links.json`](./api/repository-links.json). Do not create a
second key for the same organization.

```json
"Organization Name": {
  "repositories": [
    {
      "label": "Official repositories",
      "url": "https://github.com/example",
      "host": "GitHub",
      "verified": true,
      "lastChecked": "YYYY-MM-DD"
    }
  ],
  "organizationProfile": "https://github.com/example",
  "source": "manual"
}
```

Supported host values are `GitHub`, `GitLab`, `Codeberg`, `SourceHut`, and
`Self-hosted Git`. Use the actual UTC review date for `lastChecked`. Umbrella
organizations may require multiple repository entries.

### 4. Validate the change

```sh
npm run validate
node scripts/validate-repository-links.mjs --network
```

Open every changed link in a browser as well. Some legitimate hosts reject
automated `HEAD` requests; explain any host-specific network-check failure in
the pull request instead of silently ignoring it.

### 5. Open a focused pull request

Include:

- the organization issue number;
- the official page that proves the source-code destination belongs to the
  organization;
- a short description of what changed; and
- the validation commands you ran.

Do not include unrelated formatting, generated-data, or dependency changes.

## Other contributions

For interface, accessibility, data, or documentation changes:

1. Search existing issues before opening a new one.
2. Discuss large behavioral or design changes in an issue first.
3. Match the existing visual system and responsive behavior.
4. Add or update tests when behavior changes.
5. Run the relevant checks before opening a pull request.

Useful commands include:

```sh
npm run format:check
npm run validate
npm test
npm run build
```

Run `npm run test:e2e` when a change affects interactive browser behavior.

## Pull-request checklist

- [ ] The pull request addresses one issue or one clearly defined change.
- [ ] The issue is linked with `Closes #ISSUE_NUMBER` when appropriate.
- [ ] Only relevant files are changed.
- [ ] Data sources and externally supplied links are documented.
- [ ] Formatting, validation, and relevant tests pass.
- [ ] The change works on both desktop and mobile when it affects the interface.
- [ ] No secrets, tokens, private information, or unrelated generated files are
      committed.

## Licensing and contribution rights

This repository is source-available under its [proprietary license](./LICENSE),
not an open-source license. Contributing does not grant permission to reuse,
redistribute, or deploy the project outside the permissions stated in that
license.

Only submit work you have the right to contribute. By opening a pull request,
you confirm that the contribution is your own or that you have permission to
submit it, and that it may be incorporated into this project under the
project's existing license.

## Getting help

Ask a focused question on the issue you are working on. Include what you tried,
the result you expected, and any relevant error output. Maintainers and other
contributors can then help without duplicating investigation.
