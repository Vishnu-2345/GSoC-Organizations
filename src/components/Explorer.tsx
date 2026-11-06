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
import SortControl from './SortControl';

const BOOKMARKS_KEY = 'gsoc-explorer-bookmarks-v1';
const ORGANIZATIONS_PER_BATCH = 24;

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
  const [visibleLimit, setVisibleLimit] = useState(ORGANIZATIONS_PER_BATCH);

  useEffect(() => {
    const syncStateFromUrl = () =>
      setState(parseFilterState(window.location.search));
    syncStateFromUrl();
    try {
      const stored = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
      if (Array.isArray(stored))
        setBookmarks(
          stored.filter((value): value is string => typeof value === 'string'),
        );
    } catch {
      localStorage.removeItem(BOOKMARKS_KEY);
    }
    window.addEventListener('popstate', syncStateFromUrl);
    setReady(true);
    return () => window.removeEventListener('popstate', syncStateFromUrl);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const nextUrl = `${window.location.pathname}${serializeFilterState(state)}`;
    window.history.replaceState(null, '', nextUrl);
  }, [state, ready]);

  useEffect(() => {
    setVisibleLimit(ORGANIZATIONS_PER_BATCH);
  }, [state, shortlistOnly]);

  const options = useMemo(() => {
    const yearCounts = new Map<number, number>();
    for (const organization of organizations) {
      for (const year of organization.years)
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
    }
    const latestYear = Math.max(...yearCounts.keys());
    return {
      latestYear,
      firstTimeCount: organizations.filter(
        (organization) =>
          organization.participationCount === 1 &&
          organization.latestYear === latestYear,
      ).length,
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
    const filtered = filterOrganizations(organizations, state);
    const available = shortlistOnly
      ? filtered.filter((organization) => bookmarks.includes(organization.slug))
      : filtered;
    return sortOrganizations(available, state.sort);
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
      <div className="directory-masthead">
        <header className="directory-header">
          <div className="directory-brand">
            <a
              className="directory-brand-link"
              href="/"
              aria-label="GSoC Organizations home"
            >
              <img
                className="gsoc-mark"
                src="/brand/gsoc-organizations-logo.svg"
                alt=""
                width="512"
                height="512"
              />
              <div className="directory-title">
                <h1>GSoC Organizations</h1>
              </div>
            </a>
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
        </header>
      </div>
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
          <div className="results-toolbar">
            <div>
              <strong>{results.length.toLocaleString()}</strong>{' '}
              {results.length === 1 ? 'organization' : 'organizations'}
            </div>
            <div className="toolbar-actions">
              <a
                className="button secondary-button saved-organizations-link"
                href={shortlistOnly ? '/' : '/shortlist/'}
              >
                <svg
                  className="save-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M7.25 3.5h9.5c.97 0 1.75.78 1.75 1.75v15.1L12 16.4l-6.5 3.95V5.25c0-.97.78-1.75 1.75-1.75Z" />
                </svg>
                {shortlistOnly ? 'All organizations' : 'Saved organizations'}
                {!shortlistOnly && bookmarks.length > 0 && (
                  <span className="saved-count">{bookmarks.length}</span>
                )}
              </a>
              <button
                className="button secondary-button filter-trigger"
                type="button"
                onClick={() => setFiltersOpen(true)}
              >
                Filters {filterCount > 0 && `(${filterCount})`}
              </button>
              <SortControl
                value={state.sort}
                onChange={(sort) => setState({ ...state, sort })}
              />
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
                    onClick={() =>
                      setVisibleLimit(
                        (limit) => limit + ORGANIZATIONS_PER_BATCH,
                      )
                    }
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
                  ? 'Save organizations from the directory to compare them here.'
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
