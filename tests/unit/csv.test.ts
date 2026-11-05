import { describe, expect, it } from 'vitest';
import { organizationsToCsv } from '../../src/lib/csv';
import type { OrganizationSummary } from '../../src/types';

describe('CSV export', () => {
  it('escapes commas and quotes', () => {
    const organization = {
      slug: 'example',
      name: 'Example, Inc.',
      logo: '',
      description: 'Builds "useful" software',
      website: '',
      category: 'Other',
      ideasUrl: '',
      contributionGuide: '',
      technologies: [],
      topics: [],
      years: [2026],
      latestYear: 2026,
      totalProjects: 1,
      participationCount: 1,
      repository: { repositories: [], source: 'search' },
    } as OrganizationSummary;
    const csv = organizationsToCsv([organization]);
    expect(csv).toContain('"Example, Inc."');
    expect(csv).toContain('"Builds ""useful"" software"');
  });
});
