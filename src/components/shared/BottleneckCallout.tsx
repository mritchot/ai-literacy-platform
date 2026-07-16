// BottleneckCallout — a Module 2 S6 named-concept callout that may be
// reused in Module 4 sandbox reflections (4A spec §3.4).

import type { ReactNode } from 'react';

interface BottleneckCalloutProps {
  title: string;
  accentColor?: string;
  children: ReactNode;
}

export function BottleneckCallout({
  title,
  accentColor = 'rgb(var(--discernment))', // --info
  children,
}: BottleneckCalloutProps): JSX.Element {
  return (
    <aside
      role="note"
      aria-label={`Key concept: ${title}`}
      className="border border-border bg-surface-warm"
      style={{
        borderLeft: `3px solid ${accentColor}`,
        padding: '16px 20px',
      }}
    >
      <h4 className="m-0 mb-2 font-sans text-h4 font-semibold text-ink">{title}</h4>
      <div className="font-sans text-body-sm text-body">{children}</div>
    </aside>
  );
}
