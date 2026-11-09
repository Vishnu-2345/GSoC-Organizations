# Maintainer automation

## Pull-request auto-merge

The `Auto-merge approved pull requests` workflow enables a squash auto-merge
only after an approval from a repository member with `write`, `maintain`, or
`admin` permission. It pins the operation to the reviewed head commit so that a
later push cannot be merged under an older approval.

Complete this one-time GitHub configuration:

1. Open **Settings → General → Pull Requests** and enable **Allow auto-merge**.
2. Protect `main` with a branch protection rule or ruleset that requires:
   - a pull request before merging;
   - at least one approval;
   - dismissal of stale approvals after new commits;
   - the `Quality checks` and `CLA / signed` status checks.
3. Do not allow required checks or reviews to be bypassed by the automation.

GitHub then holds an approved pull request until every required check passes and
squash-merges it automatically. An approval by a contributor without maintainer
permissions does not enable auto-merge.

## Weekly production deployment

The Cloudflare Pages project is a Direct Upload project and has no Git provider,
so pushes and pull-request merges do not deploy automatically.

The `Weekly production deployment` workflow checks out the latest `main`,
validates the data, runs unit tests, builds all static pages, and deploys the
result every Sunday at 09:00 Asia/Kolkata. Maintainers can also run it manually
from the Actions tab when an urgent release is required.

Create a scoped Cloudflare API token with **Account → Cloudflare Pages → Edit**,
then add it at **GitHub Settings → Secrets and variables → Actions** as the
repository secret `CLOUDFLARE_API_TOKEN`. Never commit the token.

The token must belong to the Cloudflare account that owns the
`gsoc-organizations` Pages project. The account ID is not secret and is already
configured in the workflow.

If the secret is missing or invalid, the deployment fails without changing the
currently live production site.
