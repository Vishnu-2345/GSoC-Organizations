import { describe, expect, it } from 'vitest';
import organizationsData from '../../src/data/organizations.json';
import {
  buildTaxonomyHubs,
  buildYearHubs,
  hubSlug,
  TAXONOMY_HUB_MIN_ORGANIZATIONS,
} from '../../src/lib/hubs';
import type { Organization } from '../../src/types';

const organizations = organizationsData as Organization[];

describe('hub generation', () => {
  it('normalizes punctuation-heavy technology names into stable slugs', () => {
    expect(hubSlug('C++')).toBe('cpp');
    expect(hubSlug('C#')).toBe('c-sharp');
    expect(hubSlug('.NET')).toBe('dotnet');
    expect(hubSlug('F#')).toBe('f-sharp');
    expect(hubSlug('Node.js')).toBe('node-js');
  });

  it('merges label variants and excludes thin taxonomy pages', () => {
    const technologyHubs = buildTaxonomyHubs(organizations, 'technology');
    const topicHubs = buildTaxonomyHubs(organizations, 'topic');

    expect(new Set(technologyHubs.map((hub) => hub.slug)).size).toBe(
      technologyHubs.length,
    );
    expect(new Set(topicHubs.map((hub) => hub.slug)).size).toBe(
      topicHubs.length,
    );
    expect(
      [...technologyHubs, ...topicHubs].every(
        (hub) => hub.organizationCount >= TAXONOMY_HUB_MIN_ORGANIZATIONS,
      ),
    ).toBe(true);
    expect(technologyHubs.find((hub) => hub.slug === 'cpp')?.label).toBe('C++');
  });

  it('builds one year hub per archived program year', () => {
    const yearHubs = buildYearHubs(organizations);

    expect(yearHubs.map((hub) => hub.year)).toEqual([
      2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016,
    ]);
    expect(yearHubs[0].organizationCount).toBe(183);
  });
});
