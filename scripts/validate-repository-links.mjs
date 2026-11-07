import fs from 'node:fs';

const entries = JSON.parse(
  fs.readFileSync('api/repository-links.json', 'utf8'),
);
const errors = [];
const seen = new Map();
const supportedHosts = new Set([
  'GitHub',
  'GitLab',
  'Codeberg',
  'SourceHut',
  'Self-hosted Git',
]);
const network = process.argv.includes('--network');

for (const [organization, entry] of Object.entries(entries)) {
  if (!['manual', 'derived', 'search'].includes(entry.source))
    errors.push(`${organization}: invalid source`);
  for (const repository of entry.repositories || []) {
    let parsed;
    try {
      parsed = new URL(repository.url);
    } catch {
      errors.push(`${organization}: malformed URL ${repository.url}`);
      continue;
    }
    if (!['http:', 'https:'].includes(parsed.protocol))
      errors.push(`${organization}: unsupported URL protocol`);
    if (!supportedHosts.has(repository.host))
      errors.push(`${organization}: unsupported host label ${repository.host}`);
    if (entry.source !== 'manual' && repository.verified)
      errors.push(`${organization}: derived link marked verified`);
    const key = repository.url.replace(/\/$/, '').toLocaleLowerCase();
    if (seen.has(key) && seen.get(key) !== organization)
      console.warn(
        `Shared repository: ${organization} and ${seen.get(key)} -> ${repository.url}`,
      );
    seen.set(key, organization);

    if (network) {
      try {
        const response = await fetch(repository.url, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(10000),
        });
        if (response.status >= 300 && response.status < 400)
          errors.push(
            `${organization}: redirected ${repository.url} -> ${response.headers.get('location')}`,
          );
        else if (!response.ok)
          errors.push(
            `${organization}: broken (${response.status}) ${repository.url}`,
          );
      } catch (error) {
        errors.push(
          `${organization}: unreachable ${repository.url} (${error.message})`,
        );
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  `Validated repository entries for ${Object.keys(entries).length} organizations${network ? ' with network checks' : ''}.`,
);
