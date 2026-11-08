import fs from 'node:fs/promises';
import path from 'node:path';

const year = Number.parseInt(process.argv[2] || '', 10);

if (!Number.isInteger(year)) {
  console.error('Usage: node scripts/refresh-project-code-urls.mjs <year>');
  process.exit(1);
}

const sourcePath = path.resolve(`data/raw/${year}.json`);
const sourceText = await fs.readFile(sourcePath, 'utf8');
const source = JSON.parse(sourceText);
const projects = source.organizations.flatMap((organization) =>
  organization.projects.map((project) => ({
    organization: organization.name,
    project,
  })),
);

const pending = projects.filter(({ project }) => {
  return !project.code_url && project.project_url;
});

const projectIdFromUrl = (value) => {
  try {
    return new URL(value).pathname.split('/').filter(Boolean).at(-1);
  } catch {
    return null;
  }
};

const fetchProject = async (projectId, attempt = 1) => {
  const response = await fetch(
    `https://summerofcode.withgoogle.com/api/archive/projects/${projectId}/`,
    { signal: AbortSignal.timeout(20_000) },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      return fetchProject(projectId, attempt + 1);
    }
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
};

let nextIndex = 0;
let updated = 0;
let unavailable = 0;
const failures = [];
const updates = new Map();

const worker = async () => {
  while (nextIndex < pending.length) {
    const currentIndex = nextIndex;
    nextIndex += 1;
    const { organization, project } = pending[currentIndex];
    const projectId = projectIdFromUrl(project.project_url);

    if (!projectId) {
      failures.push(`${organization}: ${project.title} (invalid project URL)`);
      continue;
    }

    try {
      const officialProject = await fetchProject(projectId);
      const codeUrl = officialProject?.project_code_url;
      if (typeof codeUrl === 'string' && /^https?:\/\//i.test(codeUrl)) {
        updates.set(projectId, codeUrl);
        updated += 1;
      } else {
        unavailable += 1;
      }
    } catch (error) {
      failures.push(
        `${organization}: ${project.title} (${error instanceof Error ? error.message : String(error)})`,
      );
    }
  }
};

await Promise.all(Array.from({ length: 8 }, () => worker()));

const replacements = [...updates].map(([projectId, codeUrl]) => {
  const projectUrl = `"project_url": "https://summerofcode.withgoogle.com/programs/${year}/projects/${projectId}"`;
  const projectUrlIndex = sourceText.indexOf(projectUrl);
  const codeValue = '"code_url": null';
  const codeValueIndex = sourceText.lastIndexOf(codeValue, projectUrlIndex);

  if (projectUrlIndex === -1 || codeValueIndex === -1) {
    throw new Error(`Could not locate ${projectId} in ${sourcePath}`);
  }

  return {
    start: codeValueIndex + '"code_url": '.length,
    end: codeValueIndex + codeValue.length,
    value: JSON.stringify(codeUrl),
  };
});

let output = sourceText;
replacements
  .sort((left, right) => right.start - left.start)
  .forEach(({ start, end, value }) => {
    output = `${output.slice(0, start)}${value}${output.slice(end)}`;
  });

await fs.writeFile(sourcePath, output);

console.log(
  `Checked ${pending.length} ${year} projects, added ${updated} code-submission links, and found ${unavailable} without a published link.`,
);

if (failures.length) {
  console.error(`Failed to refresh ${failures.length} projects:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
