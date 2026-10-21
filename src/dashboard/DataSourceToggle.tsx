// DataSourceToggle — three-segment data-source pill (4D §5): the demo
// learner mid-program, the same learner after the post-assessment, and
// live data. `role="radiogroup"` with arrow-key navigation that wraps at
// both ends. The empty-state card
// (4D §5.4) is rendered by the parent (`AnalyticsDashboard`) when live mode is
// chosen and no learner data exists; this component just owns the toggle UI
// and accessibility.

import { useRef } from 'react';

export type DataSource = 'demo' | 'demo-complete' | 'live';

interface DataSourceToggleProps {
  value: DataSource;
  onChange: (source: DataSource) => void;
}

const OPTIONS: { id: DataSource; label: string }[] = [
  { id: 'demo', label: 'Demo · in progress' },
  { id: 'demo-complete', label: 'Demo · completed' },
  { id: 'live', label: 'Live' },
];

function dataSourceLabel(source: DataSource): string {
  return OPTIONS.find((o) => o.id === source)?.label ?? source;
}

export function DataSourceToggle({ value, onChange }: DataSourceToggleProps): JSX.Element {
  const refs = useRef<Record<DataSource, HTMLButtonElement | null>>({
    demo: null,
    'demo-complete': null,
    live: null,
  });

  const handleKey = (e: React.KeyboardEvent, current: DataSource) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const index = OPTIONS.findIndex((o) => o.id === current);
      const step = e.key === 'ArrowRight' ? 1 : -1;
      const next = OPTIONS[(index + step + OPTIONS.length) % OPTIONS.length]?.id ?? current;
      onChange(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Data source"
        className="inline-flex overflow-hidden"
        style={{
          border: '1px solid rgb(var(--border))',
          background: 'rgb(var(--surface))',
          height: 36,
        }}
      >
        {OPTIONS.map((opt, i) => {
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
              className="whitespace-nowrap px-2.5 font-sans text-[13px] font-medium transition-colors duration-[160ms] sm:px-3.5"
              style={{
                minWidth: 64,
                // Active segment sits on the raised card color against the
                // recessed track, so selection reads as a lift rather than
                // an ink fill.
                color: active ? 'rgb(var(--ink))' : 'rgb(var(--tertiary))',
                background: active ? 'rgb(var(--white))' : 'transparent',
                borderLeft: i > 0 ? '1px solid rgb(var(--border))' : undefined,
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
        Switched to {dataSourceLabel(value)} data
      </span>
    </>
  );
}
