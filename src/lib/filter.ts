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

export function filterOrganizations(
  organizations: OrganizationSummary[],
  state: FilterState,
): OrganizationSummary[] {
  const query = normalized(state.query);
  const queryTerms = query.split(/\s+/).filter(Boolean);
  const latestProgramYear = Math.max(
    0,
    ...organizations.map((organization) => organization.latestYear),
  );
  return organizations.filter((organization) => {
    const searchable = [
      organization.name,
      organization.description,
      organization.category,
      ...organization.technologies,
      ...organization.topics,
      ...organization.repository.repositories.flatMap((repository) => [
        repository.label,
        repository.host,
        repository.url,
      ]),
    ]
      .join(' ')
      .toLocaleLowerCase();

    if (
      queryTerms.some(
        (term) =>
          !searchable.includes(term) &&
          !approximatelyMatchesName(organization.name, term),
      )
    )
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
): OrganizationSummary[] {
  return [...organizations].sort((a, b) => {
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
