import type { FilterState, OrganizationSummary } from '../types';

export const defaultFilters: FilterState = {
  query: '',
  firstTime: false,
  years: [],
  categories: [],
  technologies: [],
  topics: [],
  excludeTechnologies: [],
  excludeTopics: [],
  sort: 'recent',
};

const normalized = (value: string) => value.trim().toLocaleLowerCase();
const words = (value: string) =>
  normalized(value)
    .split(/[^\p{L}\p{N}+#.]+/u)
    .filter(Boolean);

function fieldScore(
  value: string,
  term: string,
  baseScore: number,
  allowContains = true,
): number {
  const field = normalized(value);
  if (!field) return Number.POSITIVE_INFINITY;
  if (field === term) return baseScore;
  if (field.startsWith(term)) return baseScore + 1;

  const fieldWords = words(field);
  if (fieldWords.some((word) => word === term)) return baseScore + 1;
  if (fieldWords.some((word) => word.startsWith(term))) return baseScore + 2;
  if (allowContains && term.length >= 3 && field.includes(term))
    return baseScore + 3;
  return Number.POSITIVE_INFINITY;
}

function editDistance(source: string, target: string): number {
  const rows = Array.from({ length: source.length + 1 }, (_, index) => [index]);

  for (let column = 1; column <= target.length; column += 1) {
    rows[0][column] = column;
  }

  for (let row = 1; row <= source.length; row += 1) {
    for (let column = 1; column <= target.length; column += 1) {
      const substitutionCost = source[row - 1] === target[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + substitutionCost,
      );

      if (
        row > 1 &&
        column > 1 &&
        source[row - 1] === target[column - 2] &&
        source[row - 2] === target[column - 1]
      ) {
        rows[row][column] = Math.min(
          rows[row][column],
          rows[row - 2][column - 2] + 1,
        );
      }
    }
  }

  return rows[source.length][target.length];
}

function approximatelyMatchesName(name: string, term: string): boolean {
  if (term.length < 4) return false;

  const maximumDistance = term.length >= 8 ? 2 : 1;
  const nameWords = normalized(name).split(/[^\p{L}\p{N}+#.]+/u);

  return nameWords.some(
    (word) =>
      Math.abs(word.length - term.length) <= maximumDistance &&
      editDistance(word, term) <= maximumDistance,
  );
}

function termSearchScore(
  organization: OrganizationSummary,
  term: string,
): number {
  const nameScore = fieldScore(organization.name, term, 0);
  const fuzzyNameScore = approximatelyMatchesName(organization.name, term)
    ? 4
    : Number.POSITIVE_INFINITY;
  const taxonomyScore = Math.min(
    fieldScore(organization.category, term, 10),
    ...organization.technologies.map((value) => fieldScore(value, term, 10)),
    ...organization.topics.map((value) => fieldScore(value, term, 10)),
  );

  // Two-letter fragments are useful for names and tags (for example, "br"
  // for BRL-CAD), but are far too broad for prose and URLs.
  const descriptionScore =
    term.length >= 3
      ? fieldScore(organization.description, term, 20, term.length >= 4)
      : Number.POSITIVE_INFINITY;
  const repositoryScore =
    term.length >= 3
      ? Math.min(
          ...organization.repository.repositories.flatMap((repository) => [
            fieldScore(repository.label, term, 30),
            fieldScore(repository.host, term, 30),
          ]),
        )
      : Number.POSITIVE_INFINITY;

  return Math.min(
    nameScore,
    fuzzyNameScore,
    taxonomyScore,
    descriptionScore,
    repositoryScore,
  );
}

export function organizationSearchScore(
  organization: OrganizationSummary,
  query: string,
): number {
  const queryTerms = words(query);
  if (!queryTerms.length) return 0;

  let total = 0;
  for (const term of queryTerms) {
    const score = termSearchScore(organization, term);
    if (!Number.isFinite(score)) return Number.POSITIVE_INFINITY;
    total += score;
  }
  return total;
}

export function filterOrganizations(
  organizations: OrganizationSummary[],
  state: FilterState,
): OrganizationSummary[] {
  const query = normalized(state.query);
  const latestProgramYear = Math.max(
    0,
    ...organizations.map((organization) => organization.latestYear),
  );
  return organizations.filter((organization) => {
    if (query && !Number.isFinite(organizationSearchScore(organization, query)))
      return false;
    if (
      state.firstTime &&
      !(
        organization.participationCount === 1 &&
        organization.latestYear === latestProgramYear
      )
    )
      return false;
    if (
      state.years.length &&
      !state.years.every((year) => organization.years.includes(year))
    )
      return false;
    if (
      state.categories.length &&
      !state.categories.includes(organization.category)
    )
      return false;
    if (
      state.technologies.length &&
      !state.technologies.some((tag) => organization.technologies.includes(tag))
    )
      return false;
    if (
      state.topics.length &&
      !state.topics.some((tag) => organization.topics.includes(tag))
    )
      return false;
    if (
      state.excludeTechnologies.some((tag) =>
        organization.technologies.includes(tag),
      )
    )
      return false;
    if (state.excludeTopics.some((tag) => organization.topics.includes(tag)))
      return false;
    return true;
  });
}

export function sortOrganizations(
  organizations: OrganizationSummary[],
  sort: FilterState['sort'],
  query = '',
): OrganizationSummary[] {
  const scores = new Map(
    organizations.map((organization) => [
      organization,
      organizationSearchScore(organization, query),
    ]),
  );

  return [...organizations].sort((a, b) => {
    if (normalized(query)) {
      const relevanceDifference = scores.get(a)! - scores.get(b)!;
      if (relevanceDifference) return relevanceDifference;
    }
    if (sort === 'projects')
      return b.totalProjects - a.totalProjects || a.name.localeCompare(b.name);
    if (sort === 'years')
      return (
        b.participationCount - a.participationCount ||
        a.name.localeCompare(b.name)
      );
    if (sort === 'name') return a.name.localeCompare(b.name);
    return (
      b.latestYear - a.latestYear ||
      b.totalProjects - a.totalProjects ||
      a.name.localeCompare(b.name)
    );
  });
}

export function activeFilterCount(state: FilterState): number {
  return (
    (state.query ? 1 : 0) +
    (state.firstTime ? 1 : 0) +
    state.years.length +
    state.categories.length +
    state.technologies.length +
    state.topics.length +
    state.excludeTechnologies.length +
    state.excludeTopics.length
  );
}
