import { defaultFilters } from './filter';
import type { FilterState, SortKey } from '../types';

const validSorts = new Set<SortKey>(['recent', 'projects', 'years', 'name']);

function list(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseFilterState(search: string): FilterState {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  );
  let legacy: Record<string, unknown> = {};
  const legacyValue = params.get('filters');
  if (legacyValue) {
    try {
      const parsed = JSON.parse(legacyValue);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        legacy = parsed;
    } catch {
      // Malformed or outdated links are intentionally ignored.
    }
  }

  const legacyList = (key: string) =>
    Array.isArray(legacy[key])
      ? (legacy[key] as unknown[]).filter(
          (item): item is string => typeof item === 'string',
        )
      : [];
  const years = [...list(params, 'year'), ...legacyList('years')]
    .map(Number)
    .filter((year) => Number.isInteger(year) && year >= 2005 && year <= 2100);
  const sortValue = params.get('sort');

  return {
    query:
      params.get('q')?.slice(0, 200) ||
      (typeof legacy.query === 'string' ? legacy.query.slice(0, 200) : ''),
    firstTime:
      params.get('firstTime') === '1' ||
      legacyList('shortcuts').includes('First-time organizations'),
    years: [...new Set(years)],
    categories: [
      ...new Set([...list(params, 'category'), ...legacyList('categories')]),
    ],
    technologies: [
      ...new Set([
        ...list(params, 'technology'),
        ...legacyList('technologies'),
      ]),
    ],
    topics: [...new Set([...list(params, 'topic'), ...legacyList('topics')])],
    sort:
      sortValue && validSorts.has(sortValue as SortKey)
        ? (sortValue as SortKey)
        : defaultFilters.sort,
  };
}

export function serializeFilterState(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.firstTime) params.set('firstTime', '1');
  for (const year of state.years) params.append('year', String(year));
  for (const category of state.categories) params.append('category', category);
  for (const technology of state.technologies)
    params.append('technology', technology);
  for (const topic of state.topics) params.append('topic', topic);
  if (state.sort !== defaultFilters.sort) params.set('sort', state.sort);
  const value = params.toString();
  return value ? `?${value}` : '';
}
