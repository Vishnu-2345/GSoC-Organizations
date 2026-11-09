<p align="center">
  <a href="https://gsocorganizations.xyz">
    <img src="./public/brand/gsoc-organizations-logo-256.png" width="112" alt="GSoC Organizations logo">
  </a>
</p>

<h1 align="center">GSoC Organizations</h1>

<p align="center">
  A comprehensive directory of Google Summer of Code organizations across every archived program year.
</p>

<p align="center">
  <a href="https://gsocorganizations.xyz"><strong>Visit the website</strong></a>
  ·
  <a href="https://github.com/rohanmalhotracodes/GSoC-Organizations/issues">Report an issue</a>
</p>

![GSoC Organizations directory](./docs/images/directory.jpg)

## About

GSoC Organizations helps aspiring open-source contributors discover organizations, explore their participation history, and research completed Google Summer of Code projects.

The directory currently covers 519 organizations from the 2016–2026 GSoC archives.

## Features

- Search organizations, technologies, and topics.
- Filter by participation year, category, technology, and topic.
- Save organizations locally in the browser.
- View organization technologies, topics, repositories, and participation totals.
- Explore completed projects year by year.
- Open official GSoC project pages and code submissions.

## Organization profiles

Each organization has a profile containing its participation history, technology and topic tags, official links, and project totals.

![Organization profile and participation history](./docs/images/organization-profile.jpg)

## Historical projects

Select a participation year to browse its completed projects and open the corresponding GSoC project or code-submission page.

![Historical GSoC projects](./docs/images/historical-projects.jpg)

## Built with

- [Astro](https://astro.build/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## Data

The website is generated from version-controlled GSoC archive snapshots. Organization data and logos are prepared at build time, allowing the deployed site to remain static and fast.

## Releases and deployment

Approved pull requests are squash-merged after all required reviews, CI checks,
and the CLA check pass. Merges do not immediately change the live website.
Production is built from the latest `main` branch and deployed to Cloudflare
Pages every Sunday at 09:00 Asia/Kolkata.

See the [maintainer automation guide](./docs/maintainer-automation.md) for the
required repository settings, deployment secret, and manual-release process.

## Contributing

Contributions are welcome. Read the [contributing guide](./CONTRIBUTING.md) for
local setup, pull-request expectations, and the beginner-friendly workflow for
verifying missing organization repository links.

First-time contributors sign the [Contributor License Agreement](./CLA.md)
before their first merge. Contributors with five meaningful merged pull
requests may apply to the [collaborator program](./COLLABORATOR_PROGRAM.md)'s
moderation stage. This does not grant write access, which requires separate
Project Owner approval.

See the [changelog](./CHANGELOG.md) for release history.

## Disclaimer

This is an independent community project and is not affiliated with or endorsed by Google. Google Summer of Code is a Google program.

## License

Copyright © 2026 Rohan Malhotra.

This project uses the [GSoC Organizations Noncommercial Community Source License](./LICENSE). You may fork and modify the code only to prepare contributions for this repository. Commercial use, redistribution, independent deployment, and copied or substantially similar websites are prohibited without prior written permission.
