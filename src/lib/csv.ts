import type { OrganizationSummary } from '../types';

const cell = (value: unknown) =>
  `"${String(value ?? '').replaceAll('"', '""')}"`;

export function organizationsToCsv(
  organizations: OrganizationSummary[],
): string {
  const rows = [
    [
      'Name',
      'Category',
      'Description',
      'Years',
      'Technologies',
      'Topics',
      'Projects',
      'Website',
      'Repository',
    ],
    ...organizations.map((organization) => [
      organization.name,
      organization.category,
      organization.description,
      organization.years.join('; '),
      organization.technologies.join('; '),
      organization.topics.join('; '),
      organization.totalProjects,
      organization.website,
      organization.repository.repositories[0]?.url ||
        organization.repository.organizationProfile ||
        '',
    ]),
  ];
  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

export function downloadCsv(organizations: OrganizationSummary[]): void {
  const blob = new Blob([organizationsToCsv(organizations)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gsoc-organizations.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
