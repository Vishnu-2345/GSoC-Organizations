# Collaborator program

The collaborator program recognizes contributors who consistently improve GSoC
Organizations and help other people contribute successfully.

## Eligibility

You may apply after at least five meaningful pull requests have been merged.
Meeting the number is the start of the review, not an automatic entitlement to
repository access. Documentation-only typo fixes, automated dependency updates,
or deliberately split changes may be considered together when eligibility is
assessed.

Maintainers consider:

- correctness and care across the applicant’s merged work;
- respectful, useful communication with contributors;
- consistent use of project validation and source-verification rules;
- ability to review work outside the applicant’s own pull requests;
- reliability over time; and
- the project’s current maintenance needs.

## Applying

Use the **Collaborator application** issue form. Link at least five merged pull
requests, describe the area you want to maintain, and include examples of issue
triage, review, or contributor support.

The Project Owner may ask follow-up questions, request a trial period, defer the
application, or decline it. Decisions consider the complete contribution record
and are not based only on a count.

## Access stages

### Stage 1: moderation collaborator

An accepted applicant begins in the moderation stage. This stage is intended to
use GitHub's **Triage** role, which can manage issues and pull requests without
permission to push or merge code.

Moderation collaborators may:

- review pull requests and leave actionable feedback;
- label, assign, and organize issues and pull requests;
- close or reopen work that is clearly spam, duplicated, abandoned, malicious,
  outside the project scope, or in violation of the assignment policy; and
- help contributors understand automated checks and project guidelines.

Every closure must include a clear reason. Uncertain or disputed cases must be
escalated to the Project Owner instead of being closed. A pull request must not
be closed merely because it has fixable CI failures, needs revision, or takes a
different reasonable approach.

Moderation collaborators cannot push to the repository, merge pull requests,
approve required reviews, change workflows or repository settings, bypass
automated checks, or grant access to anyone else.

### Stage 2: write access

Write access is separate from the collaborator application. A moderation
collaborator may request it after demonstrating sound technical judgment,
reliable reviews, careful moderation, and consistent compliance with project
policy. There is no automatic contribution count or period that grants write
access.

The Project Owner must approve write access explicitly. Approval may be
deferred or declined based on project needs, security considerations, review
quality, or readiness. Branch protection, independent review, CLA checks, and
CI requirements continue to apply after write access is granted.

## Responsibilities

Collaborators are expected to:

- review sources and repository destinations rather than approving guesses;
- keep automated checks passing and never bypass the CLA requirement;
- give specific, respectful, and actionable review feedback;
- label and triage issues without closing valid work prematurely;
- protect credentials and private maintainer information;
- avoid merging their own changes without independent review when another
  maintainer is available; and
- disclose conflicts of interest.

## Access and review

This repository is currently owned by a personal GitHub account. GitHub gives a
personal repository’s collaborators write access rather than a narrower triage
role. Therefore, approval for the moderation stage does **not** currently result
in direct repository collaborator access. The Project Owner will perform the
requested moderation action until the repository is transferred to a GitHub
organization where the Triage role can be assigned safely.

No applicant will receive broad write access merely to enable issue or
pull-request moderation. If the repository moves to an organization, accepted
moderation collaborators may receive the Triage role; write access will still
require the separate approval described above.

Collaborator access may be reviewed or removed after inactivity, repeated
quality problems, policy violations, unsafe handling of access, or conduct that
harms contributors or the project. Whenever practical, maintainers will explain
the concern and provide a reasonable opportunity to correct it first.
