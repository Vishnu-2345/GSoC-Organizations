import { describe, expect, it } from 'vitest';
import { filterOrganizations, sortOrganizations } from '../../src/lib/filter';
import type { OrganizationSummary } from '../../src/types';

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

describe('organization filtering', () => {
  it('searches across tags and descriptions', () => {
    expect(
      filterOrganizations(organizations, {
        query: 'mapping',
        years: [],
        categories: [],
        technologies: [],
        topics: [],
        excludeTechnologies: [],
        excludeTopics: [],
        sort: 'recent',
      }).map((org) => org.slug),
    ).toEqual(['alpha']);
    expect(
      filterOrganizations(organizations, {
        query: 'python',
        years: [],
        categories: [],
        technologies: [],
        topics: [],
        excludeTechnologies: [],
        excludeTopics: [],
        sort: 'recent',
      }).map((org) => org.slug),
    ).toEqual(['beta']);
  });

  it('applies inclusion and exclusion filters together', () => {
    const result = filterOrganizations(organizations, {
      query: '',
      years: [],
      categories: [],
      technologies: [],
      topics: [],
      excludeTechnologies: ['Python'],
      excludeTopics: [],
      sort: 'recent',
    });
    expect(result.map((org) => org.slug)).toEqual(['alpha']);
  });
});

describe('sorting', () => {
  it('sorts by projects and participation years', () => {
    expect(sortOrganizations(organizations, 'projects')[0].slug).toBe('beta');
    expect(sortOrganizations(organizations, 'years')[0].slug).toBe('beta');
    expect(sortOrganizations(organizations, 'recent')[0].slug).toBe('alpha');
  });
});
