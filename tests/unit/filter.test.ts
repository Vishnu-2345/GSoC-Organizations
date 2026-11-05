import { describe, expect, it } from 'vitest';
import {
  defaultFilters,
  filterOrganizations,
  sortOrganizations,
} from '../../src/lib/filter';
import type { FilterState, OrganizationSummary } from '../../src/types';

const baseRepository = {
  repositories: [],
  source: 'search' as const,
  organizationProfile: 'https://example.com',
};
const organizations: OrganizationSummary[] = [
  {
    slug: 'alpha',
    name: 'Alpha',
    logo: '',
    description: 'Mapping tools',
    website: '',
    category: 'Infrastructure',
    ideasUrl: '',
    contributionGuide: '',
    technologies: ['TypeScript', 'React'],
    topics: ['Maps'],
    years: [2026, 2025],
    latestYear: 2026,
    totalProjects: 9,
    participationCount: 2,
    repository: baseRepository,
  },
  {
    slug: 'beta',
    name: 'Beta',
    logo: '',
    description: 'Machine learning research',
    website: '',
    category: 'Science',
    ideasUrl: '',
    contributionGuide: '',
    technologies: ['Python'],
    topics: ['Machine Learning'],
    years: [2024, 2023, 2022],
    latestYear: 2024,
    totalProjects: 14,
    participationCount: 3,
    repository: baseRepository,
  },
];

const filters = (overrides: Partial<FilterState> = {}): FilterState => ({
  ...defaultFilters,
  ...overrides,
});

describe('organization filtering', () => {
  it('searches across tags and descriptions', () => {
    expect(
      filterOrganizations(organizations, filters({ query: 'mapping' })).map(
        (org) => org.slug,
      ),
    ).toEqual(['alpha']);
    expect(
      filterOrganizations(organizations, filters({ query: 'python' })).map(
        (org) => org.slug,
      ),
    ).toEqual(['beta']);
    expect(
      filterOrganizations(
        organizations,
        filters({ query: 'machine python' }),
      ).map((org) => org.slug),
    ).toEqual(['beta']);
  });

  it('applies inclusion and exclusion filters together', () => {
    const result = filterOrganizations(
      organizations,
      filters({ excludeTechnologies: ['Python'] }),
    );
    expect(result.map((org) => org.slug)).toEqual(['alpha']);
  });

  it('matches every selected year and any selected tag', () => {
    expect(
      filterOrganizations(organizations, filters({ years: [2026, 2025] })).map(
        (org) => org.slug,
      ),
    ).toEqual(['alpha']);
    expect(
      filterOrganizations(organizations, filters({ years: [2026, 2024] })),
    ).toEqual([]);
    expect(
      filterOrganizations(
        organizations,
        filters({ technologies: ['React', 'Python'] }),
      ).map((org) => org.slug),
    ).toEqual(['alpha', 'beta']);
  });

  it('identifies organizations appearing for the first time this year', () => {
    const newcomer: OrganizationSummary = {
      ...organizations[0],
      slug: 'newcomer',
      name: 'Newcomer',
      years: [2026],
      latestYear: 2026,
      participationCount: 1,
    };
    expect(
      filterOrganizations(
        [...organizations, newcomer],
        filters({ firstTime: true }),
      ).map((org) => org.slug),
    ).toEqual(['newcomer']);
  });
});

describe('sorting', () => {
  it('sorts by projects and participation years', () => {
    expect(sortOrganizations(organizations, 'projects')[0].slug).toBe('beta');
    expect(sortOrganizations(organizations, 'years')[0].slug).toBe('beta');
    expect(sortOrganizations(organizations, 'recent')[0].slug).toBe('alpha');
  });
});
