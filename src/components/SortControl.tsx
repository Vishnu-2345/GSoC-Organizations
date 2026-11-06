import { useEffect, useRef, useState } from 'react';
import type { SortKey } from '../types';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Most recently participating' },
  { value: 'projects', label: 'Most completed projects' },
  { value: 'years', label: 'Most years participating' },
  { value: 'name', label: 'Name A–Z' },
];

export default function SortControl({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = SORT_OPTIONS.find((option) => option.value === value)!;

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className="sort-control">
      <span>Sort</span>
      <div className="sort-dropdown" ref={rootRef}>
        <button
          className="sort-trigger"
          type="button"
          ref={triggerRef}
          aria-label={`Sort organizations: ${selected.label}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{selected.label}</span>
          <svg viewBox="0 0 14 9" aria-hidden="true">
            <path d="m1 1 6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div
            className="sort-menu"
            role="menu"
            aria-label="Sort organizations"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                className="sort-option"
                type="button"
                role="menuitemradio"
                aria-checked={option.value === value}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span className="sort-option-check" aria-hidden="true">
                  ✓
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
