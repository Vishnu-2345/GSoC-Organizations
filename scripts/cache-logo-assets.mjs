import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const organizationsFile = path.join(root, 'src', 'data', 'organizations.json');
const manifestFile = path.join(root, 'data', 'logo-assets.json');
const outputDirectory = path.join(root, 'public', 'organization-logos');
const concurrency = 12;

const organizations = JSON.parse(await fs.readFile(organizationsFile, 'utf8'));
let manifest = {};

try {
  manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await fs.mkdir(outputDirectory, { recursive: true });

function extensionFor(contentType, bytes) {
  const normalized = contentType.split(';')[0].trim().toLowerCase();
  if (normalized === 'image/png') return 'png';
  if (normalized === 'image/jpeg') return 'jpg';
  if (normalized === 'image/webp') return 'webp';
  if (normalized === 'image/gif') return 'gif';
  if (normalized === 'image/svg+xml') return 'svg';
  if (bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    return 'png';
  if (bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))) return 'jpg';
  if (
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return 'webp';
  throw new Error(`Unsupported logo content type: ${contentType || 'unknown'}`);
}

async function fileExists(file) {
  try {
    return (await fs.stat(file)).size > 0;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function cacheLogo(organization) {
  const existing = manifest[organization.slug];
  const source = organization.logo.startsWith('http')
    ? organization.logo
    : existing?.source;
  if (!source) return { status: 'missing' };

  if (existing?.source === source && existing?.path) {
    const existingFile = path.join(root, 'public', existing.path.slice(1));
    if (await fileExists(existingFile)) return { status: 'cached' };
  }

  const response = await fetch(source, {
    headers: { 'user-agent': 'GSoC-Organizations logo cache' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);

  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || '';
  const extension = extensionFor(contentType, bytes);
  const fileName = `${organization.slug}.${extension}`;
  const destination = path.join(outputDirectory, fileName);
  await fs.writeFile(destination, bytes);

  manifest[organization.slug] = {
    source,
    path: `/organization-logos/${fileName}`,
  };
  return { status: 'downloaded' };
}

let nextIndex = 0;
let downloaded = 0;
let cached = 0;
let missing = 0;
const failures = [];

async function worker() {
  while (nextIndex < organizations.length) {
    const organization = organizations[nextIndex++];
    try {
      const result = await cacheLogo(organization);
      if (result.status === 'downloaded') downloaded += 1;
      else if (result.status === 'cached') cached += 1;
      else missing += 1;
    } catch (error) {
      failures.push(`${organization.name}: ${error.message}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

manifest = Object.fromEntries(
  Object.entries(manifest).sort(([left], [right]) => left.localeCompare(right)),
);
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Logo cache: ${downloaded} downloaded, ${cached} already cached, ${missing} without a source.`,
);
if (failures.length) {
  console.error(`Failed to cache ${failures.length} logos:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
