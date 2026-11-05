import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawDirectory = path.join(root, 'data', 'raw');
const outputFile = path.join(root, 'src', 'data', 'organizations.json');
const repositoryFile = path.join(root, 'api', 'repository-links.json');

const files = fs
  .readdirSync(rawDirectory)
  .filter((file) => /^\d{4}\.json$/.test(file))
  .sort();

const canonicalTags = new Map([
  ['js', 'JavaScript'],
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['ts', 'TypeScript'],
  ['nodejs', 'Node.js'],
  ['node.js', 'Node.js'],
  ['reactjs', 'React'],
  ['react.js', 'React'],
  ['react', 'React'],
  ['postgres', 'PostgreSQL'],
  ['postgresql', 'PostgreSQL'],
  ['golang', 'Go'],
  ['go', 'Go'],
  ['c++', 'C++'],
  ['cpp', 'C++'],
  ['c', 'C'],
  ['c#', 'C#'],
  ['c sharp', 'C#'],
  ['html5', 'HTML'],
  ['html', 'HTML'],
  ['css3', 'CSS'],
  ['css', 'CSS'],
]);

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function plainText(value = '') {
  return clean(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTag(value) {
  const cleaned = clean(value).replace(/\s*\.\s*$/, '');
  const key = cleaned.toLocaleLowerCase();
  return canonicalTags.get(key) || cleaned;
}

function uniqueTags(values = []) {
  const byKey = new Map();
  for (const value of values) {
    const normalized = normalizeTag(value);
    if (normalized) byKey.set(normalized.toLocaleLowerCase(), normalized);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

function slugify(value) {
  return clean(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function safeUrl(value = '') {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? value : '';
  } catch {
    return '';
  }
}

function sourceHost(hostname) {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'github.com') return 'GitHub';
  if (host === 'gitlab.com') return 'GitLab';
  if (host === 'codeberg.org') return 'Codeberg';
  if (host === 'sr.ht' || host.endsWith('.sr.ht')) return 'SourceHut';
  return 'Self-hosted Git';
}

function repositoryFromUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = sourceHost(url.hostname);
    const knownHost = ['GitHub', 'GitLab', 'Codeberg', 'SourceHut'].includes(
      host,
    );
    const looksLikeGit =
      knownHost || /git|code|source|forge|invent|projects/i.test(url.hostname);
    if (!looksLikeGit) return null;

    const segments = url.pathname.split('/').filter(Boolean);
    if (!segments.length) return null;
    let repositoryUrl = `${url.protocol}//${url.host}/${segments.slice(0, 2).join('/')}`;
    if (host === 'SourceHut')
      repositoryUrl = `${url.protocol}//${url.host}/${segments.slice(0, 2).join('/')}`;
    if (segments.length === 1)
      repositoryUrl = `${url.protocol}//${url.host}/${segments[0]}`;

    return {
      label: segments.length > 1 ? 'Source repository' : 'Organization profile',
      url: repositoryUrl.replace(/\.git$/, ''),
      host,
      verified: false,
    };
  } catch {
    return null;
  }
}

const manualRepositories = {
  Metasploit: {
    repositories: [
      {
        label: 'Metasploit Framework',
        url: 'https://github.com/rapid7/metasploit-framework',
        host: 'GitHub',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://github.com/rapid7',
    source: 'manual',
  },
  Jenkins: {
    repositories: [
      {
        label: 'Jenkins core',
        url: 'https://github.com/jenkinsci/jenkins',
        host: 'GitHub',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://github.com/jenkinsci',
    source: 'manual',
  },
  'Godot Engine': {
    repositories: [
      {
        label: 'Godot Engine',
        url: 'https://github.com/godotengine/godot',
        host: 'GitHub',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://github.com/godotengine',
    source: 'manual',
  },
  OpenStreetMap: {
    repositories: [
      {
        label: 'OpenStreetMap website',
        url: 'https://github.com/openstreetmap/openstreetmap-website',
        host: 'GitHub',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://github.com/openstreetmap',
    source: 'manual',
  },
  'Blender Foundation': {
    repositories: [
      {
        label: 'Blender',
        url: 'https://projects.blender.org/blender/blender',
        host: 'Self-hosted Git',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://projects.blender.org/blender',
    source: 'manual',
  },
  'KDE Community': {
    repositories: [
      {
        label: 'KDE Invent repositories',
        url: 'https://invent.kde.org/',
        host: 'Self-hosted Git',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://invent.kde.org/',
    source: 'manual',
  },
  'Python Software Foundation': {
    repositories: [
      {
        label: 'CPython',
        url: 'https://github.com/python/cpython',
        host: 'GitHub',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://github.com/python',
    source: 'manual',
  },
  'CERN-HSF': {
    repositories: [
      {
        label: 'HEP Software Foundation repositories',
        url: 'https://github.com/HSF',
        host: 'GitHub',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://github.com/HSF',
    source: 'manual',
  },
  VideoLAN: {
    repositories: [
      {
        label: 'VLC media player',
        url: 'https://code.videolan.org/videolan/vlc',
        host: 'Self-hosted Git',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://code.videolan.org/videolan',
    source: 'manual',
  },
  Git: {
    repositories: [
      {
        label: 'Git',
        url: 'https://git.kernel.org/pub/scm/git/git.git',
        host: 'Self-hosted Git',
        verified: true,
        lastChecked: '2026-11-05',
      },
    ],
    organizationProfile: 'https://git.kernel.org/pub/scm/git/',
    source: 'manual',
  },
};

const organizationsByName = new Map();

for (const file of files) {
  const document = JSON.parse(
    fs.readFileSync(path.join(rawDirectory, file), 'utf8'),
  );
  const year = Number(document.year || path.basename(file, '.json'));
  for (const raw of document.organizations || []) {
    const name = clean(raw.name);
    if (!name) continue;
    // The archive contains punctuation-only name variants across years (for
    // example, a trailing period or trademark symbol). A stable slug is a
    // safer historical identity key than raw display-name casing.
    const key = slugify(name);
    const existing = organizationsByName.get(key) || {
      slug: slugify(name),
      name,
      logo: '',
      description: '',
      website: '',
      category: 'Other',
      ideasUrl: '',
      contributionGuide: '',
      communityLinks: [],
      technologies: [],
      topics: [],
      participations: [],
      repositoryCandidates: [],
    };

    existing.name = name;
    existing.logo = safeUrl(raw.image_url) || existing.logo;
    existing.description = plainText(raw.description) || existing.description;
    existing.website = safeUrl(raw.url) || existing.website;
    existing.category = clean(raw.category) || existing.category;
    existing.ideasUrl = safeUrl(raw.ideas_url) || existing.ideasUrl;
    existing.contributionGuide =
      safeUrl(raw.guide_url) || existing.contributionGuide;
    existing.technologies = uniqueTags([
      ...existing.technologies,
      ...(raw.technologies || []),
    ]);
    existing.topics = uniqueTags([...existing.topics, ...(raw.topics || [])]);
    existing.repositoryCandidates.push(raw.ideas_url, raw.guide_url, raw.url);

    const communityLinks = [
      ['Chat / community', raw.irc_channel],
      ['Mailing list', raw.mailing_list],
      ['Contact', raw.contact_email],
      ['Blog', raw.blog_url],
    ];
    for (const [label, value] of communityLinks) {
      const url = safeUrl(value);
      if (url && !existing.communityLinks.some((link) => link.url === url)) {
        existing.communityLinks.push({ label, url });
      }
    }

    const projects = (raw.projects || []).map((project) => {
      const searchable =
        `${project.title || ''} ${project.short_description || ''} ${project.description || ''}`.toLocaleLowerCase();
      const inferredTechnologies = existing.technologies.filter((tag) => {
        const normalized = tag.toLocaleLowerCase();
        return normalized.length > 1 && searchable.includes(normalized);
      });
      return {
        title: clean(project.title) || 'Untitled project',
        shortDescription: plainText(project.short_description),
        description: plainText(project.description),
        contributor: clean(project.student_name),
        codeUrl: safeUrl(project.code_url) || undefined,
        projectUrl: safeUrl(project.project_url) || undefined,
        inferredTechnologies,
      };
    });

    const priorIndex = existing.participations.findIndex(
      (item) => item.year === year,
    );
    const participation = {
      year,
      projectCount: Number(raw.num_projects) || projects.length,
      projects,
    };
    if (priorIndex >= 0) existing.participations[priorIndex] = participation;
    else existing.participations.push(participation);
    organizationsByName.set(key, existing);
  }
}

const repositoryLinks = {};
const organizations = [...organizationsByName.values()]
  .map((org) => {
    org.participations.sort((a, b) => b.year - a.year);
    const manual = manualRepositories[org.name];
    const derived = org.repositoryCandidates
      .map(repositoryFromUrl)
      .find(Boolean);
    const repository =
      manual ||
      (derived
        ? {
            repositories: [derived],
            organizationProfile:
              derived.label === 'Organization profile'
                ? derived.url
                : undefined,
            source: 'derived',
          }
        : {
            repositories: [],
            organizationProfile: `https://www.google.com/search?q=${encodeURIComponent(`${org.name} source code repository`)}`,
            source: 'search',
          });
    repositoryLinks[org.name] = repository;
    const years = org.participations.map((item) => item.year);
    const result = {
      slug: org.slug,
      name: org.name,
      logo: org.logo,
      description: org.description,
      website: org.website,
      category: org.category,
      ideasUrl: org.ideasUrl,
      contributionGuide: org.contributionGuide,
      communityLinks: org.communityLinks,
      technologies: org.technologies,
      topics: org.topics,
      years,
      latestYear: Math.max(...years),
      totalProjects: org.participations.reduce(
        (sum, item) => sum + item.projectCount,
        0,
      ),
      participationCount: years.length,
      participations: org.participations,
      repository,
    };
    return result;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(outputFile, `${JSON.stringify(organizations, null, 2)}\n`);
fs.writeFileSync(
  repositoryFile,
  `${JSON.stringify(repositoryLinks, null, 2)}\n`,
);
console.log(
  `Prepared ${organizations.length} organizations from ${files.length} annual datasets.`,
);
