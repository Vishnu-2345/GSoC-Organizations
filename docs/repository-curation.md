# Repository curation workflow

Every organization must end in one of three states: manually verified repository records, derived repository records, or unresolved. Never upgrade a derived record to verified without manual evidence, and never substitute a web-search URL for a direct source destination.

## Schema

`api/repository-links.json` is keyed by the exact organization name:

```json
{
  "Organization Name": {
    "repositories": [
      {
        "label": "Main repository",
        "url": "https://github.com/example/project",
        "host": "GitHub",
        "verified": true,
        "lastChecked": "2026-11-05"
      }
    ],
    "organizationProfile": "https://github.com/example",
    "source": "manual"
  }
}
```

Supported host labels are `GitHub`, `GitLab`, `Codeberg`, `SourceHut`, and `Self-hosted Git`.

## Manual review procedure

1. Start with the organization’s official GSoC ideas URL, contribution guide, and website from the latest archive record.
2. Follow only organization-controlled navigation to a source-code host. Do not treat a generic web search result or an unrelated contributor fork as authoritative.
3. Confirm that the repository owner, project name, and linked website agree with the organization identity.
4. For umbrella organizations, record each actively referenced project repository or an official organization profile. Do not imply that one subproject represents the umbrella.
5. Normalize the destination to the repository or organization root. Remove tracking parameters, file anchors, `blob`/`tree` paths, and `.git` suffixes.
6. Record the host precisely. A self-hosted GitLab or Gitea instance is `Self-hosted Git`, not GitHub.
7. Set `source` to `manual`, `verified` to `true`, and `lastChecked` to the actual UTC review date.
8. Run the offline validator and the opt-in network validator.
9. Open each changed link in a normal browser and confirm the final destination. Some hosts block `HEAD` requests, so a successful browser check remains necessary.

## Derived links

The data compiler derives a candidate when an official archive URL already points to a recognizable source host. Derived records must keep:

```json
{
  "verified": false,
  "source": "derived"
}
```

A derived link is a direct source-host destination awaiting manual confirmation. The public button does not make a verification claim.

## Unresolved links

If no direct repository can be established, leave `repositories` empty, omit `organizationProfile`, and set `source` to `unresolved`. The profile page renders no repository action for that organization. The build writes these organizations to `api/unresolved-repositories.json` for manual review.

Manually reviewed records in `api/repository-links.json` are preserved by subsequent data builds when their `source` remains `manual`.

## Validation

Offline format and duplicate checks:

```sh
npm run validate
```

Redirect and reachability checks:

```sh
node scripts/validate-repository-links.mjs --network
```

The network mode intentionally fails on redirects, non-success HTTP responses, and timeouts so reviewers must inspect the result rather than silently accepting a changed target.

## Full-dataset review queue

Review in this order:

1. Current-year organizations in `api/unresolved-repositories.json`.
2. Current-year derived links in `api/derived-repositories-to-review.json`.
3. Current-year verified links whose `lastChecked` is older than 90 days.
4. Historical organizations, most recent participation first.
5. Entries sharing the same repository URL across different organization names; these may be legitimate renames or an identity-merge candidate.

Do not delete historical records solely because their website or repository is unavailable. Preserve the archive fact and downgrade the link state when evidence is no longer sufficient.
