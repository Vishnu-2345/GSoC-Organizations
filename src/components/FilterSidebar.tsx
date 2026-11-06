import { useMemo, useState } from 'react';
import {
  filterAndSortOptions,
  type FilterOption as Option,
  type FilterOptionSort as OptionSort,
} from '../lib/filter-options';
import type { FilterState } from '../types';

type Props = {
  state: FilterState;
  options: {
    latestYear: number;
    firstTimeCount: number;
    years: { value: number; count: number }[];
    categories: Option[];
    technologies: Option[];
    topics: Option[];
  };
  onChange: (next: FilterState) => void;
  onClose?: () => void;
};

const DEFAULT_OPTIONS_DISPLAYED = 6;

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function FilterGroup({
  title,
  values,
  options,
  onToggle,
  onReset,
  sortBy = 'frequency',
}: {
  title: string;
  values: string[];
  options: Option[];
  onToggle: (value: string) => void;
  onReset: () => void;
  sortBy?: OptionSort;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const headingId = `filter-${title.replaceAll(' ', '-').toLowerCase()}`;

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingOptions = useMemo(
    () => filterAndSortOptions(options, query, sortBy),
    [options, query, sortBy],
  );
  const collapsedLimit = Math.max(DEFAULT_OPTIONS_DISPLAYED, values.length);
  const collapsedOptions = matchingOptions.slice(0, collapsedLimit);
  const selectedCollapsedOptions = matchingOptions.filter(
    (option) =>
      values.includes(option.value) &&
      !collapsedOptions.some((visible) => visible.value === option.value),
  );
  const shownOptions =
    expanded || normalizedQuery
      ? matchingOptions
      : [...collapsedOptions, ...selectedCollapsedOptions];
  const canExpand = !normalizedQuery && matchingOptions.length > collapsedLimit;

  return (
    <section className="filter-group" aria-labelledby={headingId}>
      <div className="filter-heading">
        <h3 id={headingId}>
          {title}
          {values.length > 0 && (
            <span className="filter-selected-count">{values.length}</span>
          )}
        </h3>
        {values.length > 0 && (
          <button className="text-button" type="button" onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      {options.length > DEFAULT_OPTIONS_DISPLAYED && (
        <label className="filter-option-search">
          <span className="sr-only">Search {title.toLowerCase()}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
          </svg>
          <input
            type="search"
            value={query}
            placeholder={`Search ${title.toLowerCase()}`}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      )}

      <div className="filter-options">
        {shownOptions.map((option) => (
          <label className="check-row" key={option.value}>
            <input
              type="checkbox"
              aria-label={option.value}
              checked={values.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            <span title={option.value}>{option.value}</span>
            <small>{option.count.toLocaleString()}</small>
          </label>
        ))}
        {!shownOptions.length && (
          <p className="filter-no-results">No matching options</p>
        )}
      </div>

      {(canExpand || expanded) && !normalizedQuery && (
        <button
          className="show-options-button"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? 'Show fewer'
            : `View all ${options.length.toLocaleString()}`}
        </button>
      )}
    </section>
  );
}

export default function FilterSidebar({
  state,
  options,
  onChange,
  onClose,
}: Props) {
  const selectedFilterCount =
    (state.firstTime ? 1 : 0) +
    state.years.length +
    state.categories.length +
    state.technologies.length +
    state.topics.length;

  const clearFilters = () =>
    onChange({
      ...state,
      firstTime: false,
      years: [],
      categories: [],
      technologies: [],
      topics: [],
    });

  return (
    <div className="filters-panel">
      <div className="filter-panel-title">
        <h2>Filters</h2>
        <div className="filter-panel-actions">
          {selectedFilterCount > 0 && (
            <button
              className="text-button"
              type="button"
              onClick={clearFilters}
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              className="icon-button mobile-only"
              type="button"
              aria-label="Close filters"
              onClick={onClose}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <section className="filter-group" aria-labelledby="filter-quick">
        <div className="filter-heading">
          <h3 id="filter-quick">Quick filter</h3>
          {state.firstTime && (
            <button
              className="text-button"
              type="button"
              onClick={() => onChange({ ...state, firstTime: false })}
            >
              Reset
            </button>
          )}
        </div>
        <label className="check-row">
          <input
            type="checkbox"
            aria-label={`New to GSoC in ${options.latestYear}`}
            checked={state.firstTime}
            onChange={() => onChange({ ...state, firstTime: !state.firstTime })}
          />
          <span>New to GSoC in {options.latestYear}</span>
          <small>{options.firstTimeCount.toLocaleString()}</small>
        </label>
      </section>

      <section className="filter-group" aria-labelledby="filter-year">
        <div className="filter-heading">
          <h3 id="filter-year">
            Participation year
            {state.years.length > 0 && (
              <span className="filter-selected-count">
                {state.years.length}
              </span>
            )}
          </h3>
          {state.years.length > 0 && (
            <button
              className="text-button"
              type="button"
              onClick={() => onChange({ ...state, years: [] })}
            >
              Reset
            </button>
          )}
        </div>
        <p className="filter-group-help">Must match every selected year.</p>
        <div className="filter-options compact-options">
          {options.years.map((option) => (
            <label className="check-row" key={option.value}>
              <input
                type="checkbox"
                aria-label={`Participation year ${option.value}`}
                checked={state.years.includes(option.value)}
                onChange={() =>
                  onChange({
                    ...state,
                    years: toggle(state.years, option.value),
                  })
                }
              />
              <span>{option.value}</span>
              <small>{option.count.toLocaleString()}</small>
            </label>
          ))}
        </div>
      </section>

      <FilterGroup
        title="Categories"
        values={state.categories}
        options={options.categories}
        sortBy="name"
        onToggle={(value) =>
          onChange({ ...state, categories: toggle(state.categories, value) })
        }
        onReset={() => onChange({ ...state, categories: [] })}
      />
      <FilterGroup
        title="Technologies"
        values={state.technologies}
        options={options.technologies}
        onToggle={(value) =>
          onChange({
            ...state,
            technologies: toggle(state.technologies, value),
          })
        }
        onReset={() => onChange({ ...state, technologies: [] })}
      />
      <FilterGroup
        title="Topics"
        values={state.topics}
        options={options.topics}
        onToggle={(value) =>
          onChange({ ...state, topics: toggle(state.topics, value) })
        }
        onReset={() => onChange({ ...state, topics: [] })}
      />
    </div>
  );
}
