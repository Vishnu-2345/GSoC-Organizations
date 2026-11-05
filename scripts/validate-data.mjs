import fs from 'node:fs';

const organizations = JSON.parse(
  fs.readFileSync('src/data/organizations.json', 'utf8'),
);
const errors = [];
const names = new Set();
const slugs = new Set();
const websites = new Map();

function websiteIdentity(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const host = url.hostname.replace(/^www\./, '').toLocaleLowerCase();
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    return `${host}${pathname}`;
  } catch {
    return '';
  }
}

function validUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}

for (const org of organizations) {
  const nameKey = org.name.trim().toLocaleLowerCase();
  if (!org.name || !org.slug || !org.description || !org.category)
    errors.push(`${org.name || '(unknown)'}: missing required field`);
  if (names.has(nameKey))
    errors.push(`${org.name}: duplicate organization name`);
  if (slugs.has(org.slug))
    errors.push(`${org.name}: duplicate slug ${org.slug}`);
  names.add(nameKey);
  slugs.add(org.slug);
  const websiteKey = websiteIdentity(org.website);
  if (websiteKey && websites.has(websiteKey)) {
    errors.push(
      `${org.name}: duplicate official website identity shared with ${websites.get(websiteKey)}`,
    );
  } else if (websiteKey) {
    websites.set(websiteKey, org.name);
  }

  const years = new Set();
  for (const participation of org.participations) {
    if (years.has(participation.year))
      errors.push(`${org.name}: duplicate year ${participation.year}`);
    years.add(participation.year);
  }

  for (const [label, tags] of [
    ['technology', org.technologies],
    ['topic', org.topics],
  ]) {
    const seen = new Set();
    for (const tag of tags) {
      const key = tag.trim().toLocaleLowerCase();
      if (seen.has(key))
        errors.push(`${org.name}: duplicate ${label} tag ${tag}`);
      if (tag !== tag.trim())
        errors.push(
          `${org.name}: untrimmed ${label} tag ${JSON.stringify(tag)}`,
        );
      seen.add(key);
    }
  }

  for (const [label, url] of [
    ['website', org.website],
    ['ideas', org.ideasUrl],
    ['guide', org.contributionGuide],
  ]) {
    if (!validUrl(url)) errors.push(`${org.name}: invalid ${label} URL ${url}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${organizations.length} organizations.`);
