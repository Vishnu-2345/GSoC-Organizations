import { useEffect, useMemo, useState } from 'react';
import {
  activeFilterCount,
  defaultFilters,
  filterOrganizations,
  sortOrganizations,
} from '../lib/filter';
import { parseFilterState, serializeFilterState } from '../lib/url-state';
import type { FilterState, OrganizationSummary } from '../types';
import FilterSidebar from './FilterSidebar';
import OrganizationCard from './OrganizationCard';

const BOOKMARKS_KEY = 'gsoc-explorer-bookmarks-v1';

function counts(values: string[][]) {
  const result = new Map<string, number>();
  for (const items of values)
    for (const item of items) result.set(item, (result.get(item) || 0) + 1);
  return [...result.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export default function Explorer({
  organizations,
  shortlistOnly = false,
}: {
  organizations: OrganizationSummary[];
  shortlistOnly?: boolean;
}) {
  const [state, setState] = useState<FilterState>(defaultFilters);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(48);

  useEffect(() => {
    setState(parseFilterState(window.location.search));
    try {
      const stored = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
      if (Array.isArray(stored))
        setBookmarks(
          stored.filter((value): value is string => typeof value === 'string'),
        );
    } catch {
      localStorage.removeItem(BOOKMARKS_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const nextUrl = `${window.location.pathname}${serializeFilterState(state)}`;
    window.history.replaceState(null, '', nextUrl);
  }, [state, ready]);

  useEffect(() => {
    setVisibleLimit(48);
  }, [state, shortlistOnly]);

  const options = useMemo(() => {
    const yearCounts = new Map<number, number>();
    for (const organization of organizations) {
      for (const year of organization.years)
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
    }
    return {
      years: [...yearCounts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.value - a.value),
      categories: counts(
        organizations.map((organization) => [organization.category]),
      ),
      technologies: counts(
        organizations.map((organization) => organization.technologies),
      ),
      topics: counts(organizations.map((organization) => organization.topics)),
    };
  }, [organizations]);

  const results = useMemo(() => {
    const available = shortlistOnly
      ? organizations.filter((organization) =>
          bookmarks.includes(organization.slug),
        )
      : organizations;
    return sortOrganizations(filterOrganizations(available, state), state.sort);
  }, [organizations, bookmarks, shortlistOnly, state]);

  function toggleBookmark(slug: string) {
    const next = bookmarks.includes(slug)
      ? bookmarks.filter((value) => value !== slug)
      : [...bookmarks, slug];
    setBookmarks(next);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  }

  const filterCount = activeFilterCount(state);

  return (
    <div
      className="explorer-shell"
      data-testid="explorer"
      data-ready={ready ? 'true' : 'false'}
    >
      <div className="explorer-layout">
        <aside className="desktop-filters" aria-label="Organization filters">
          <FilterSidebar state={state} options={options} onChange={setState} />
        </aside>

        {filtersOpen && (
          <div
            className="filter-drawer-backdrop"
            role="presentation"
            onMouseDown={() => setFiltersOpen(false)}
          >
            <aside
              className="filter-drawer"
              aria-label="Organization filters"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <FilterSidebar
                state={state}
                options={options}
                onChange={setState}
                onClose={() => setFiltersOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="results-column" id="results">
          <div className="directory-header">
            <div className="directory-title">
              <span className="eyebrow">
                {shortlistOnly ? 'Saved in this browser' : 'GSoC archive'}
              </span>
              <h1>
                {shortlistOnly ? 'Your shortlist' : 'Organization directory'}
              </h1>
              <p>
                {organizations.length.toLocaleString()} historical organizations
                {' · '}
                <a href={shortlistOnly ? '/' : '/shortlist/'}>
                  {shortlistOnly ? 'Back to directory' : 'View shortlist'}
                </a>
              </p>
            </div>
            <label className="global-search">
              <span className="sr-only">Search organizations</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
              </svg>
              <input
                type="search"
                placeholder="Search organizations, technologies, topics…"
                value={state.query}
                onChange={(event) =>
                  setState({ ...state, query: event.target.value })
                }
              />
              {state.query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setState({ ...state, query: '' })}
                >
                  ×
                </button>
              )}
            </label>
          </div>

          <div className="results-toolbar">
            <div>
              <strong>{results.length.toLocaleString()}</strong>{' '}
              {results.length === 1 ? 'organization' : 'organizations'}
              {filterCount > 0 && (
                <span className="active-filter-count">
                  {filterCount} active
                </span>
              )}
            </div>
            <div className="toolbar-actions">
              <button
                className="button secondary-button filter-trigger"
                type="button"
                onClick={() => setFiltersOpen(true)}
              >
                Filters {filterCount > 0 && `(${filterCount})`}
              </button>
              {filterCount > 0 && (
                <button
                  className="text-button clear-all"
                  type="button"
                  onClick={() => setState(defaultFilters)}
                >
                  Clear all filters
                </button>
              )}
              <label className="sort-control">
                <span>Sort</span>
                <select
                  value={state.sort}
                  onChange={(event) =>
                    setState({
                      ...state,
                      sort: event.target.value as FilterState['sort'],
                    })
                  }
                >
                  <option value="recent">Most recently participating</option>
                  <option value="projects">Most completed projects</option>
                  <option value="years">Most years participating</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {results.length ? (
            <>
              <div className="organization-grid">
                {results.slice(0, visibleLimit).map((organization) => (
                  <OrganizationCard
                    key={organization.slug}
                    organization={organization}
                    bookmarked={bookmarks.includes(organization.slug)}
                    onBookmark={toggleBookmark}
                  />
                ))}
              </div>
              {results.length > visibleLimit && (
                <div className="load-more-row">
                  <button
                    className="button secondary-button"
                    type="button"
                    onClick={() => setVisibleLimit((limit) => limit + 48)}
                  >
                    Load more organizations
                  </button>
                  <span>
                    Showing {visibleLimit.toLocaleString()} of{' '}
                    {results.length.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div aria-hidden="true">⌕</div>
              <h2>
                {shortlistOnly && !bookmarks.length
                  ? 'Your shortlist is empty'
                  : 'No organizations match'}
              </h2>
              <p>
                {shortlistOnly && !bookmarks.length
                  ? 'Bookmark organizations from the directory to compare them here.'
                  : 'Try removing an exclusion or clearing the current filters.'}
              </p>
              {shortlistOnly && !bookmarks.length ? (
                <a className="button primary-button" href="/">
                  Browse organizations
                </a>
              ) : (
                <button
                  className="button primary-button"
                  type="button"
                  onClick={() => setState(defaultFilters)}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
