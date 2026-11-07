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
const forbiddenSearchHosts = new Set([
  'google.com',
  'www.google.com',
  'bing.com',
  'www.bing.com',
  'duckduckgo.com',
  'www.duckduckgo.com',
]);

for (const [organization, entry] of Object.entries(entries)) {
  if (!['manual', 'derived', 'unresolved'].includes(entry.source))
    errors.push(`${organization}: invalid source`);
  if (
    entry.source === 'unresolved' &&
    ((entry.repositories || []).length || entry.organizationProfile)
  )
    errors.push(`${organization}: unresolved entry contains a destination`);
  if (
    entry.source !== 'unresolved' &&
    !(entry.repositories || []).length &&
    !entry.organizationProfile
  )
    errors.push(`${organization}: resolved entry has no destination`);

  if (entry.organizationProfile) {
    try {
      const profile = new URL(entry.organizationProfile);
      if (!['http:', 'https:'].includes(profile.protocol))
        errors.push(`${organization}: unsupported profile URL protocol`);
      if (forbiddenSearchHosts.has(profile.hostname.toLocaleLowerCase()))
        errors.push(`${organization}: search URL used as repository profile`);
    } catch {
      errors.push(
        `${organization}: malformed profile URL ${entry.organizationProfile}`,
      );
    }
  }

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
    if (forbiddenSearchHosts.has(parsed.hostname.toLocaleLowerCase()))
      errors.push(`${organization}: search URL used as repository`);
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
