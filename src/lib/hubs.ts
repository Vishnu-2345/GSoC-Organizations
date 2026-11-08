import type { Organization } from '../types';

export const TAXONOMY_HUB_MIN_ORGANIZATIONS = 3;

export type TaxonomyHubKind = 'technology' | 'topic' | 'category';

export type TaxonomyHub = {
  kind: TaxonomyHubKind;
  label: string;
  slug: string;
  organizations: Organization[];
  organizationCount: number;
  totalProjects: number;
  years: number[];
};

export type YearHub = {
  year: number;
  organizations: Organization[];
  organizationCount: number;
  projectCount: number;
};

const SPECIAL_SLUG_LABELS: Record<string, string> = {
  cpp: 'C++',
  'c-sharp': 'C#',
  dotnet: '.NET',
  'f-sharp': 'F#',
};

const fieldForKind = {
  technology: 'technologies',
  topic: 'topics',
  category: 'category',
} as const;

export const hubSlug = (value: string) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/\.net/g, ' dotnet ')
    .replace(/c\+\+/g, ' cpp ')
    .replace(/c#/g, ' c sharp ')
    .replace(/f#/g, ' f sharp ')
    .replace(/\+\+/g, ' plus plus ')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const sortedOrganizations = (organizations: Organization[]) =>
  [...organizations].sort(
    (left, right) =>
      right.latestYear - left.latestYear ||
      right.totalProjects - left.totalProjects ||
      left.name.localeCompare(right.name),
  );

const preferredLabel = (slug: string, labels: Map<string, number>) => {
  if (SPECIAL_SLUG_LABELS[slug]) return SPECIAL_SLUG_LABELS[slug];
  return [...labels.entries()].sort(
    ([leftLabel, leftCount], [rightLabel, rightCount]) =>
      rightCount - leftCount ||
      leftLabel.length - rightLabel.length ||
      leftLabel.localeCompare(rightLabel),
  )[0][0];
};

export function buildTaxonomyHubs(
  organizations: Organization[],
  kind: TaxonomyHubKind,
  minimumOrganizations = kind === 'category'
    ? 1
    : TAXONOMY_HUB_MIN_ORGANIZATIONS,
) {
  const groups = new Map<
    string,
    {
      labels: Map<string, number>;
      organizations: Map<string, Organization>;
    }
  >();
  const field = fieldForKind[kind];

  for (const organization of organizations) {
    const values =
      field === 'category' ? [organization.category] : organization[field];

    for (const label of values) {
      const slug = hubSlug(label);
      if (!slug) continue;
      const group = groups.get(slug) ?? {
        labels: new Map<string, number>(),
        organizations: new Map<string, Organization>(),
      };
      group.labels.set(label, (group.labels.get(label) ?? 0) + 1);
      group.organizations.set(organization.slug, organization);
      groups.set(slug, group);
    }
  }

  return [...groups.entries()]
    .map(([slug, group]): TaxonomyHub => {
      const hubOrganizations = sortedOrganizations([
        ...group.organizations.values(),
      ]);
      return {
        kind,
        label: preferredLabel(slug, group.labels),
        slug,
        organizations: hubOrganizations,
        organizationCount: hubOrganizations.length,
        totalProjects: hubOrganizations.reduce(
          (sum, organization) => sum + organization.totalProjects,
          0,
        ),
        years: [
          ...new Set(
            hubOrganizations.flatMap((organization) => organization.years),
          ),
        ].sort((left, right) => right - left),
      };
    })
    .filter((hub) => hub.organizationCount >= minimumOrganizations)
    .sort(
      (left, right) =>
        right.organizationCount - left.organizationCount ||
        left.label.localeCompare(right.label),
    );
}

export function buildYearHubs(organizations: Organization[]) {
  const years = [
    ...new Set(organizations.flatMap((organization) => organization.years)),
  ].sort((left, right) => right - left);

  return years.map((year): YearHub => {
    const yearOrganizations = sortedOrganizations(
      organizations.filter((organization) => organization.years.includes(year)),
    );
    return {
      year,
      organizations: yearOrganizations,
      organizationCount: yearOrganizations.length,
      projectCount: yearOrganizations.reduce(
        (sum, organization) =>
          sum +
          (organization.participations.find(
            (participation) => participation.year === year,
          )?.projectCount ?? 0),
        0,
      ),
    };
  });
}

export function buildFirstTimeHub(organizations: Organization[]) {
  const latestYear = Math.max(
    ...organizations.flatMap((organization) => organization.years),
  );
  const firstTimeOrganizations = sortedOrganizations(
    organizations.filter(
      (organization) =>
        organization.latestYear === latestYear &&
        organization.participationCount === 1,
    ),
  );

  return {
    year: latestYear,
    organizations: firstTimeOrganizations,
    organizationCount: firstTimeOrganizations.length,
    projectCount: firstTimeOrganizations.reduce(
      (sum, organization) => sum + organization.totalProjects,
      0,
    ),
  };
}

export function relatedTaxonomyHubs(
  current: TaxonomyHub,
  hubs: TaxonomyHub[],
  limit = 6,
) {
  const currentOrganizations = new Set(
    current.organizations.map((organization) => organization.slug),
  );

  return hubs
    .filter((hub) => hub.slug !== current.slug)
    .map((hub) => ({
      hub,
      overlap: hub.organizations.filter((organization) =>
        currentOrganizations.has(organization.slug),
      ).length,
    }))
    .filter(({ overlap }) => overlap > 0 || current.kind === 'category')
    .sort(
      (left, right) =>
        right.overlap - left.overlap ||
        right.hub.organizationCount - left.hub.organizationCount ||
        left.hub.label.localeCompare(right.hub.label),
    )
    .slice(0, limit)
    .map(({ hub }) => hub);
}
