// DataSourceToggle — two-segment Demo / Live pill (4D §5).
// `role="radiogroup"` with arrow-key navigation. The empty-state card
// (4D §5.4) is rendered by the parent (`AdminDashboard`) when live mode is
// chosen and no learner data exists; this component just owns the toggle UI
// and accessibility.

import { useRef } from 'react';

export type DataSource = 'demo' | 'live';

interface DataSourceToggleProps {
  value: DataSource;
  onChange: (source: DataSource) => void;
}

const OPTIONS: { id: DataSource; label: string }[] = [
  { id: 'demo', label: 'Demo' },
  { id: 'live', label: 'Live' },
];

export function DataSourceToggle({ value, onChange }: DataSourceToggleProps): JSX.Element {
  const refs = useRef<Record<DataSource, HTMLButtonElement | null>>({
    demo: null,
    live: null,
  });

  const handleKey = (e: React.KeyboardEvent, current: DataSource) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next: DataSource = current === 'demo' ? 'live' : 'demo';
      onChange(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Data source"
        className="inline-flex overflow-hidden rounded-full"
        style={{
          border: '1px solid rgb(var(--border))',
          background: 'rgb(var(--surface))',
          height: 36,
        }}
      >
        {OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              ref={(el) => {
                refs.current[opt.id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(opt.id)}
              onKeyDown={(e) => handleKey(e, opt.id)}
              className="font-sans text-[14px] font-medium transition-colors duration-150"
              style={{
                width: 72,
                color: active ? 'rgb(var(--white))' : 'rgb(var(--secondary))',
                background: active ? 'rgb(var(--ink))' : 'transparent',
                borderRadius: 0,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {/* aria-live announcement, visually hidden. Updates whenever value
          changes via the parent calling onChange — we render the new label
          here so screen readers announce the switch. */}
      <span aria-live="polite" className="sr-only">
        Switched to {value} data
      </span>
    </>
  );
}
