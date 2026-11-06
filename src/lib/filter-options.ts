export type FilterOption = { value: string; count: number };
export type FilterOptionSort = 'frequency' | 'name';

const normalize = (value: string) => value.trim().toLocaleLowerCase();

function relevance(value: string, query: string): number {
  if (value === query) return 0;
  if (value.startsWith(query)) return 1;
  if (value.split(/[^\p{L}\p{N}+#.]+/u).some((word) => word.startsWith(query)))
    return 2;
  if (value.includes(query)) return 3;
  return Number.POSITIVE_INFINITY;
}

export function filterAndSortOptions(
  options: FilterOption[],
  query: string,
  sortBy: FilterOptionSort,
): FilterOption[] {
  const normalizedQuery = normalize(query);

  return [...options]
    .filter(
      (option) =>
        !normalizedQuery ||
        Number.isFinite(relevance(normalize(option.value), normalizedQuery)),
    )
    .sort((a, b) => {
      if (normalizedQuery) {
        const rankDifference =
          relevance(normalize(a.value), normalizedQuery) -
          relevance(normalize(b.value), normalizedQuery);
        if (rankDifference) return rankDifference;
      }

      if (sortBy === 'name') return a.value.localeCompare(b.value);
      return b.count - a.count || a.value.localeCompare(b.value);
    });
}
