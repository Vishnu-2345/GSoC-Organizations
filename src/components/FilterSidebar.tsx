import { useState } from 'react';
import type { FilterState } from '../types';

type Option = { value: string; count: number };

type Props = {
  state: FilterState;
  options: {
    years: { value: number; count: number }[];
    categories: Option[];
    technologies: Option[];
    topics: Option[];
  };
  onChange: (next: FilterState) => void;
  onClose?: () => void;
};

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
  exclude = false,
}: {
  title: string;
  values: string[];
  options: Option[];
  onToggle: (value: string) => void;
  onReset: () => void;
  exclude?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectedOutsideTop = options.filter(
    (option, index) => index >= 40 && values.includes(option.value),
  );
  const shownOptions = expanded
    ? options
    : [...options.slice(0, 40), ...selectedOutsideTop];

  return (
    <section
      className="filter-group"
      aria-labelledby={`filter-${title.replaceAll(' ', '-').toLowerCase()}`}
    >
      <div className="filter-heading">
        <h3 id={`filter-${title.replaceAll(' ', '-').toLowerCase()}`}>
          {title}
        </h3>
        {values.length > 0 && (
          <button className="text-button" type="button" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
      <div className="filter-options">
        {shownOptions.map((option) => (
          <label className="check-row" key={option.value}>
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            <span>{exclude ? `Exclude ${option.value}` : option.value}</span>
            <small>{option.count}</small>
          </label>
        ))}
      </div>
      {options.length > 40 && (
        <button
          className="show-options-button"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? 'Show popular only'
            : `Show all ${options.length.toLocaleString()}`}
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
  return (
    <div className="filters-panel">
      <div className="filter-panel-title">
        <div>
          <span className="eyebrow">Refine results</span>
          <h2>Filters</h2>
        </div>
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

      <section className="filter-group" aria-labelledby="filter-year">
        <div className="filter-heading">
          <h3 id="filter-year">Participation year</h3>
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
        <div className="filter-options compact-options">
          {options.years.map((option) => (
            <label className="check-row" key={option.value}>
              <input
                type="checkbox"
                checked={state.years.includes(option.value)}
                onChange={() =>
                  onChange({
                    ...state,
                    years: toggle(state.years, option.value),
                  })
                }
              />
              <span>{option.value}</span>
              <small>{option.count}</small>
            </label>
          ))}
        </div>
      </section>

      <FilterGroup
        title="Categories"
        values={state.categories}
        options={options.categories}
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
        title="Exclude technologies"
        values={state.excludeTechnologies}
        options={options.technologies}
        onToggle={(value) =>
          onChange({
            ...state,
            excludeTechnologies: toggle(state.excludeTechnologies, value),
          })
        }
        onReset={() => onChange({ ...state, excludeTechnologies: [] })}
        exclude
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
      <FilterGroup
        title="Exclude topics"
        values={state.excludeTopics}
        options={options.topics}
        onToggle={(value) =>
          onChange({
            ...state,
            excludeTopics: toggle(state.excludeTopics, value),
          })
        }
        onReset={() => onChange({ ...state, excludeTopics: [] })}
        exclude
      />
    </div>
  );
}
